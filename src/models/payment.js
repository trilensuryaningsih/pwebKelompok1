'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Payment Relations
      Payment.belongsTo(models.Order, { foreignKey: 'orderId' });
    }
  }
  Payment.init({
    orderId: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    paymentMethod: DataTypes.STRING,
    paymentProof: DataTypes.STRING,
    status: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    paymentDate: DataTypes.DATE,
    paymentType: DataTypes.ENUM('deposit', 'full', 'installment')
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};