'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tool extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Tool Relations
      Tool.hasMany(models.Repair, { foreignKey: 'toolId' });
      Tool.hasMany(models.Exchange, { foreignKey: 'toolId' });
    }
  }
  Tool.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    photo: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    availableStock: DataTypes.INTEGER,
    status: DataTypes.ENUM('available', 'maintenance', 'damaged', 'lost'),
    category: DataTypes.STRING,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Tool',
  });
  return Tool;
};