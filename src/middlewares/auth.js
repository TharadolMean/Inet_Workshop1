const jwt = require('jsonwebtoken');
const User = require('../models/User');
const res_ = require('../utils/response');

// ตรวจ JWT + ตรวจว่า user ยังมีอยู่และได้รับ Approve แล้ว
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res_.unauthorized(res, 'missing or invalid authorization header');
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res_.unauthorized(res, 'invalid or expired token');
    }

    const user = await User.findById(payload.id);
    if (!user) return res_.unauthorized(res, 'user not found');
    if (!user.isApproved) return res_.unauthorized(res, 'user is not approved');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res_.unauthorized(res, 'admin only');
  next();
};

module.exports = { authenticate, requireAdmin };
