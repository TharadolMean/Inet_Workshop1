const mongoose = require('mongoose');
const res_ = require('../utils/response');

// ตรวจว่า :id เป็น ObjectId ที่ถูกต้อง
module.exports = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res_.badRequest(res, 'invalid id');
  }
  next();
};
