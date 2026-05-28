import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/mail.js';

// ── Helpers: Token Generators ──────────────────────────────────────
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`;

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m', // Access token expires in 15 minutes
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, getRefreshSecret(), {
    expiresIn: '7d', // Refresh token expires in 7 days
  });
};

// Helper: Configure Cookie Options
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,    // Never accessible via JS
    secure:   isProd, // HTTPS only in production
    // 'none' is required for cross-origin requests (Vercel frontend → Render backend)
    // 'strict' only works when frontend and backend share the same domain
    sameSite: isProd ? 'none' : 'strict',
    path:     '/',     // Cookie available on all routes
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

const safeUser = (user) => ({
  _id:             user._id,
  name:            user.name,
  email:           user.email,
  role:            user.role,
  isActive:        user.isActive,
  isEmailVerified: user.isEmailVerified,
  createdAt:       user.createdAt,
});

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user (with verification token)
// @access  Public
// ────────────────────────────────────────────────────────────────────
export const registerUser = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Provide name, email, and password.' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Account already exists with this email.' });
    }

    // Generate random email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'employee',
      emailVerificationToken,
    });

    // Generate Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    // Print Verification link for local development
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log(`\n📬 [VERIFY EMAIL] User registered: ${user.email}`);
    console.log(`🔗 Verification Link: ${frontendUrl}/verify-email?token=${emailVerificationToken}\n`);

    // Async trigger welcome email
    sendWelcomeEmail(user).catch(err => console.error("Welcome email failed:", err));

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification email generated.',
      accessToken,
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user, issue tokens, set cookie
// @access  Public
// ────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Provide email and password.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact administrator.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set Refresh Token in Cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/logout
// @desc    Logout user, clear refresh cookies
// @access  Public
// ────────────────────────────────────────────────────────────────────
export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      // Find user and clear token in db
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    // Clear client cookie — must match the same options used when setting it
    const cookieOpts = getCookieOptions();
    res.clearCookie('refreshToken', {
      httpOnly: cookieOpts.httpOnly,
      secure:   cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path:     '/',
    });

    res.status(200).json({ success: true, message: 'Successfully logged out.' });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/refresh
// @desc    Rotate access and refresh tokens
// @access  Public
// ────────────────────────────────────────────────────────────────────
export const refreshAccessToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(token, getRefreshSecret());

    const user = await User.findOne({ _id: decoded.id, refreshToken: token });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session token.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }

    // Generate new pair (Token Rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Save new refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new Cookie
    res.cookie('refreshToken', newRefreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
// @access  Public
// ────────────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Provide email address.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if email doesn't exist for security/enumeration avoidance
      return res.status(200).json({ success: true, message: 'If account exists, a reset link has been generated.' });
    }

    // Generate 32-byte reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set expiry (1 hour)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log(`\n🔑 [PASSWORD RESET] User: ${user.email}`);
    console.log(`🔗 Reset Link: ${frontendUrl}/reset-password?token=${resetToken}\n`);

    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    sendPasswordResetEmail(user, resetUrl).catch(err => console.error("Reset email failed:", err));

    res.status(200).json({
      success: true,
      message: 'Reset instructions sent to email. Use the token to reset.',
      resetToken, // Return it for development/mock testing on client side
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process reset request.' });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/reset-password
// @desc    Verify reset token and update user password
// @access  Public
// ────────────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Provide token and new password.' });
  }

  try {
    // Hash token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    // Update password (pre-save hook hashes it automatically)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined; // Revoke active sessions on password change
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   POST /api/auth/verify-email
// @desc    Verify email using verification token
// @access  Public
// ────────────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Verification token is required.' });
  }

  try {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully. You can close this window.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify email.' });
  }
};

// ────────────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get logged-in user profile
// @access  Protected
// ────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: safeUser(req.user),
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
