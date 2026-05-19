"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("brands", [
      {
        id: 1,
        name: "Nike",
        slug: "nike",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
        description: "Just Do It",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Adidas",
        slug: "adidas",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
        description: "Impossible is nothing",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Uniqlo",
        slug: "uniqlo",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/9/92/UNIQLO_logo.svg",
        description: "Lifewear",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: "Zara",
        slug: "zara",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
        description: "Fast fashion",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("brands", null, {});
  },
};
