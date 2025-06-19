const { Repair, Item, User } = require('../../models');
const { Op } = require('sequelize');

// Show PJ dashboard
exports.showDashboard = async (req, res) => {
  try {
    // Get repair statistics
    const totalRepairs = await Repair.count();
    const pendingRepairs = await Repair.count({
      where: { status: 'approved' }
    });
    const completedRepairs = await Repair.count({
      where: { status: 'completed' }
    });

    // Get recent repairs
    const recentRepairs = await Repair.findAll({
      include: [
        { model: Item },
        { model: User, as: 'Requester', attributes: ['name', 'email'] }
      ],
      where: { 
        status: ['approved', 'in_progress', 'completed']
      },
      order: [['requestDate', 'DESC']],
      limit: 5
    });

    const stats = {
      total: totalRepairs,
      pending: pendingRepairs,
      completed: completedRepairs
    };

    res.render('pj/dashboard', { stats, recentRepairs, path: '/pj' });
  } catch (err) {
    console.error('Error loading PJ dashboard:', err);
    res.status(500).send('Gagal memuat dashboard.');
  }
}; 