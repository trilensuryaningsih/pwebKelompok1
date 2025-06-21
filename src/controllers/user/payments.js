const { Payment, Order } = require('../../models');
const path = require('path');

const paymentsController = {
  // Upload & create payment
  uploadPaymentProof: async (req, res) => {
    try {
      const { id } = req.params; // order id
      const user_id = req.session.user.id;
      const { paymentMethod, paymentType } = req.body;
      const file = req.file;

      // Validasi order
      const order = await Order.findOne({ where: { id, user_id } });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }
      if (order.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Pembayaran hanya bisa dilakukan jika pesanan sudah disetujui' });
      }

      // Validasi file
      if (!file) {
        return res.status(400).json({ success: false, message: 'Bukti pembayaran wajib diupload' });
      }
      if (!paymentMethod) {
        return res.status(400).json({ success: false, message: 'Metode pembayaran wajib dipilih' });
      }
      if (!paymentType) {
        return res.status(400).json({ success: false, message: 'Tipe pembayaran wajib dipilih' });
      }

      // Simpan payment
      const payment = await Payment.create({
        orderId: id,
        amount: order.totalAmount,
        paymentMethod,
        paymentProof: file.filename,
        paymentDate: new Date(),
        paymentType: paymentType,
        status: 'paid'
      });

      // Update order status menjadi active setelah pembayaran berhasil
      await order.update({ status: 'active' });

      return res.json({ 
        success: true, 
        message: 'Pembayaran berhasil diupload dan pesanan telah diaktifkan', 
        data: payment 
      });
    } catch (error) {
      console.error('Error upload payment:', error);
      return res.status(500).json({ success: false, message: 'Gagal upload pembayaran' });
    }
  },

  // Get payment by order id
  getPaymentByOrder: async (req, res) => {
    try {
      const { id } = req.params; // order id
      const user_id = req.session.user.id;
      const order = await Order.findOne({ where: { id, user_id } });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }
      const payment = await Payment.findOne({ where: { orderId: id } });
      if (!payment) {
        return res.json({ success: true, data: null });
      }
      return res.json({ success: true, data: payment });
    } catch (error) {
      console.error('Error get payment:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data pembayaran' });
    }
  },

  // Ambil seluruh riwayat pembayaran user (Payment & Fine)
  getUserPaymentHistory: async (req, res) => {
    try {
      const user_id = req.session.user.id;
      console.log(`[DEBUG] Mengambil riwayat untuk User ID: ${user_id}`);
      
      const { Payment, Fine, Order } = require('../../models');

      // Ambil semua pembayaran pesanan user
      const payments = await Payment.findAll({
        include: [{ model: Order, where: { user_id } }],
      });
      console.log(`[DEBUG] Ditemukan ${payments.length} data pembayaran.`);


      // Ambil semua denda user
      const fines = await Fine.findAll({
        include: [{ model: Order, where: { user_id } }],
      });
      console.log(`[DEBUG] Ditemukan ${fines.length} data denda.`);

      // Gabungkan dan urutkan berdasarkan tanggal
      const history = [
        ...payments.map(p => ({
          type: 'Pembayaran',
          date: p.paymentDate,
          method: p.paymentMethod,
          amount: p.Order.totalAmount,
          proof: p.paymentProof,
          orderId: p.Order.id,
          paymentType: p.paymentType,
        })),
        ...fines.map(f => ({
          type: 'Denda',
          date: f.createdAt,
          method: '-',
          amount: f.amount,
          proof: f.paymentProof || '-',
          orderId: f.orderId,
          paymentType: '-',
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log(`[DEBUG] Total riwayat yang dikirim ke frontend: ${history.length}`);

      return res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error get payment history:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pembayaran' });
    }
  },

  // Ambil rincian denda untuk order tertentu
  getFineDetail: async (req, res) => {
    try {
      const { id } = req.params; // order id
      const user_id = req.session.user.id;
      const { Fine, Order } = require('../../models');
      const order = await Order.findOne({ where: { id, user_id } });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }
      const fine = await Fine.findOne({ where: { orderId: id } });
      if (!fine) {
        return res.json({ success: true, data: null });
      }
      return res.json({ success: true, data: fine });
    } catch (error) {
      console.error('Error get fine detail:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil rincian denda' });
    }
  },

  // Upload & create fine payment
  uploadFinePayment: async (req, res) => {
    try {
      const { id } = req.params; // order id
      const user_id = req.session.user.id;
      const { paymentMethod } = req.body;
      const file = req.file;
      const { Fine, Order } = require('../../models');
      const order = await Order.findOne({ where: { id, user_id } });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
      }
      const fine = await Fine.findOne({ where: { orderId: id } });
      if (!fine) {
        return res.status(404).json({ success: false, message: 'Denda tidak ditemukan' });
      }
      if (fine.status === 'paid') {
        return res.status(400).json({ success: false, message: 'Denda sudah dibayar' });
      }
      if (!file) {
        return res.status(400).json({ success: false, message: 'Bukti pembayaran wajib diupload' });
      }
      if (!paymentMethod) {
        return res.status(400).json({ success: false, message: 'Metode pembayaran wajib dipilih' });
      }
      await fine.update({
        paymentMethod,
        paymentProof: file.filename,
        paymentDate: new Date(),
        status: 'paid',
        paidDate: new Date()
      });
      return res.json({ success: true, message: 'Pembayaran denda berhasil diupload', data: fine });
    } catch (error) {
      console.error('Error upload fine payment:', error);
      return res.status(500).json({ success: false, message: 'Gagal upload pembayaran denda' });
    }
  },
};

module.exports = paymentsController; 