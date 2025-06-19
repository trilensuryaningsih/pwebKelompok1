'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifikasis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      penerima_email: {
        type: Sequelize.STRING
      },
      id_pengajuan: {
        type: Sequelize.INTEGER
      },
      pesan: {
        type: Sequelize.TEXT
      },
      tanggal_tersedia: {
        type: Sequelize.DATE
      },
      judul: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifikasis');
  }
};