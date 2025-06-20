const { Service } = require('../../models');

// Show all services
exports.showServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['name', 'ASC']]
    });

    res.render('pj/services/index', { 
      services, 
      path: '/pj/services',
      query: req.query 
    });
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).send('Gagal memuat data jasa.');
  }
};

// Show service detail
exports.showServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).send('Jasa tidak ditemukan.');
    }

    res.render('pj/services/detail', { 
      service, 
      path: '/pj/services',
      query: req.query 
    });
  } catch (err) {
    console.error('Error fetching service detail:', err);
    res.status(500).send('Gagal memuat detail jasa.');
  }
}; 