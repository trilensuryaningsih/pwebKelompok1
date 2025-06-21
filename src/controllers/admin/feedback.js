const { Feedback, User } = require('../../models');

// Menampilkan daftar semua feedback untuk admin
exports.list = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email'] // Ambil nama dan email user
      }],
      order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
    });

    res.render('admin/feedback/index', { 
      feedbacks,
      user: req.session.user,
      path: '/admin/feedback', // Untuk menandai link sidebar yang aktif
      pageTitle: 'Manajemen Feedback'
    });
  } catch (err) {
    console.error('Error fetching feedback for admin:', err);
    res.status(500).send('Gagal memuat daftar feedback: ' + err.message);
  }
}; 