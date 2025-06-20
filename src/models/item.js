'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Item Relations
      Item.hasMany(models.Repair, { foreignKey: 'itemId' });
      Item.hasMany(models.Exchange, { foreignKey: 'itemId' });
    }
  }
  Item.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    category: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.ENUM('available', 'maintenance', 'damaged', 'lost', 'borrowed'),
    price: DataTypes.DECIMAL,
    quantity: DataTypes.INTEGER,
    photo: DataTypes.STRING,
    location: DataTypes.STRING,
    type: DataTypes.ENUM('tool', 'service'),
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};