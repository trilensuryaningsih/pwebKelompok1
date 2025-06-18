'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Feedback Relations
      Feedback.belongsTo(models.User, { foreignKey: 'userId' });
      Feedback.belongsTo(models.Order, { foreignKey: 'orderId' });
    }
  }
  Feedback.init({
    userId: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    status: DataTypes.ENUM('pending', 'approved', 'rejected')
  }, {
    sequelize,
    modelName: 'Feedback',
  });
  return Feedback;
};