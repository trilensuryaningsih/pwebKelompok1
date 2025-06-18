'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Order Relations
      Order.belongsTo(models.User, { foreignKey: 'userId' });
      Order.hasMany(models.Payment, { foreignKey: 'orderId' });
      Order.hasMany(models.Fine, { foreignKey: 'orderId' });
      Order.hasMany(models.Feedback, { foreignKey: 'orderId' });
    }
  }
  Order.init({
    userId: DataTypes.INTEGER,
    itemType: DataTypes.ENUM('tool', 'service'),
    itemId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    status: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'),
    mouFile: DataTypes.STRING,
    notes: DataTypes.TEXT,
    totalAmount: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};