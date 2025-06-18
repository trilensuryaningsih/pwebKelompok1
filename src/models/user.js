'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User Relations
      User.hasMany(models.Order, { foreignKey: 'userId' });
      User.hasMany(models.Notification, { foreignKey: 'userId' });
      User.hasMany(models.Feedback, { foreignKey: 'userId' });
      User.hasMany(models.Repair, { foreignKey: 'requestedBy' });
      User.hasMany(models.Repair, { foreignKey: 'verifiedBy' });
      User.hasMany(models.Exchange, { foreignKey: 'userId' });
      User.hasMany(models.Exchange, { foreignKey: 'verifiedBy' });
    }
  }
  User.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM('admin', 'user', 'pj'),
    phone: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};