// Script untuk menambahkan fitur create fine di admin panel
// Tambahkan route ini di src/routes/admin.js

const express = require('express');
const { Fine, Order } = require('../models');

// Route untuk membuat denda dari admin panel
router.post('/fines/create', async (req, res) => {
    try {
        const { orderId, amount, reason } = req.body;
        
        // Validasi input
        if (!orderId || !amount || !reason) {
            return res.status(400).json({ 
                success: false, 
                message: 'Order ID, jumlah, dan alasan harus diisi' 
            });
        }

        // Cek order exists
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order tidak ditemukan' 
            });
        }

        // Cek apakah sudah ada denda
        const existingFine = await Fine.findOne({ where: { orderId } });
        if (existingFine) {
            return res.status(400).json({ 
                success: false, 
                message: 'Sudah ada denda untuk order ini' 
            });
        }

        // Buat denda
        const fine = await Fine.create({
            orderId: parseInt(orderId),
            amount: parseFloat(amount),
            reason: reason,
            status: 'pending',
            dueDate: new Date(),
        });

        return res.json({ 
            success: true, 
            message: 'Denda berhasil dibuat',
            data: fine 
        });

    } catch (error) {
        console.error('Error create fine:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal membuat denda' 
        });
    }
});

// Route untuk mendapatkan semua order (untuk dropdown)
router.get('/orders/list', async (req, res) => {
    try {
        const orders = await Order.findAll({
            attributes: ['id', 'user_id', 'itemId', 'startDate', 'endDate', 'status'],
            order: [['id', 'DESC']]
        });
        
        return res.json({ 
            success: true, 
            data: orders 
        });
    } catch (error) {
        console.error('Error get orders:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Gagal mengambil data order' 
        });
    }
}); 