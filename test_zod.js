import { hrSchemas } from './backend/middleware/validationSchemas.js';

const payload = {
  name: 'Test Employee',
  email: 'test@example.com',
  department: 'Technology',
  role: 'Developer',
  salary: 50000,
  status: 'Active',
  profileImage: 'https://images.unsplash.com/...',
  skills: ['React', 'Node.js'],
  address: 'basthi',
  bio: 'Brief summary...'
};

try {
  const result = hrSchemas.createEmployee.body.parse(payload);
  console.log("Validation successful!", result);
} catch (error) {
  console.error("Validation failed:");
  console.error(error.errors);
}
