'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AlokasiBantuans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      MasterSekolahId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'MasterSekolahs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tahun: {
        type: Sequelize.STRING
      },
      tahap: {
        type: Sequelize.ENUM('1', '2'),
        allowNull: false
      },
      jumlah_penerima: {
        type: Sequelize.INTEGER
      },
      status_usulan: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.dropTable('AlokasiBantuans');
  }
};