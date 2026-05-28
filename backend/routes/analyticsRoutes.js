import express from 'express';
import { getDashboardAnalytics, getAIInsights, getAdvancedAnalytics } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/insights', protect, authorize('admin', 'manager', 'finance', 'hr', 'inventory', 'supply'), getAIInsights);
router.get('/advanced', protect, authorize('admin', 'manager', 'finance', 'hr', 'inventory', 'supply'), getAdvancedAnalytics);

export default router;
