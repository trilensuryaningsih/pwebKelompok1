'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Items', 'location', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Items', 'type', {
      type: Sequelize.ENUM('tool', 'service'),
      allowNull: true,
      defaultValue: 'tool'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Items', 'location');
    await queryInterface.removeColumn('Items', 'type');
  }
};
