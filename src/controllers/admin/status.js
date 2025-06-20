const { item, Fine } = require('../../models');

exports.status = (req, res) => {
    return res.render('admin/status');
}


exports.showAllitemsPage = async (req, res) => {
  try {
    const items = await item.findAll();
    res.render('admin/status', { items }); // pakai view engine (misal ejs)
  } catch (error) {
    res.status(500).send('Gagal menampilkan data');
  }
};

exports.updateFineStatus = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'waived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid' });
    }
    const fine = await Fine.findByPk(fineId);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Denda tidak ditemukan' });
    }
    await fine.update({ status });
    return res.json({ success: true, message: 'Status denda berhasil diperbarui', data: fine });
  } catch (error) {
    console.error('Error update fine status:', error);
    return res.status(500).json({ success: false, message: 'Gagal update status denda' });
  }
};

exports.getFineHistory = async (req, res) => {
  try {
    const { Fine, Order, User } = require('../../models');
    const fines = await Fine.findAll({
      include: [
        { model: Order, attributes: ['id', 'user_id', 'itemType', 'itemId', 'totalAmount'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ success: true, data: fines });
  } catch (error) {
    console.error('Error get fine history:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat denda' });
  }
};




