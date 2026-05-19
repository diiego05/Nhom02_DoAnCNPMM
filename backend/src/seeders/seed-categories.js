"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("categories", [
      {
        id: 1,
        name: "Nam",
        slug: "nam",
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Nữ",
        slug: "nu",
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Áo nam",
        slug: "ao-nam",
        parent_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: "Quần nam",
        slug: "quan-nam",
        parent_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        name: "Áo nữ",
        slug: "ao-nu",
        parent_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        name: "Chân váy",
        slug: "chan-vay",
        parent_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        name: "Áo thun nam",
        slug: "ao-thun-nam",
        parent_id: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 8,
        name: "Áo sơ mi nam",
        slug: "ao-so-mi-nam",
        parent_id: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 9,
        name: "Quần jean nam",
        slug: "quan-jean-nam",
        parent_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 10,
        name: "Quần short nam",
        slug: "quan-short-nam",
        parent_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 11,
        name: "Đầm nữ",
        slug: "dam-nu",
        parent_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 12,
        name: "Áo thun nữ",
        slug: "ao-thun-nu",
        parent_id: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 13,
        name: "Phụ kiện",
        slug: "phu-kien",
        parent_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 14,
        name: "Nón / Mũ",
        slug: "non-mu",
        parent_id: 13,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("categories", null, {});
  },
};
