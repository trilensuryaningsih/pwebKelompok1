const express = require('express');
const barangController = require('../controllers/user/barang');

const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { errorMessage: null });
});

router.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/user');
    }
    res.render('home', { user: req.session.user });
});

router.get('/register', (req, res) => {
    res.render('register', { errorMessage: null });
});

router.get('/dashboard', (req, res, next) => {
    res.render('user/dashboard', {
        user: req.session.user
    });
});

router.get('/pemesanan', async (req, res, next) => {
    try {
        const availableItems = await barangController.getAvailableItems(); // ✅ akan return array
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

router.get('/api/items/available', async (req, res) => {
    try {
        await barangController.getAvailableItems(null, res);
    } catch (error) {
        console.error('Error fetching available items:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// API endpoint to get all items
router.get('/api/items', async (req, res) => {
    try {
        const allItems = await barangController.getAllItems();
        res.json({ success: true, data: allItems });
    } catch (error) {
        console.error('Error fetching all items:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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