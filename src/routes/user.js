const express = require('express');
const barangController = require('../controllers/user/barang');
const ordersController = require('../controllers/user/orders');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Home route
router.get('/home', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user');
    }
    try {
        const items = await barangController.getAvailableItems();
        const services = await barangController.getAvailableServices();
        res.render('user/home', { items, services, user: req.session.user });
    } catch (err) {
        res.status(500).send('Gagal memuat data.');
    }
});

// Dashboard
router.get('/dashboard', (req, res, next) => {
    res.render('user/dashboard', {
        user: req.session.user
    });
});

// Pemesanan page (alat)
router.get('/pemesanan', async (req, res, next) => {
    try {
        const availableItems = await barangController.getAvailableItems();
        res.render('user/pemesanan', {
            items: availableItems,
            errorMessage: null,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading pemesanan page:', error);
        res.render('user/pemesanan', {
            items: [],
            errorMessage: 'Gagal memuat data barang. Silakan coba lagi.',
            user: req.session.user
        });
    }
});

// Pemesanan jasa (opsional, jika ada halaman khusus)
router.get('/pemesanan-jasa', async (req, res, next) => {
    try {
        const availableServices = await barangController.getAvailableServices();
        res.render('user/pemesanan-jasa', {
            services: availableServices,
            errorMessage: null,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading pemesanan jasa page:', error);
        res.render('user/pemesanan-jasa', {
            services: [],
            errorMessage: 'Gagal memuat data jasa. Silakan coba lagi.',
            user: req.session.user
        });
    }
});

// Orders page (baru)
router.get('/orders', requireAuth, (req, res, next) => {
    res.render('user/orders', {
        user: req.session.user
    });
});

// Order detail route
router.get('/orders/:id', requireAuth, (req, res, next) => {
    res.render('user/order-detail', {
        user: req.session.user
    });
});

// API endpoint to get items by category
router.get('/items/category/:kategori', async (req, res) => {
    try {
        const { kategori } = req.params;
        const items = await barangController.getItemsByCategory(kategori);
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching items by category:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to check item availability
router.get('/items/availability/:id/:quantity', async (req, res) => {
    try {
        const { id, quantity } = req.params;
        const availability = await barangController.checkItemAvailability(
            parseInt(id), 
            parseInt(quantity)
        );
        res.json(availability);
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to check service availability
router.get('/services/availability/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const availability = await barangController.checkServiceAvailability(parseInt(id));
        res.json(availability);
    } catch (error) {
        console.error('Error checking service availability:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to get available items
router.get('/items/available', async (req, res) => {
    try {
        const availableItems = await barangController.getAvailableItems();
        res.json({ success: true, data: availableItems });
    } catch (error) {
        console.error('Error fetching available items:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to get all items
router.get('/items', async (req, res) => {
    try {
        const items = await barangController.getAllItems();
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ success: false, message: 'Error fetching items' });
    }
});

// API endpoint to get all services
router.get('/services', async (req, res) => {
    try {
        const services = await barangController.getAllServices();
        res.json({ success: true, data: services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
});

// API endpoint to get available services
router.get('/services/available', async (req, res) => {
    try {
        const availableServices = await barangController.getAvailableServices();
        res.json({ success: true, data: availableServices });
    } catch (error) {
        console.error('Error fetching available services:', error);
        res.status(500).json({ success: false, message: 'Error fetching available services' });
    }
});

// API routes for orders (baru)
router.get('/orders', ordersController.getUserOrders);
router.get('/orders/:id', ordersController.getOrderById);
router.get('/orders/status/:status', ordersController.getOrdersByStatus);
router.post('/orders', ordersController.createOrder);
router.put('/orders/:id/status', ordersController.updateOrderStatus);
router.delete('/orders/:id', ordersController.cancelOrder);
router.get('/orders/stats', ordersController.getOrderStats);

// MOU, cetak-mou, status
router.get('/mou', (req, res, next) => {
    res.render('user/mou', {
        user: req.session.user
    });
});

router.get('/cetak-mou', (req, res, next) => {
    res.render('user/cetak-mou', {
        user: req.session.user
    });
});

router.get('/status', (req, res, next) => {
    res.render('user/status', {
        user: req.session.user
    });
});

module.exports = router;