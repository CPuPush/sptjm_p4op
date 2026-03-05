'use strict';
const { hashPassword } = require("../helper/bcrypt");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   const users = [
      {
        username: 'forioktopakpahan',
        email: 'forioktopakpahan@p4op.com',
        password: hashPassword('administrator'),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'hadilesmana',
        email: 'hadilesmana@p4op.com',
        password: hashPassword('hadilesmana'),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'kasatpelpengaduan_trisno',
        email: 'trisno@p4op.com',
        password: hashPassword('kasatpelpengaduan'),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'kasatpelpersonal_sukron',
        email: 'sukron@p4op.com',
        password: hashPassword('kasatpelpersonal'),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    return queryInterface.bulkInsert('Users', users, {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
