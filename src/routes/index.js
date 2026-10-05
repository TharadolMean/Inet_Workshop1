const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middlewares/auth');
const validateId = require('../middlewares/validateId');

const auth = require('../controllers/auth.controller');
const user = require('../controllers/user.controller');
const product = require('../controllers/product.controller');
const order = require('../controllers/order.controller');

// Auth (public)
router.post('/register', auth.register);
router.post('/login', auth.login);

// ต้อง login และถูก Approve แล้วเท่านั้น
router.use(authenticate);

// Users (admin)
router.get('/users', requireAdmin, user.list);
router.put('/users/:id/approve', requireAdmin, validateId, user.approve);

// Orders (ทั้งหมด)
router.get('/orders', order.listAll);

// Products
router.get('/products', product.list);
router.post('/products', product.create);
router.get('/products/:id', validateId, product.getOne);
router.put('/products/:id', validateId, product.update);
router.delete('/products/:id', validateId, product.remove);

// Orders ใน Product
router.get('/products/:id/orders', validateId, order.listByProduct);
router.post('/products/:id/orders', validateId, order.create);

module.exports = router;
