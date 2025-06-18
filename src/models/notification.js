'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Notification Relations
      Notification.belongsTo(models.User, { foreignKey: 'userId' });
      Notification.belongsTo(models.User, { foreignKey: 'sentBy', as: 'Sender' });
    }
  }
  Notification.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    message: DataTypes.TEXT,
    type: DataTypes.ENUM('order', 'payment', 'fine', 'system', 'reminder'),
    isRead: DataTypes.BOOLEAN,
    sentBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};