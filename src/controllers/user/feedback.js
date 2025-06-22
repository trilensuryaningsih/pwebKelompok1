const { Feedback, Order, User } = require('../../models');

// Tampilkan dashboard feedback
exports.form = async (req, res) => {
  res.render('user/feedback', { user: req.session.user });
};

// Tampilkan form untuk feedback baru
exports.newForm = async (req, res) => {
  res.render('user/feedback_form', { user: req.session.user, success: req.query.success });
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
    res.redirect('/user/feedback/new?success=1');
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

// Tampilkan form edit feedback
exports.editForm = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.session.user.id;
    const feedback = await Feedback.findOne({ where: { id: feedbackId, user_id: userId } });
    if (!feedback) {
      return res.status(404).send('Feedback tidak ditemukan atau bukan milik Anda.');
    }
    res.render('user/feedback_edit', { feedback, user: req.session.user });
  } catch (err) {
    res.status(500).send('Gagal memuat form edit feedback.');
  }
};

// Proses update feedback
exports.update = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.session.user.id;
    const { comment, phone_number } = req.body;
    const feedback = await Feedback.findOne({ where: { id: feedbackId, user_id: userId } });
    if (!feedback) {
      return res.status(404).send('Feedback tidak ditemukan atau bukan milik Anda.');
    }
    feedback.comment = comment;
    feedback.phone_number = phone_number;
    await feedback.save();
    res.redirect('/user/feedback/list?success=1');
  } catch (err) {
    res.status(500).send('Gagal mengupdate feedback.');
  }
};

// Menghapus feedback oleh user
exports.deleteFeedback = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const userId = req.session.user.id;

        // Hapus feedback hanya jika feedbackId dan userId cocok
        const result = await Feedback.destroy({
            where: {
                id: feedbackId,
                user_id: userId
            }
        });

        if (result === 0) {
            return res.status(404).send('Feedback tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.');
        }

        res.redirect('/user/feedback/list');
    } catch (err) {
        console.error('Error deleting feedback by user:', err);
        res.status(500).send('Gagal menghapus feedback: ' + err.message);
    }
};

// Tampilkan daftar feedback milik user
exports.listUserFeedback = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const feedbacks = await Feedback.findAll({ where: { user_id: userId }, order: [['createdAt', 'DESC']] });
    res.render('user/feedback_list', { feedbacks, user: req.session.user, success: req.query.success });
  } catch (err) {
    console.error("Error saat memuat daftar feedback:", err);
    res.status(500).send('Gagal memuat daftar feedback. Pesan Error: ' + err.message);
  }
}; 