'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_id extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_id.init({
    nama: DataTypes.STRING,
    password: DataTypes.STRING,
    no_hp: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    role: {
      type: DataTypes.ENUM,
      values: ['admin', 'user', 'pj'],
      allowNull: false,
      defaultValue: 'user' // Set default role to 'user'
    }
  }, {
    sequelize,
    modelName: 'user_id',
  });
  return user_id;
};