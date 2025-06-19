'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fine extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Fine Relations
      Fine.belongsTo(models.Order, { foreignKey: 'orderId' });
    }
  }
  Fine.init({
    orderId: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    reason: DataTypes.STRING,
    status: DataTypes.ENUM('pending', 'paid', 'waived'),
    dueDate: DataTypes.DATE,
    paidDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Fine',
  });
  return Fine;
};