'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  item.init({
    nama: DataTypes.STRING,
    kategori: DataTypes.STRING,
    deskripsi: DataTypes.STRING,
    status: DataTypes.STRING,
    harga: DataTypes.INTEGER,
    jumlah: DataTypes.INTEGER,
    foto: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'item',
    tableName: 'items'
  });
  return item;
};