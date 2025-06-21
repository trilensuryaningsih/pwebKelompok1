const barangController = require('./barang');

const orderCreationController = {
    // Create order from pemesanan form
    createOrderFromPemesanan: async (req, res) => {
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

            // Create order using barangController
            const orderData = {
                id_item: parseInt(item_id),
                quantity: parseInt(quantity),
                tanggal_pinjam,
                tanggal_kembali,
                user_id: req.session.user.id
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
    },

    // Check item availability
    checkItemAvailability: async (req, res) => {
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
    }
};

module.exports = orderCreationController; 