const { Repair, Item, User } = require('../../models');

// Show repair list page for PJ verification
exports.showRepairPage = async (req, res) => {
  try {
    const repairs = await Repair.findAll({
      include: [
        { model: Item },
        { model: User, as: 'Requester', attributes: ['name', 'email'] },
        { model: User, as: 'Verifier', attributes: ['name', 'email'] }
      ],
      where: { 
        status: ['approved', 'in_progress'] // Only show repairs that need PJ attention
      },
      order: [['requestDate', 'DESC']]
    });
    res.render('pj/repair/index', { repairs, query: req.query, path: '/pj/repair' });
  } catch (err) {
    console.error('Error fetching repairs:', err);
    res.status(500).send('Gagal memuat data perbaikan.');
  }
};

// PJ verifies and approves/rejects repair
exports.verifyRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    const pjId = req.session.user ? req.session.user.id : 1; // Use session user ID

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).send('Perbaikan tidak ditemukan.');
    }

    if (repair.status !== 'approved') {
      return res.status(400).send('Hanya perbaikan dengan status disetujui yang dapat diverifikasi.');
    }

    let newStatus = 'in_progress';
    let itemStatus = 'maintenance';

    if (action === 'reject') {
      newStatus = 'rejected';
      itemStatus = 'damaged';
    }

    await repair.update({
      status: newStatus,
      verifiedBy: pjId,
      verificationDate: new Date(),
      notes: notes || null
    });

    // Update item status
    await Item.update(
      { status: itemStatus },
      { where: { id: repair.itemId } }
    );

    res.redirect('/pj/repair?verify=success');
  } catch (err) {
    console.error('Error verifying repair:', err);
    res.status(500).send('Gagal memverifikasi perbaikan.');
  }
};

// PJ starts the repair process
exports.startRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const pjId = req.session.user ? req.session.user.id : 1; // Use session user ID

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).send('Perbaikan tidak ditemukan.');
    }

    if (repair.status !== 'approved') {
      return res.status(400).send('Hanya perbaikan yang sudah disetujui yang dapat dimulai.');
    }

    await repair.update({
      status: 'in_progress',
      verifiedBy: pjId,
      verificationDate: new Date()
    });

    // Update item status to maintenance
    await Item.update(
      { status: 'maintenance' },
      { where: { id: repair.itemId } }
    );

    res.redirect('/pj/repair?start=success');
  } catch (err) {
    console.error('Error starting repair:', err);
    res.status(500).send('Gagal memulai perbaikan.');
  }
};

// PJ completes the repair
exports.completeRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const { completionNotes } = req.body;
    const pjId = req.session.user ? req.session.user.id : 1; // Use session user ID

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).send('Perbaikan tidak ditemukan.');
    }

    if (repair.status !== 'in_progress') {
      return res.status(400).send('Hanya perbaikan yang sedang berlangsung yang dapat diselesaikan.');
    }

    await repair.update({
      status: 'completed',
      verifiedBy: pjId,
      verificationDate: new Date(),
      notes: completionNotes || null
    });

    // Update item status to available
    await Item.update(
      { status: 'available' },
      { where: { id: repair.itemId } }
    );

    res.redirect('/pj/repair?complete=success');
  } catch (err) {
    console.error('Error completing repair:', err);
    res.status(500).send('Gagal menyelesaikan perbaikan.');
  }
}; 