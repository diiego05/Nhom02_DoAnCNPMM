/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Insert Coupons
    try {
      await queryInterface.bulkInsert('coupons', [
        { code: 'WELCOME2026', description: 'Giảm 10% cho đơn hàng đầu tiên', discount_type: 'PERCENTAGE', discount_value: 10.00, min_order_amount: 500000.00, max_discount: 200000.00, usage_limit: 100, per_user_limit: 1, used_count: 0, start_date: new Date('2026-01-01'), end_date: new Date('2026-12-31'), is_active: true, created_at: now, updated_at: now },
        { code: 'SALE50K', description: 'Giảm 50.000đ cho đơn từ 200.000đ', discount_type: 'FIXED_AMOUNT', discount_value: 50000.00, min_order_amount: 200000.00, max_discount: 50000.00, usage_limit: 50, per_user_limit: 1, used_count: 0, start_date: new Date('2026-05-01'), end_date: new Date('2026-06-30'), is_active: true, created_at: now, updated_at: now }
      ], { ignoreDuplicates: true });
    } catch(e) {}

    // Insert Wishlists
    try {
      await queryInterface.bulkInsert('wishlists', [
        { user_id: 1, product_id: 1, created_at: now },
        { user_id: 1, product_id: 2, created_at: now },
        { user_id: 1, product_id: 5, created_at: now }
      ], { ignoreDuplicates: true });
    } catch(e) {}

    // Insert User Viewed Products
    try {
      await queryInterface.bulkInsert('user_viewed_products', [
        { user_id: 1, product_id: 3, viewed_at: now },
        { user_id: 1, product_id: 4, viewed_at: new Date(now.getTime() - 1000 * 60 * 60) }
      ], { ignoreDuplicates: true });
    } catch(e) {}

    // Create a dummy Order so user can review products
    try {
      await queryInterface.bulkInsert('orders', [
        {
          id: 9999, // use a fixed ID to reference later
          user_id: 1,
          order_code: 'ORD-DEMO-2026',
          status: 'DELIVERED',
          payment_method: 'COD',
          payment_status: 'PAID',
          recipient_name: 'Nguyễn Trí Lâm',
          recipient_phone: '0123456789',
          shipping_address: '123 Đường ABC, Quận XYZ, TP.HCM',
          subtotal: 1000000.00,
          shipping_fee: 30000.00,
          discount_amount: 0.00,
          points_used: 0,
          points_discount: 0.00,
          total_amount: 1030000.00,
          created_at: now,
          updated_at: now
        }
      ], { ignoreDuplicates: true });

      // Insert Order Items for the Order
      await queryInterface.bulkInsert('order_items', [
        { order_id: 9999, product_id: 1, product_variant_id: 1, product_name: 'Áo Thun Nike Dri-FIT', quantity: 1, unit_price: 490000, total_price: 490000, created_at: now, updated_at: now },
        { order_id: 9999, product_id: 2, product_variant_id: 5, product_name: 'Áo Sơ Mi Oxford Dài Tay', quantity: 1, unit_price: 799000, total_price: 799000, created_at: now, updated_at: now }
      ], { ignoreDuplicates: true });
    } catch(e) { console.log('Order error:', e.message); }

    // Insert Product Reviews referencing the order
    try {
      await queryInterface.bulkInsert('product_reviews', [
        {
          product_id: 1,
          user_id: 1,
          variant_id: 1,
          order_id: 9999,
          rating: 5,
          comment: 'Sản phẩm rất tuyệt vời, chất vải mát, mặc rất thoải mái!',
          is_visible: true,
          created_at: now,
          updated_at: now
        },
        {
          product_id: 2,
          user_id: 1,
          variant_id: 5,
          order_id: 9999,
          rating: 4,
          comment: 'Form áo đẹp, giao hàng nhanh. Sẽ ủng hộ tiếp.',
          is_visible: true,
          created_at: now,
          updated_at: now
        }
      ], { ignoreDuplicates: true });
    } catch(e) { console.log('ProductReviews error:', e.message); }
  },

  async down(queryInterface, Sequelize) {
    // optional down migration
  }
};
