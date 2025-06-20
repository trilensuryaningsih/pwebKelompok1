const { Feedback, Order, User } = require('../../models');

// Tampilkan form feedback gabungan
exports.form = async (req, res) => {
  // Ambil data user dari session
  const user = req.session.user;
  res.render('user/feedback', { user });
};

// Proses submit feedback gabungan
exports.submit = async (req, res) => {
  try {
    const { comment, orderId, phone_number } = req.body;
    const userId = req.session.user.id;
    let order_id = null;
    if (orderId && orderId.trim() !== '') {
      // Validasi orderId harus ada di tabel orders
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(400).send('Nomor pesanan tidak ditemukan!');
      }
      order_id = orderId;
    }
    await Feedback.create({
      user_id: userId,
      orderId: order_id,
      comment,
      phone_number,
      status: 'pending'
    });
    res.redirect('/user/feedback?success=1');
  } catch (err) {
    console.error('Error saat insert feedback:', err);
    res.status(500).send('Gagal mengirim feedback: ' + err.message);
  }
};

// Tampilkan list order selesai untuk feedback orderan
exports.listOrderSelesai = async (req, res) => {
  const orders = await Order.findAll({
    where: { user_id: req.session.userId, status: 'completed' },
    include: [Feedback]
  });
  res.render('user/feedback_order_list', { orders });
};

// Tampilkan form feedback orderan
exports.formOrder = async (req, res) => {
  const orderId = req.params.orderId;
  res.render('user/feedback_order', { orderId });
};

// Simpan feedback orderan
exports.submitOrder = async (req, res) => {
  try {
    await Feedback.create({
      user_id: req.session.userId,
      orderId: req.body.orderId,
      type: 'order',
      rating: req.body.rating,
      comment: req.body.comment,
      status: 'pending'
    });
    res.redirect('/user/feedback/order?success=1');
  } catch (err) {
    res.status(500).send('Gagal menyimpan feedback orderan');
  }
}; 