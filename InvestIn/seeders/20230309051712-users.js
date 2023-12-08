'use strict';
const fs=require('fs')

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
    const data= JSON.parse(fs.readFileSync("./data/users.json","UTF-8")).map((el)=>{
      el.createdAt=el.updatedAt=new Date()
      return el
     })
     await queryInterface.bulkInsert("Users",data)
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Users",data)
  }
};
