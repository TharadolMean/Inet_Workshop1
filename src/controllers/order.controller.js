const Product = require('../models/Product');
const Order = require('../models/Order');
const r = require('../utils/response');

// GET /api/v1/orders - Order ทุกรายการ
exports.listAll = async (_req, res) => {
  const orders = await Order.find()
    .populate('product', 'name price')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  return r.ok(res, orders);
};

// GET /api/v1/products/:id/orders - Order ทั้งหมดของ Product
exports.listByProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return r.badRequest(res, 'product not found');

  const orders = await Order.find({ product: product._id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  return r.ok(res, orders);
};

// POST /api/v1/products/:id/orders - เพิ่ม Order และหักออกจาก stock
exports.create = async (req, res) => {
  const { quantity } = req.body || {};
  if (!Number.isInteger(quantity) || quantity < 1) {
    return r.badRequest(res, 'quantity must be an integer >= 1');
  }

  // หัก stock แบบ atomic: จะสำเร็จเฉพาะตอน stock >= quantity
  // ป้องกัน race condition กรณีมีหลาย request สั่งพร้อมกัน
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    { new: true }
  );

  if (!product) {
    // แยกสาเหตุ: ไม่พบ product หรือ stock ไม่พอ
    const exists = await Product.exists({ _id: req.params.id });
    return r.badRequest(res, exists ? 'cannot create order: quantity exceeds stock' : 'product not found');
  }

  try {
    const order = await Order.create({
      product: product._id,
      user: req.user._id,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
    });
    return r.created(res, order);
  } catch (err) {
    // บันทึก Order ไม่สำเร็จ -> คืน stock
    await Product.updateOne({ _id: product._id }, { $inc: { stock: quantity } });
    throw err;
  }
};
