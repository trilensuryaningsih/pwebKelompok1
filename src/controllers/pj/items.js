const { Item, Repair } = require('../../models');
const { Op } = require('sequelize');

// Show all items with their status
exports.showItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        {
          model: Repair,
          where: { status: ['approved', 'in_progress'] },
          required: false
        }
      ],
      order: [['name', 'ASC']]
    });

    // Get repair statistics for each item
    const itemsWithStats = items.map(item => {
      const activeRepairs = item.Repairs ? item.Repairs.length : 0;
      return {
        ...item.toJSON(),
        activeRepairs
      };
    });

    res.render('pj/items/index', { 
      items: itemsWithStats, 
      path: '/pj/items',
      query: req.query 
    });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).send('Gagal memuat data alat.');
  }
};

// Show add item form
exports.showAddItem = async (req, res) => {
  try {
    res.render('pj/items/add', { path: '/pj/items/add' });
  } catch (err) {
    console.error('Error showing add item form:', err);
    res.status(500).send('Gagal memuat form tambah alat.');
  }
};

// Add new item
exports.addItem = async (req, res) => {
  try {
    const { name, description, category, quantity, location } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || !quantity || !location) {
      return res.status(400).send('Semua field harus diisi.');
    }

    // Create new item
    await Item.create({
      name,
      description,
      category,
      quantity: parseInt(quantity),
      location,
      status: 'available',
      type: 'tool' // Default to tool type
    });

    res.redirect('/pj/items?add=success');
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).send('Gagal menambahkan alat.');
  }
};

// Show item detail
exports.showItemDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findByPk(id, {
      include: [
        {
          model: Repair,
          include: [
            { model: require('../../models').User, as: 'Requester', attributes: ['name', 'email'] },
            { model: require('../../models').User, as: 'Verifier', attributes: ['name', 'email'] }
          ],
          order: [['requestDate', 'DESC']]
        }
      ]
    });

    if (!item) {
      return res.status(404).send('Alat tidak ditemukan.');
    }

    res.render('pj/items/detail', { 
      item, 
      path: '/pj/items',
      query: req.query 
    });
  } catch (err) {
    console.error('Error fetching item detail:', err);
    res.status(500).send('Gagal memuat detail alat.');
  }
}; 