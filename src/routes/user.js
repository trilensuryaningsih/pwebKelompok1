const express = require('express');
const barangController = require('../controllers/user/barang');
const ordersController = require('../controllers/user/orders');
const { requireAuth, requireRole } = require('../middleware/auth');
const { Item, Service } = require('../models');

const router = express.Router();

// Terapkan middleware otentikasi dan otorisasi untuk semua rute user
router.use(requireAuth);
router.use(requireRole(['user']));

router.get('/home', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user');
    }
    try {
        const items = await Item.findAll({ where: { status: 'available' }, order: [['name', 'ASC']] });
        const services = await Service.findAll({ order: [['name', 'ASC']] });
        res.render('user/home', { items, services, user: req.session.user });
    } catch (err) {
        res.status(500).send('Gagal memuat data.');
    }
});


router.get('/dashboard', (req, res, next) => {
    res.render('user/dashboard', {
        user: req.session.user
    });
});

router.get('/orders', requireAuth, (req, res, next) => {
    // Render the orders page - the JavaScript will load the data via API
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

// POST route for creating orders
router.post('/pemesanan', async (req, res) => {
    try {
        const { item_id, quantity, tanggal_pinjam, tanggal_kembali } = req.body;
        
        // Validate input
        if (!item_id || !quantity || !tanggal_pinjam || !tanggal_kembali) {
            return res.status(400).json({ 
                success: false, 
                message: 'Semua field harus diisi' 
            });
        }

        // Validate dates
        const pinjamDate = new Date(tanggal_pinjam);
        const kembaliDate = new Date(tanggal_kembali);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (pinjamDate < today) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tanggal peminjaman tidak boleh kurang dari hari ini' 
            });
        }

        if (kembaliDate <= pinjamDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Tanggal pengembalian harus setelah tanggal peminjaman' 
            });
        }

        // Create order
        const orderData = {
            id_item: parseInt(item_id),
            quantity: parseInt(quantity),
            tanggal_pinjam,
            tanggal_kembali,
            user_id: req.session.user ? req.session.user.id : null
        };

        const result = await barangController.createOrder(orderData);
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Pesanan berhasil dibuat!',
                redirect: '/user/status'
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: result.message 
            });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan server. Silakan coba lagi.' 
        });
    }
});

// API endpoint to get items by category
router.get('/api/items/category/:kategori', async (req, res) => {
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
router.get('/api/items/availability/:id/:quantity', async (req, res) => {
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

// API Routes for Orders
router.get('/api/orders', ordersController.getUserOrders);
router.get('/api/orders/:id', ordersController.getOrderById);
router.get('/api/orders/status/:status', ordersController.getOrdersByStatus);
router.post('/api/orders', ordersController.createOrder);
router.put('/api/orders/:id/status', ordersController.updateOrderStatus);
router.delete('/api/orders/:id', ordersController.cancelOrder);
router.get('/api/orders/stats', ordersController.getOrderStats);

// API Routes for Items and Services
router.get('/api/items', async (req, res) => {
    try {
        const items = await Item.findAll({
            order: [['id', 'ASC']]
        });
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ success: false, message: 'Error fetching items' });
    }
});

router.get('/api/services', async (req, res) => {
    try {
        const services = await Service.findAll({
            order: [['id', 'ASC']]
        });
        res.json({ success: true, data: services });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
});

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