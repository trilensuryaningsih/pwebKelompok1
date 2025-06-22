const { Repair, Item, User } = require('../../models');

// Fungsi untuk mengecek data repair (temporary)
exports.checkRepairData = async (req, res) => {
  try {
    console.log('=== CHECKING REPAIR DATA ===');
    
    // Cek jumlah data repair
    const repairCount = await Repair.count();
    console.log('Total repair records:', repairCount);
    
    // Cek jumlah data item
    const itemCount = await Item.count();
    console.log('Total item records:', itemCount);
    
    // Cek jumlah data user
    const userCount = await User.count();
    console.log('Total user records:', userCount);
    
    // Coba ambil data repair tanpa include dulu
    const repairsSimple = await Repair.findAll();
    console.log('Repair data (simple):', repairsSimple.length);
    
    res.json({
      repairCount,
      itemCount,
      userCount,
      repairsSimple: repairsSimple.length
    });
  } catch (err) {
    console.error('Error checking repair data:', err);
    res.status(500).json({ error: err.message });
  }
};

// Show repair list page
exports.showRepairPage = async (req, res) => {
  try {
    console.log('Mencoba mengambil data repair...');
    
    const repairs = await Repair.findAll({
      include: [
        { model: Item },
        { model: User, as: 'Requester', attributes: ['name', 'email'] },
        { model: User, as: 'Verifier', attributes: ['name', 'email'] }
      ],
      order: [['requestDate', 'DESC']]
    });
    
    console.log(`Berhasil mengambil ${repairs.length} data repair`);
    
    res.render('admin/repair/index', { 
      repairs,
      path: '/admin/repair' // Variabel 'path' yang dibutuhkan sidebar
    });
  } catch (err) {
    console.error('Error detail saat mengambil data repair:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).send('Gagal memuat data perbaikan. Error: ' + err.message);
  }
};

// Show create repair form
exports.showCreateRepairPage = async (req, res) => {
  try {
    const items = await Item.findAll({
      order: [['name', 'ASC']]
    });
    res.render('admin/repair/create', { items });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send('Gagal memuat data item.');
  }
};

// Create repair request
exports.createRepair = async (req, res) => {
  try {
    const { itemId, reason, quantity } = req.body;
    const adminId = 1; // Default admin ID, should be replaced with actual user authentication

    // Validate quantity
    const repairQuantity = parseInt(quantity);
    if (!repairQuantity || repairQuantity < 1) {
      return res.status(400).send('Jumlah alat tidak valid.');
    }

    // Get the item to check current quantity
    const item = await Item.findByPk(itemId);
    if (!item) {
      return res.status(404).send('Alat tidak ditemukan.');
    }

    if (repairQuantity > item.quantity) {
      return res.status(400).send('Jumlah alat yang diajukan melebihi jumlah yang tersedia.');
    }

    // Create repair record
    await Repair.create({
      itemId,
      requestedBy: adminId,
      reason,
      quantity: repairQuantity,
      status: 'pending',
      requestDate: new Date()
    });

    // Update item quantity (subtract repair quantity from available quantity)
    const newAvailableQuantity = Math.max(0, item.quantity - repairQuantity);
    
    // Determine new item status based on remaining quantity
    let newItemStatus = item.status;
    if (newAvailableQuantity < 1) {
      newItemStatus = 'maintenance'; // Change to maintenance if quantity < 1
    } else {
      newItemStatus = 'available'; // Keep as available if quantity >= 1
    }

    await item.update({
      quantity: newAvailableQuantity,
      status: newItemStatus
    });

    res.redirect('/admin/repair?create=success');
  } catch (err) {
    console.error('Error creating repair:', err);
    res.status(500).send('Gagal mengajukan perbaikan.');
  }
};

// Update repair status
exports.updateRepairStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = 1; // Default admin ID, should be replaced with actual user authentication

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).send('Perbaikan tidak ditemukan.');
    }

    await repair.update({
      status,
      verifiedBy: adminId,
      verificationDate: new Date()
    });

    // Update item status based on repair status
    let itemStatus = 'available';
    if (status === 'in_progress') {
      itemStatus = 'maintenance';
    } else if (status === 'completed') {
      itemStatus = 'available';
    }

    await Item.update(
      { status: itemStatus },
      { where: { id: repair.itemId } }
    );

    res.redirect('/admin/repair?update=success');
  } catch (err) {
    console.error('Error updating repair:', err);
    res.status(500).send('Gagal mengupdate status perbaikan.');
  }
};

// Delete repair
exports.deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;
    
    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).send('Perbaikan tidak ditemukan.');
    }

    // Only allow deletion if status is pending
    if (repair.status !== 'pending') {
      return res.status(400).send('Hanya perbaikan dengan status pending yang dapat dihapus.');
    }

    await repair.destroy();
    res.redirect('/admin/repair?delete=success');
  } catch (err) {
    console.error('Error deleting repair:', err);
    res.status(500).send('Gagal menghapus perbaikan.');
  }
}; 