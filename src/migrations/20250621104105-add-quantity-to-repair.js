'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Repairs', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      after: 'reason'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Repairs', 'quantity');
  }
};
