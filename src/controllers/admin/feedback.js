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

// Mengubah status feedback (approve/reject)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' atau 'rejected'

    await Feedback.update({ status }, { where: { id } });
    res.redirect('/admin/feedback');
  } catch (err) {
    console.error('Error updating feedback status:', err);
    res.status(500).send('Gagal mengubah status feedback: ' + err.message);
  }
};

// Menghapus feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.destroy({ where: { id } });
    res.redirect('/admin/feedback');
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).send('Gagal menghapus feedback: ' + err.message);
  }
}; 