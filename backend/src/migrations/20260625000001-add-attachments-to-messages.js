/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("messages");
    
    if (!tableDesc.attachment_url) {
      await queryInterface.addColumn("messages", "attachment_url", {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "URL file đính kèm trên Cloudinary"
      });
    }

    if (!tableDesc.attachment_name) {
      await queryInterface.addColumn("messages", "attachment_name", {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "Tên gốc của file đính kèm"
      });
    }

    if (!tableDesc.attachment_type) {
      await queryInterface.addColumn("messages", "attachment_type", {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "Mimetype/Loại file đính kèm"
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable("messages");

    if (tableDesc.attachment_url) {
      await queryInterface.removeColumn("messages", "attachment_url");
    }
    if (tableDesc.attachment_name) {
      await queryInterface.removeColumn("messages", "attachment_name");
    }
    if (tableDesc.attachment_type) {
      await queryInterface.removeColumn("messages", "attachment_type");
    }
  }
};
