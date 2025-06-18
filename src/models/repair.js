'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Repair extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Repair Relations
      Repair.belongsTo(models.Tool, { foreignKey: 'toolId' });
      Repair.belongsTo(models.User, { foreignKey: 'requestedBy', as: 'Requester' });
      Repair.belongsTo(models.User, { foreignKey: 'verifiedBy', as: 'Verifier' });
    }
  }
  Repair.init({
    toolId: DataTypes.INTEGER,
    requestedBy: DataTypes.INTEGER,
    verifiedBy: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    status: DataTypes.ENUM('pending', 'approved', 'rejected', 'in_progress', 'completed'),
    requestDate: DataTypes.DATE,
    verificationDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Repair',
  });
  return Repair;
};