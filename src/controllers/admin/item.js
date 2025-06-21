const { Item, Service } = require('../../models');
const path = require('path');

// List all items (for page)
exports.showAllItemsPage = async (req, res) => {
  try {
    const items = await Item.findAll();
    const services = await Service.findAll();
    // Map and normalize both to a common structure
    const itemList = items.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      photo: i.photo,
      status: i.status,
      category: i.category,
      price: i.price,
      quantity: i.quantity,
      type: 'item',
      createdAt: i.createdAt,
      updatedAt: i.updatedAt
    }));
    const serviceList = services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      photo: s.photo,
      status: s.status,
      category: s.category,
      price: s.price,
      quantity: '-',
      type: 'service',
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));
    // Gabungkan dan urutkan berdasarkan tipe (item dulu, kemudian service)
    const allItems = [...itemList, ...serviceList]
      .sort((a, b) => {
        // Sort by type first (item before service)
        if (a.type !== b.type) {
          return a.type === 'item' ? -1 : 1;
        }
        // Then sort by name within each type
        return a.name.localeCompare(b.name);
      })
      .map((item, idx) => ({ ...item, no: idx + 1 }));
    res.render('admin/items/index', { items: allItems });
  } catch (err) {
    res.status(500).send('Gagal memuat data item.');
  }
};

// Get item details (API)
exports.getItemDetails = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { type } = req.query;
    
    let item;
    if (type === 'service') {
      item = await Service.findByPk(itemId);
    } else {
      item = await Item.findByPk(itemId);
    }
    
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan.' });
    
    // Log the item data for debugging
    console.log('Item data:', {
      id: item.id,
      name: item.name,
      category: item.category,
      type: type
    });
    
    res.json(item);
  } catch (err) {
    console.error('Error in getItemDetails:', err);
    res.status(500).json({ message: 'Gagal mengambil detail item.' });
  }
};

// Create Service (POST)
exports.createItem = async (req, res) => {
  try {
    console.log('=== CREATE SERVICE DEBUG ===');
    console.log('Request body:', req.body);
    console.log('File uploaded:', req.file);
    
    const { nama, kategori, deskripsi, harga, name, category, description, price } = req.body;
    const foto = req.file ? req.file.filename : null;

    // Gunakan field yang tersedia (bisa bahasa Indonesia atau Inggris)
    const serviceData = {
      name: name || nama || '',
      category: category || kategori || '',
      description: description || deskripsi || '',
      status: 'available',
      price: parseFloat(price || harga || 0),
      photo: foto,
    };
    
    console.log('Service data to create:', serviceData);
    
    const newService = await Service.create(serviceData);
    console.log('Service created successfully:', newService.id);
    
    res.redirect('/admin/items/create?success=true');
  } catch (err) {
    console.error('=== CREATE SERVICE ERROR ===');
    console.error(err);
    res.status(500).send('Gagal menambah jasa: ' + err.message);
  }
};

// Update item (POST)
exports.updateItem = async (req, res) => {
  try {
    const { name, category, description, status, price, quantity, type } = req.body;
    const foto = req.file ? req.file.filename : null;
    
    console.log('=== UPDATE ITEM DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    console.log('File uploaded:', req.file);
    
    // Determine type if not provided
    let itemType = type;
    if (!itemType) {
      // Try to determine type by checking if item exists in either model
      const itemExists = await Item.findByPk(req.params.id);
      const serviceExists = await Service.findByPk(req.params.id);
      
      if (itemExists && !serviceExists) {
        itemType = 'item';
      } else if (serviceExists && !itemExists) {
        itemType = 'service';
      } else {
        throw new Error('Tidak dapat menentukan tipe item');
      }
    }
    
    console.log('Determined type:', itemType);
    
    let updateData = {
      name: name || '',
      category: category || '',
      description: description || '',
      status: status || 'available'
    };
    
    if (itemType === 'service') {
      updateData.price = parseFloat(price) || 0;
      console.log('Service price:', updateData.price);
    } else {
      updateData.quantity = parseInt(quantity) || 0;
      updateData.price = null;
      console.log('Item quantity:', updateData.quantity);
    }
    
    if (foto) {
      updateData.photo = foto;
      console.log('New photo:', foto);
    }
    
    console.log('Final update data:', updateData);
    
    let result;
    if (itemType === 'service') {
      result = await Service.update(updateData, { where: { id: req.params.id } });
      console.log('Service update result:', result);
    } else {
      result = await Item.update(updateData, { where: { id: req.params.id } });
      console.log('Item update result:', result);
    }
    
    if (result[0] === 0) {
      throw new Error('Tidak ada data yang diupdate');
    }
    
    console.log('=== UPDATE SUCCESS ===');
    res.redirect('/admin/items?update=success');
  } catch (err) {
    console.error('=== UPDATE ERROR ===');
    console.error('Error in updateItem:', err);
    res.status(500).send('Gagal mengupdate item: ' + err.message);
  }
};

// Delete item (POST, non-API)
exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { type } = req.body;
    
    let deleted = false;
    if (type === 'service') {
      deleted = await Service.destroy({ where: { id } });
    } else {
      deleted = await Item.destroy({ where: { id } });
    }
    
    if (!deleted) return res.status(404).send('Item tidak ditemukan.');
    res.redirect('/admin/items?delete=success');
  } catch (err) {
    res.status(500).send('Gagal menghapus item.');
  }
};

// Tampilkan halaman form tambah item
exports.showCreateItemPage = (req, res) => {
  res.render('admin/items/create');
};

// Tampilkan halaman detail item
exports.showItemDetailPage = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Try to find in Item model first
    let item = await Item.findByPk(itemId);
    let itemType = 'item';
    
    // If not found in Item, try Service model
    if (!item) {
      item = await Service.findByPk(itemId);
      itemType = 'service';
    }
    
    if (!item) return res.status(404).send('Item tidak ditemukan.');
    
    // Add type to item object
    item = item.toJSON();
    item.type = itemType;
    
    res.render('admin/items/detail', { item });
  } catch (err) {
    res.status(500).send('Gagal memuat detail item.');
  }
};

// Tampilkan halaman konfirmasi hapus item
exports.showDeleteItemPage = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Try to find in Item model first
    let item = await Item.findByPk(itemId);
    let itemType = 'item';
    
    // If not found in Item, try Service model
    if (!item) {
      item = await Service.findByPk(itemId);
      itemType = 'service';
    }
    
    if (!item) return res.status(404).send('Item tidak ditemukan.');
    
    // Add type to item object
    item = item.toJSON();
    item.type = itemType;
    
    res.render('admin/items/delete', { item });
  } catch (err) {
    res.status(500).send('Gagal memuat halaman hapus item.');
  }
};
