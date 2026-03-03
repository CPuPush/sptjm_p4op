'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SptjmTransaksis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      AlokasiBantuanId: {
        type: Sequelize.INTEGER,
        references: { 
          model: 'AlokasiBantuans', 
          key: 'id' 
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: { 
          model: 'Users', 
          key: 'id' 
        }
      },
      nama: {
        type: Sequelize.STRING
      },
      no_urut_harian: {
        type: Sequelize.INTEGER
      },
      no_surat: {
        type: Sequelize.STRING
      },
      no_telp: {
        type: Sequelize.STRING
      },
      jmlh_siswa: {
        type: Sequelize.INTEGER
      },
      spp: {
        type: Sequelize.BIGINT
      },
      bulan: {
        type: Sequelize.INTEGER
      },
      total: {
        type: Sequelize.BIGINT
      },
      is_ppdb_bersama: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tgl_terima: {
        type: Sequelize.DATE
      },
      status_ambil: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      tgl_ambil_realisasi: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('SptjmTransaksis');
  }
};