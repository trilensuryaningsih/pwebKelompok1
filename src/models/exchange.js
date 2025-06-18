'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exchange extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Exchange Relations
      Exchange.belongsTo(models.User, { foreignKey: 'user_id' });
      Exchange.belongsTo(models.Item, { foreignKey: 'itemId' });
      Exchange.belongsTo(models.User, { foreignKey: 'verifiedBy', as: 'Verifier' });
    }
  }
  Exchange.init({
    user_id: DataTypes.INTEGER,
    itemId: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    photoProof: DataTypes.STRING,
    status: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
    requestDate: DataTypes.DATE,
    verifiedBy: DataTypes.INTEGER,
    verificationDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Exchange',
  });
  return Exchange;
};