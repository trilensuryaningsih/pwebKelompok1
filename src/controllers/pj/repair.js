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
        status: ['pending', 'in_progress'] // Include pending repairs that need PJ attention
      },
      order: [['requestDate', 'DESC']]
    });
    res.render('pj/repair/index', { repairs, query: req.query, path: '/pj/repair' });
  } catch (err) {
    console.error('Error fetching repairs:', err);
    res.status(500).send('Gagal memuat data perbaikan.');
  }
};

// PJ verifies and approves repair
exports.verifyRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const pjId = req.session.user ? req.session.user.id : 1; // Use session user ID

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).send('Perbaikan tidak ditemukan.');
    }

    if (repair.status !== 'pending') {
      return res.status(400).send('Hanya perbaikan dengan status diajukan yang dapat diverifikasi.');
    }

    // Get the item to handle status
    const item = await Item.findByPk(repair.itemId);
    if (!item) {
      return res.status(404).send('Alat tidak ditemukan.');
    }

    // Approve the repair and set status to in_progress
    await repair.update({
      status: 'in_progress',
      verifiedBy: pjId,
      verificationDate: new Date(),
      notes: notes || null
    });

    // Determine item status based on current quantity
    let newItemStatus = 'available';
    if (item.quantity < 1) {
      newItemStatus = 'maintenance';
    }
    await item.update({
      status: newItemStatus
    });

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

    // Get the item to restore quantity
    const item = await Item.findByPk(repair.itemId);
    if (!item) {
      return res.status(404).send('Alat tidak ditemukan.');
    }

    await repair.update({
      status: 'completed',
      verifiedBy: pjId,
      verificationDate: new Date(),
      notes: completionNotes || null
    });

    // Restore item quantity and determine status based on restored quantity
    const restoredQuantity = item.quantity + repair.quantity;
    
    // Determine new item status based on restored quantity
    let newItemStatus = 'available';
    if (restoredQuantity < 1) {
      newItemStatus = 'maintenance'; // Still no available items
    }
    
    await item.update({
      status: newItemStatus,
      quantity: restoredQuantity
    });

    res.redirect('/pj/repair?complete=success');
  } catch (err) {
    console.error('Error completing repair:', err);
    res.status(500).send('Gagal menyelesaikan perbaikan.');
  }
}; 