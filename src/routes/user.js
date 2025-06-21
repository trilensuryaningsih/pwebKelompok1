const express = require('express');
const barangController = require('../controllers/user/barang');
const ordersController = require('../controllers/user/orders');
const paymentsController = require('../controllers/user/payments');
const pageController = require('../controllers/user/pages');
const orderCreationController = require('../controllers/user/orderCreation');
const servicesController = require('../controllers/user/services');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Page routes
router.get('/home', pageController.renderHome);
router.get('/dashboard', pageController.renderDashboard);
router.get('/orders', requireAuth, pageController.renderOrders);
router.get('/orders/:id', requireAuth, pageController.renderOrderDetail);
router.get('/mou', pageController.renderMou);
router.get('/cetak-mou', pageController.renderCetakMou);
router.get('/status', pageController.renderStatus);
router.get('/payments', requireAuth, pageController.renderPaymentsHistory);
router.get('/payments/history-page', requireAuth, pageController.renderPaymentsHistory);
router.get('/payments/:type/:id', requireAuth, pageController.renderPaymentDetail);

// Order creation route
router.post('/pemesanan', requireAuth, orderCreationController.createOrderFromPemesanan);

// API Routes for Items (using barangController)
router.get('/api/items', barangController.getAllItems);
router.get('/api/items/category/:kategori', barangController.getItemsByCategory);
router.get('/api/items/availability/:id/:quantity', orderCreationController.checkItemAvailability);

// API Routes for Orders (using ordersController)
router.get('/api/orders', ordersController.getUserOrders);
router.get('/api/orders/:id', ordersController.getOrderById);
router.get('/api/orders/status/:status', ordersController.getOrdersByStatus);
router.post('/api/orders', ordersController.createOrder);
router.put('/api/orders/:id/status', ordersController.updateOrderStatus);
router.delete('/api/orders/:id', ordersController.cancelOrder);
router.get('/api/orders/stats', ordersController.getOrderStats);

// API Routes for Services (using servicesController)
router.get('/api/services', servicesController.getAllServices);

// Payment routes (using paymentsController)
router.post('/orders/:id/payment', requireAuth, upload.single('paymentProof'), paymentsController.uploadPaymentProof);
router.get('/orders/:id/payment', requireAuth, paymentsController.getPaymentByOrder);
router.get('/payments/history', requireAuth, paymentsController.getUserPaymentHistory);
router.get('/orders/:id/fine', requireAuth, paymentsController.getFineDetail);
router.post('/orders/:id/fine/payment', requireAuth, upload.single('paymentProof'), paymentsController.uploadFinePayment);

module.exports = router;