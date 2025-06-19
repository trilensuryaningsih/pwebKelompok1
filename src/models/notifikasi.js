'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notifikasi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  notifikasi.init({
    penerima_email: DataTypes.STRING,
    id_pengajuan: DataTypes.INTEGER,
    pesan: DataTypes.TEXT,
    tanggal_tersedia: DataTypes.DATE,
    judul: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'notifikasi',
  });
  return notifikasi;
};