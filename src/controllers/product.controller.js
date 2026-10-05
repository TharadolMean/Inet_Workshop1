const Product = require('../models/Product');
const Order = require('../models/Order');
const r = require('../utils/response');

const validateProductBody = (body, { partial = false } = {}) => {
  const { name, price, stock } = body || {};
  if (!partial) {
    if (!name) return 'name is required';
    if (price === undefined) return 'price is required';
  }
  if (name !== undefined && !String(name).trim()) return 'name must not be empty';
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return 'price must be a number >= 0';
  }
  if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
    return 'stock must be an integer >= 0';
  }
  return null;
};

// GET /api/v1/products
exports.list = async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  return r.ok(res, products);
};

// GET /api/v1/products/:id
exports.getOne = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return r.badRequest(res, 'product not found');
  return r.ok(res, product);
};

// POST /api/v1/products
exports.create = async (req, res) => {
  const error = validateProductBody(req.body);
  if (error) return r.badRequest(res, error);

  const { name, description, price, stock } = req.body;
  const product = await Product.create({ name, description, price, stock });
  return r.created(res, product);
};

// PUT /api/v1/products/:id
exports.update = async (req, res) => {
  const error = validateProductBody(req.body, { partial: true });
  if (error) return r.badRequest(res, error);

  const { name, description, price, stock } = req.body;
  const update = Object.fromEntries(
    Object.entries({ name, description, price, stock }).filter(([, v]) => v !== undefined)
  );

  const product = await Product.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!product) return r.badRequest(res, 'product not found');
  return r.ok(res, product);
};

// DELETE /api/v1/products/:id  (ลบ Order ของ product นั้นด้วย)
exports.remove = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return r.badRequest(res, 'product not found');
  await Order.deleteMany({ product: product._id });
  return r.ok(res, product, 'deleted');
};
