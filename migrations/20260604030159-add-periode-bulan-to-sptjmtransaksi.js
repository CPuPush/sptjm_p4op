'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('SptjmTransaksis', 'periode_bulan', {
         type: Sequelize.STRING,
         allowNull: true,
         defaultValue: '-' // Memberikan default '-' agar data lama tidak kosong (NULL)
       });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('SptjmTransaksis', 'periode_bulan');
  }
};
// npx sequelize-cli migration:generate --name add-periode-bulan-to-sptjmtransaksi