const User = require('../models/User');
const r = require('../utils/response');

// GET /api/v1/users  (admin) - ดูรายชื่อ user ทั้งหมด ใช้หา id ที่รอ approve
// ?isApproved=false เพื่อกรองเฉพาะที่ยังไม่ approve
exports.list = async (req, res) => {
  const filter = {};
  if (req.query.isApproved !== undefined) {
    filter.isApproved = req.query.isApproved === 'true';
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  return r.ok(res, users);
};

// PUT /api/v1/users/:id/approve  (admin)
exports.approve = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!user) return r.badRequest(res, 'user not found');
  return r.ok(res, user, 'user approved');
};
