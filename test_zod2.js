import { hrSchemas } from './backend/middleware/validationSchemas.js';

const payload = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '',
  department: 'Technology',
  role: 'Developer',
  salary: 50000,
  status: 'Active',
  bio: '',
  address: '',
  skills: [],
  profileImage: '',
};

try {
  const result = hrSchemas.createEmployee.body.parse(payload);
  console.log("Validation successful!");
} catch (error) {
  console.error("Validation failed:");
  console.error(JSON.stringify(error.errors, null, 2));
}
