export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shipments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      shop_order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'shop_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      shipper_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      tracking_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      status: {
        type: Sequelize.ENUM(
          'PENDING_PICKUP',
          'PICKED_UP',
          'IN_TRANSIT',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'FAILED',
          'RETURNED'
        ),
        defaultValue: 'PENDING_PICKUP'
      },
      shipping_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      estimated_delivery_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.createTable('shipment_histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      shipment_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'shipments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      note: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      proof_image_url: {
        type: Sequelize.STRING(1000),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shipment_histories');
    await queryInterface.dropTable('shipments');
  }
};
