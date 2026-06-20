/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Coupons
    await queryInterface.bulkInsert('coupons', [
      { id: 1, shop_id: null, code: 'PLATFORM2026', discount_type: 'PERCENT', discount_value: 10, min_order_amount: 0, max_discount: 100000, start_date: new Date('2026-01-01'), end_date: new Date('2026-12-31'), usage_limit: 100 },
      { id: 2, shop_id: 1, code: 'NIKE50K', discount_type: 'FIXED', discount_value: 50000, min_order_amount: 100000, max_discount: 50000, start_date: new Date('2026-01-01'), end_date: new Date('2026-12-31'), usage_limit: 50 },
      { id: 3, shop_id: 2, code: 'UNIQLO2026', discount_type: 'PERCENT', discount_value: 5, min_order_amount: 200000, max_discount: 50000, start_date: new Date('2026-01-01'), end_date: new Date('2026-12-31'), usage_limit: 50 }
    ], { ignoreDuplicates: true });

    // 2. Parent Orders
    await queryInterface.bulkInsert('parent_orders', [
      { id: 1, user_id: 5, checkout_code: 'CHK-DEMO-001', address_id: 1, total_amount: 1300000, payment_method: 'COD', payment_status: 'UNPAID', shipping_address: 'Khách Hàng Vip, 0500000005, 123 Lê Lợi, Phường Bến Nghé, Quận 1, Hồ Chí Minh', platform_coupon_id: null, created_at: now }
    ], { ignoreDuplicates: true });

    // 3. Shop Orders
    await queryInterface.bulkInsert('shop_orders', [
      { id: 1, parent_order_id: 1, shop_id: 1, shop_order_code: 'SHOP-NIKE-001', subtotal: 490000, shipping_fee: 30000, discount_amount: 0, final_amount: 520000, commission_rate: 10, commission_amount: 52000, status: 'DELIVERED', created_at: now, updated_at: now },
      { id: 2, parent_order_id: 1, shop_id: 2, shop_order_code: 'SHOP-UNI-001', subtotal: 799000, shipping_fee: 30000, discount_amount: 0, final_amount: 829000, commission_rate: 10, commission_amount: 82900, status: 'DELIVERED', created_at: now, updated_at: now }
    ], { ignoreDuplicates: true });

    // 4. Order Items
    await queryInterface.bulkInsert('order_items', [
      { id: 1, shop_order_id: 1, variant_id: 1, product_name: 'Áo Thun Nike Dri-FIT', sku: 'NIKE-DFT-BLK-M', size: 'M', color: 'Đen', quantity: 1, unit_price: 490000 },
      { id: 2, shop_order_id: 2, variant_id: 3, product_name: 'Áo Sơ Mi Oxford Dài Tay', sku: 'UNI-OXF-BLU-S', size: 'S', color: 'Xanh biển', quantity: 1, unit_price: 799000 }
    ], { ignoreDuplicates: true });

    // 5. Cart Items (demo)
    await queryInterface.bulkInsert('cart_items', [
      { user_id: 5, variant_id: 6, quantity: 2, added_at: now }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cart_items', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('shop_orders', null, {});
    await queryInterface.bulkDelete('parent_orders', null, {});
    await queryInterface.bulkDelete('coupons', null, {});
  }
};
