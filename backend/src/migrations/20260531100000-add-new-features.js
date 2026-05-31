'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Add columns to users
      await queryInterface.addColumn('users', 'loyalty_points', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Kho điểm tích lũy',
      }, { transaction });

      // 2. Add columns to products
      await queryInterface.addColumn('products', 'review_count', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }, { transaction });
      await queryInterface.addColumn('products', 'rating_average', {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00,
      }, { transaction });

      // 3. Create coupons table
      await queryInterface.createTable('coupons', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.STRING(300),
          allowNull: true,
        },
        discount_type: {
          type: Sequelize.ENUM('PERCENTAGE', 'FIXED_AMOUNT'),
          allowNull: false,
          defaultValue: 'PERCENTAGE',
        },
        discount_value: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
        },
        min_order_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0.00,
        },
        max_discount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
        },
        usage_limit: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        per_user_limit: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        used_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        start_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, { transaction });

      // 4. Add columns to orders
      await queryInterface.addColumn('orders', 'coupon_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'coupons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }, { transaction });

      await queryInterface.addColumn('orders', 'points_used', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.addColumn('orders', 'points_discount', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
      }, { transaction });

      // 5. Create user_coupon_usages
      await queryInterface.createTable('user_coupon_usages', {
        id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        coupon_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'coupons', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        order_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'orders', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        used_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, { transaction });
      await queryInterface.addIndex('user_coupon_usages', ['user_id', 'coupon_id', 'order_id'], {
        unique: true,
        name: 'uk_ucu_user_coupon_order',
        transaction,
      });

      // 6. Create wishlists
      await queryInterface.createTable('wishlists', {
        id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        product_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'products', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, { transaction });
      await queryInterface.addIndex('wishlists', ['user_id', 'product_id'], {
        unique: true,
        name: 'uk_wl_user_product',
        transaction,
      });

      // 7. Create user_viewed_products
      await queryInterface.createTable('user_viewed_products', {
        id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        product_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'products', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        viewed_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, { transaction });
      await queryInterface.addIndex('user_viewed_products', ['user_id', 'product_id'], {
        unique: true,
        name: 'uk_uvp_user_product',
        transaction,
      });

      // 8. Create product_reviews
      await queryInterface.createTable('product_reviews', {
        id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        product_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'products', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        variant_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
          references: { model: 'product_variants', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        order_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'orders', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        rating: {
          type: Sequelize.TINYINT,
          allowNull: false,
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        images: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        is_visible: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }, { transaction });
      await queryInterface.addIndex('product_reviews', ['user_id', 'product_id', 'order_id'], {
        unique: true,
        name: 'uk_rv_user_prod_order',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('product_reviews', { transaction });
      await queryInterface.dropTable('user_viewed_products', { transaction });
      await queryInterface.dropTable('wishlists', { transaction });
      await queryInterface.dropTable('user_coupon_usages', { transaction });
      
      await queryInterface.removeColumn('orders', 'points_discount', { transaction });
      await queryInterface.removeColumn('orders', 'points_used', { transaction });
      await queryInterface.removeColumn('orders', 'coupon_id', { transaction });
      
      await queryInterface.dropTable('coupons', { transaction });
      
      await queryInterface.removeColumn('products', 'rating_average', { transaction });
      await queryInterface.removeColumn('products', 'review_count', { transaction });
      
      await queryInterface.removeColumn('users', 'loyalty_points', { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
