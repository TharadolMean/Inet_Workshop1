require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = require('./app');
const User = require('./models/User');

const PORT = process.env.PORT || 3000;

// สร้าง admin เริ่มต้นถ้ายังไม่มี (admin ต้องมีก่อน เพราะเป็นคน approve user)
const seedAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) return;

  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin1234', 10);
  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password,
    role: 'admin',
    isApproved: true,
  });
  console.log(`Seeded admin user: ${email}`);
};

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  await seedAdmin();
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/api/v1`));
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
