'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Service.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    photo: DataTypes.STRING,
    status: DataTypes.ENUM('available', 'unavailable', 'maintenance'),
    category: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Service',
    hooks: {
      beforeSave: (service) => {
        // Update status berdasarkan quantity
        if (service.quantity === 0) {
          service.status = 'unavailable';
        } else if (service.quantity >= 1) {
          service.status = 'available';
        }
      },
      beforeUpdate: (service) => {
        // Update status berdasarkan quantity
        if (service.quantity === 0) {
          service.status = 'unavailable';
        } else if (service.quantity >= 1) {
          service.status = 'available';
        }
      }
    }
  });
  return Service;
};