const { Item, Service } = require('../../models');

exports.index = (req, res) => {
    return res.render('index/landing');
}

exports.home = async (req, res) => {
  try {
    const items = await Item.findAll({ where: { status: 'available' }, order: [['name', 'ASC']] });
    const services = await Service.findAll({ order: [['name', 'ASC']] });
    res.render('user/home', { items, services, user: req.session.user });
  } catch (err) {
    res.status(500).send('Gagal memuat data.');
  }
};