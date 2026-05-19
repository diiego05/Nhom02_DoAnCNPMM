"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // 1. Seed Products
    await queryInterface.bulkInsert("products", [
      {
        id: 1,
        category_id: 7, // Áo thun nam
        brand_id: 1,    // Nike
        name: "Áo Thun Nike Dri-FIT",
        slug: "ao-thun-nike-dri-fit",
        description: "Áo thun thể thao thoáng mát, công nghệ Dri-FIT giúp thấm hút mồ hôi cực tốt.",
        material: "100% Polyester",
        gender: "MALE",
        price: 550000,
        sale_price: 490000,
        stock_quantity: 100,
        sold_count: 15,
        view_count: 120,
        status: "ACTIVE",
        is_featured: true,
        is_new: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        category_id: 8, // Áo sơ mi nam
        brand_id: 3,    // Uniqlo
        name: "Áo Sơ Mi Oxford Dài Tay",
        slug: "ao-so-mi-oxford-dai-tay",
        description: "Phong cách thanh lịch, chất liệu Oxford bền đẹp, phù hợp đi học và đi làm.",
        material: "100% Cotton",
        gender: "MALE",
        price: 799000,
        sale_price: null,
        stock_quantity: 50,
        sold_count: 5,
        view_count: 45,
        status: "ACTIVE",
        is_featured: false,
        is_new: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        category_id: 9, // Quần jean nam
        brand_id: 3,    // Uniqlo
        name: "Quần Jean Slim Fit Stretch",
        slug: "quan-jean-slim-fit-stretch",
        description: "Quần jean co giãn cao cấp, giữ phom cực tốt, mang lại sự tự tin và thoải mái.",
        material: "98% Cotton, 2% Spandex",
        gender: "MALE",
        price: 999000,
        sale_price: 899000,
        stock_quantity: 40,
        sold_count: 12,
        view_count: 98,
        status: "ACTIVE",
        is_featured: true,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        category_id: 10, // Quần short nam
        brand_id: 1,    // Nike
        name: "Quần Short Thể Thao Nike Challenger",
        slug: "quan-short-nike-challenger",
        description: "Thiết kế mỏng nhẹ, có quần lót trong hỗ trợ tối đa cho các buổi chạy bộ và tập gym.",
        material: "100% Recycled Polyester",
        gender: "MALE",
        price: 650000,
        sale_price: null,
        stock_quantity: 60,
        sold_count: 22,
        view_count: 154,
        status: "ACTIVE",
        is_featured: false,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        category_id: 11, // Đầm nữ
        brand_id: 4,    // Zara
        name: "Đầm Hoa Dáng Xoè Cổ V",
        slug: "dam-hoa-dang-xoe-co-v",
        description: "Chi tiết cổ V quyến rũ, họa tiết hoa nhí sang trọng, thướt tha phù hợp đi tiệc hoặc dạo phố.",
        material: "100% Viscose",
        gender: "FEMALE",
        price: 1299000,
        sale_price: 999000,
        stock_quantity: 30,
        sold_count: 8,
        view_count: 72,
        status: "ACTIVE",
        is_featured: true,
        is_new: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        category_id: 12, // Áo thun nữ
        brand_id: 4,    // Zara
        name: "Áo Thun Gân Croptop Zara",
        slug: "ao-thun-gan-croptop-zara",
        description: "Thiết kế dáng ngắn trẻ trung, ôm sát tôn dáng, chất thun gân co giãn 4 chiều cực thoải mái.",
        material: "95% Cotton, 5% Elastane",
        gender: "FEMALE",
        price: 350000,
        sale_price: null,
        stock_quantity: 80,
        sold_count: 35,
        view_count: 210,
        status: "ACTIVE",
        is_featured: false,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 7,
        category_id: 14, // Nón / Mũ
        brand_id: 2,    // Adidas
        name: "Nón Lưỡi Trai Adidas Trefoil Cap",
        slug: "non-luoi-trai-adidas-trefoil",
        description: "Thiết kế cổ điển với logo cỏ ba lá thêu nổi nổi bật, khóa gài kim loại điều chỉnh size tiện lợi.",
        material: "100% Cotton",
        gender: "UNISEX",
        price: 450000,
        sale_price: 390000,
        stock_quantity: 120,
        sold_count: 55,
        view_count: 180,
        status: "ACTIVE",
        is_featured: true,
        is_new: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 8,
        category_id: 7, // Áo thun nam
        brand_id: 2,    // Adidas
        name: "Áo Hoodie Adidas Adicolor Classics",
        slug: "ao-hoodie-adidas-adicolor-classics",
        description: "Chất nỉ bông mềm mại ấm áp, phom suông rộng rãi cá tính, phong cách streetwear thời thượng.",
        material: "70% Cotton, 30% Recycled Polyester Fleece",
        gender: "UNISEX",
        price: 1800000,
        sale_price: null,
        stock_quantity: 25,
        sold_count: 4,
        view_count: 32,
        status: "ACTIVE",
        is_featured: false,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // SẢN PHẨM MỚI BỔ SUNG ĐỂ TEST PHÂN TRANG (TỔNG CỘNG 16 SẢN PHẨM)
      {
        id: 9,
        category_id: 3, // Áo nam
        brand_id: 1,    // Nike
        name: "Áo Khoác Gió Nike Windrunner",
        slug: "ao-khoac-gio-nike-windrunner",
        description: "Áo khoác gió thể thao cao cấp, chống mưa nhẹ và cản gió tốt, thiết kế phối màu cổ điển phong cách.",
        material: "100% Nylon",
        gender: "MALE",
        price: 2100000,
        sale_price: 1890000,
        stock_quantity: 35,
        sold_count: 19,
        view_count: 142,
        status: "ACTIVE",
        is_featured: true,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 10,
        category_id: 10, // Quần short nam
        brand_id: 2,     // Adidas
        name: "Quần Short Adidas Club Tennis",
        slug: "quan-short-adidas-club-tennis",
        description: "Chất liệu thun nhẹ thoáng khí, công nghệ AeroReady hút ẩm tốt, đem lại cảm giác năng động trên sân đấu.",
        material: "100% Recycled Polyester Plain Weave",
        gender: "MALE",
        price: 750000,
        sale_price: null,
        stock_quantity: 45,
        sold_count: 8,
        view_count: 65,
        status: "ACTIVE",
        is_featured: false,
        is_new: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 11,
        category_id: 8, // Áo sơ mi nam
        brand_id: 3,    // Uniqlo
        name: "Áo Sơ Mi Cotton Linen Cổ Tàu",
        slug: "ao-so-mi-cotton-linen-co-tau",
        description: "Sự kết hợp hoàn hảo giữa sợi bông cotton mềm mại và sợi linen mát mẻ, cổ tàu hiện đại lịch lãm.",
        material: "50% Cotton, 50% Linen",
        gender: "MALE",
        price: 699000,
        sale_price: 599000,
        stock_quantity: 40,
        sold_count: 14,
        view_count: 105,
        status: "ACTIVE",
        is_featured: true,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 12,
        category_id: 6, // Chân váy nữ
        brand_id: 4,    // Zara
        name: "Chân Váy Denim Dáng Chữ A",
        slug: "chan-vay-denim-chu-a",
        description: "Chân váy bò phom chữ A trẻ trung cá tính, hàng nút kim loại phía trước làm điểm nhấn nổi bật.",
        material: "100% Denim Cotton",
        gender: "FEMALE",
        price: 899000,
        sale_price: null,
        stock_quantity: 50,
        sold_count: 11,
        view_count: 88,
        status: "ACTIVE",
        is_featured: false,
        is_new: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 13,
        category_id: 11, // Đầm nữ
        brand_id: 4,    // Zara
        name: "Đầm Dệt Kim Dáng Ôm Sang Trọng",
        slug: "dam-det-kim-om-dang",
        description: "Đầm len dệt kim tăm cao cấp, phom ôm sát cơ thể tôn đường cong quyến rũ dạo phố thu đông.",
        material: "80% Viscose, 20% Nylon",
        gender: "FEMALE",
        price: 1450000,
        sale_price: 1190000,
        stock_quantity: 20,
        sold_count: 3,
        view_count: 51,
        status: "ACTIVE",
        is_featured: false,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 14,
        category_id: 12, // Áo thun nữ
        brand_id: 2,     // Adidas
        name: "Áo Thun Adidas Originals Trefoil Nữ",
        slug: "ao-thun-adidas-originals-trefoil-nu",
        description: "Áo thun cotton mềm dáng thụng phong cách retro thể thao năng động trẻ trung.",
        material: "100% Cotton Single Jersey",
        gender: "FEMALE",
        price: 650000,
        sale_price: null,
        stock_quantity: 70,
        sold_count: 27,
        view_count: 136,
        status: "ACTIVE",
        is_featured: false,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 15,
        category_id: 14, // Nón / Mũ
        brand_id: 2,     // Adidas
        name: "Nón Adidas Superlite Cap",
        slug: "non-adidas-superlite",
        description: "Nón thể thao chống nắng thoáng mát chuyên dụng cho tập chạy bộ, tennis siêu nhẹ cản tia UV.",
        material: "87% Polyester, 13% Spandex",
        gender: "UNISEX",
        price: 500000,
        sale_price: 450000,
        stock_quantity: 85,
        sold_count: 39,
        view_count: 168,
        status: "ACTIVE",
        is_featured: true,
        is_new: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 16,
        category_id: 3, // Áo nam
        brand_id: 3,    // Uniqlo
        name: "Áo Khoác Phao Ultra Light Down",
        slug: "ao-khoac-phao-ultra-light-down",
        description: "Áo khoác phao siêu nhẹ, giữ ấm cực tốt, dễ dàng gấp gọn mang đi tiện lợi.",
        material: "Phao lông vũ 90% Down, 10% Feather",
        gender: "MALE",
        price: 1999000,
        sale_price: null,
        stock_quantity: 30,
        sold_count: 6,
        view_count: 79,
        status: "ACTIVE",
        is_featured: false,
        is_new: false,
        created_at: new Date(),
        updated_at: new Date(),
      }
    ]);

    // 2. Seed Product Variants (Size/Color)
    await queryInterface.bulkInsert("product_variants", [
      // Variants for Product 1 (Nike T-shirt)
      { id: 1, product_id: 1, sku: "NIKE-DFT-BLK-M", color: "Đen", color_hex: "#000000", size: "M", price: 490000, stock_quantity: 20, created_at: new Date(), updated_at: new Date() },
      { id: 2, product_id: 1, sku: "NIKE-DFT-BLK-L", color: "Đen", color_hex: "#000000", size: "L", price: 490000, stock_quantity: 30, created_at: new Date(), updated_at: new Date() },
      { id: 3, product_id: 1, sku: "NIKE-DFT-WHT-M", color: "Trắng", color_hex: "#FFFFFF", size: "M", price: 490000, stock_quantity: 25, created_at: new Date(), updated_at: new Date() },
      { id: 4, product_id: 1, sku: "NIKE-DFT-WHT-L", color: "Trắng", color_hex: "#FFFFFF", size: "L", price: 490000, stock_quantity: 25, created_at: new Date(), updated_at: new Date() },
      
      // Variants for Product 2 (Uniqlo Shirt)
      { id: 5, product_id: 2, sku: "UNI-OXF-BLU-S", color: "Xanh biển", color_hex: "#1E90FF", size: "S", price: 799000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() },
      { id: 6, product_id: 2, sku: "UNI-OXF-BLU-M", color: "Xanh biển", color_hex: "#1E90FF", size: "M", price: 799000, stock_quantity: 20, created_at: new Date(), updated_at: new Date() },
      { id: 7, product_id: 2, sku: "UNI-OXF-WHT-M", color: "Trắng", color_hex: "#FFFFFF", size: "M", price: 799000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() },

      // Variants for Product 3 (Uniqlo Jeans)
      { id: 8, product_id: 3, sku: "UNI-JEAN-BLU-30", color: "Xanh nhạt", color_hex: "#ADD8E6", size: "30", price: 899000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() },
      { id: 9, product_id: 3, sku: "UNI-JEAN-BLU-32", color: "Xanh nhạt", color_hex: "#ADD8E6", size: "32", price: 899000, stock_quantity: 10, created_at: new Date(), updated_at: new Date() },
      { id: 10, product_id: 3, sku: "UNI-JEAN-IND-32", color: "Chàm đậm", color_hex: "#4B0082", size: "32", price: 899000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() },

      // Variants for Product 4 (Nike Challenger Shorts)
      { id: 11, product_id: 4, sku: "NIKE-SHO-BLK-S", color: "Đen", color_hex: "#000000", size: "S", price: 650000, stock_quantity: 20, created_at: new Date(), updated_at: new Date() },
      { id: 12, product_id: 4, sku: "NIKE-SHO-BLK-M", color: "Đen", color_hex: "#000000", size: "M", price: 650000, stock_quantity: 25, created_at: new Date(), updated_at: new Date() },
      { id: 13, product_id: 4, sku: "NIKE-SHO-GRY-L", color: "Xám", color_hex: "#808080", size: "L", price: 650000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() },

      // Variants for Product 5 (Zara Dress)
      { id: 14, product_id: 5, sku: "ZARA-DRE-FLR-XS", color: "Họa tiết hoa", color_hex: "#FF69B4", size: "XS", price: 999000, stock_quantity: 10, created_at: new Date(), updated_at: new Date() },
      { id: 15, product_id: 5, sku: "ZARA-DRE-FLR-S", color: "Họa tiết hoa", color_hex: "#FF69B4", size: "S", price: 999000, stock_quantity: 12, created_at: new Date(), updated_at: new Date() },
      { id: 16, product_id: 5, sku: "ZARA-DRE-FLR-M", color: "Họa tiết hoa", color_hex: "#FF69B4", size: "M", price: 999000, stock_quantity: 8, created_at: new Date(), updated_at: new Date() },

      // Variants for Product 6 (Zara Croptop)
      { id: 17, product_id: 6, sku: "ZARA-CROP-BLK-S", color: "Đen", color_hex: "#000000", size: "S", price: 350000, stock_quantity: 30, created_at: new Date(), updated_at: new Date() },
      { id: 18, product_id: 6, sku: "ZARA-CROP-WHT-S", color: "Trắng", color_hex: "#FFFFFF", size: "S", price: 350000, stock_quantity: 30, created_at: new Date(), updated_at: new Date() },
      { id: 19, product_id: 6, sku: "ZARA-CROP-PNK-M", color: "Hồng", color_hex: "#FFC0CB", size: "M", price: 350000, stock_quantity: 20, created_at: new Date(), updated_at: new Date() },

      // Variants for Product 7 (Adidas Cap)
      { id: 20, product_id: 7, sku: "ADI-CAP-BLK-OS", color: "Đen", color_hex: "#000000", size: "Free size", price: 390000, stock_quantity: 60, created_at: new Date(), updated_at: new Date() },
      { id: 21, product_id: 7, sku: "ADI-CAP-WHT-OS", color: "Trắng", color_hex: "#FFFFFF", size: "Free size", price: 390000, stock_quantity: 60, created_at: new Date(), updated_at: new Date() },

      // Variants for Product 8 (Adidas Hoodie)
      { id: 22, product_id: 8, sku: "ADI-HD-NVY-M", color: "Xanh navy", color_hex: "#000080", size: "M", price: 1800000, stock_quantity: 10, created_at: new Date(), updated_at: new Date() },
      { id: 23, product_id: 8, sku: "ADI-HD-NVY-L", color: "Xanh navy", color_hex: "#000080", size: "L", price: 1800000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() },

      // Biến thể các sản phẩm mới
      // Product 9 (Nike Windrunner)
      { id: 24, product_id: 9, sku: "NIKE-WIN-BLK-M", color: "Đen", color_hex: "#000000", size: "M", price: 1890000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() },
      { id: 25, product_id: 9, sku: "NIKE-WIN-BLK-L", color: "Đen", color_hex: "#000000", size: "L", price: 1890000, stock_quantity: 20, created_at: new Date(), updated_at: new Date() },

      // Product 10 (Adidas Tennis Shorts)
      { id: 26, product_id: 10, sku: "ADI-SHO-WHT-M", color: "Trắng", color_hex: "#FFFFFF", size: "M", price: 750000, stock_quantity: 25, created_at: new Date(), updated_at: new Date() },
      { id: 27, product_id: 10, sku: "ADI-SHO-WHT-L", color: "Trắng", color_hex: "#FFFFFF", size: "L", price: 750000, stock_quantity: 20, created_at: new Date(), updated_at: new Date() },

      // Product 11 (Uniqlo Linen Shirt)
      { id: 28, product_id: 11, sku: "UNI-LIN-GRY-M", color: "Xám", color_hex: "#808080", size: "M", price: 599000, stock_quantity: 20, created_at: new Date(), updated_at: new Date() },
      { id: 29, product_id: 11, sku: "UNI-LIN-GRY-L", color: "Xám", color_hex: "#808080", size: "L", price: 599000, stock_quantity: 20, created_at: new Date(), updated_at: new Date() },

      // Product 12 (Zara skirt)
      { id: 30, product_id: 12, sku: "ZARA-SKT-BLU-S", color: "Xanh nhạt", color_hex: "#ADD8E6", size: "S", price: 899000, stock_quantity: 25, created_at: new Date(), updated_at: new Date() },
      { id: 31, product_id: 12, sku: "ZARA-SKT-BLU-M", color: "Xanh nhạt", color_hex: "#ADD8E6", size: "M", price: 899000, stock_quantity: 25, created_at: new Date(), updated_at: new Date() },

      // Product 13 (Zara knit dress)
      { id: 32, product_id: 13, sku: "ZARA-KNT-BLK-S", color: "Đen", color_hex: "#000000", size: "S", price: 1190000, stock_quantity: 10, created_at: new Date(), updated_at: new Date() },
      { id: 33, product_id: 13, sku: "ZARA-KNT-BLK-M", color: "Đen", color_hex: "#000000", size: "M", price: 1190000, stock_quantity: 10, created_at: new Date(), updated_at: new Date() },

      // Product 14 (Adidas T-shirt W)
      { id: 34, product_id: 14, sku: "ADI-TS-WHT-S", color: "Trắng", color_hex: "#FFFFFF", size: "S", price: 650000, stock_quantity: 35, created_at: new Date(), updated_at: new Date() },
      { id: 35, product_id: 14, sku: "ADI-TS-WHT-M", color: "Trắng", color_hex: "#FFFFFF", size: "M", price: 650000, stock_quantity: 35, created_at: new Date(), updated_at: new Date() },

      // Product 15 (Adidas Cap L)
      { id: 36, product_id: 15, sku: "ADI-CAP-SL-BLK", color: "Đen", color_hex: "#000000", size: "Free size", price: 450000, stock_quantity: 45, created_at: new Date(), updated_at: new Date() },
      { id: 37, product_id: 15, sku: "ADI-CAP-SL-WHT", color: "Trắng", color_hex: "#FFFFFF", size: "Free size", price: 450000, stock_quantity: 40, created_at: new Date(), updated_at: new Date() },

      // Product 16 (Uniqlo Down Jacket)
      { id: 38, product_id: 16, sku: "UNI-DWN-BLK-M", color: "Đen", color_hex: "#000000", size: "M", price: 1999000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() },
      { id: 39, product_id: 16, sku: "UNI-DWN-BLK-L", color: "Đen", color_hex: "#000000", size: "L", price: 1999000, stock_quantity: 15, created_at: new Date(), updated_at: new Date() }
    ]);

    // 3. Seed Product Images
    await queryInterface.bulkInsert("product_images", [
      // Product 1 - Áo Thun Nike Dri-FIT
      { id: 1, product_id: 1, image_url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 2, product_id: 1, image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 20, product_id: 1, image_url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=800", is_primary: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: 21, product_id: 1, image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800", is_primary: false, sort_order: 4, created_at: new Date(), updated_at: new Date() },
      
      // Product 2 - Áo Sơ Mi Oxford Dài Tay
      { id: 3, product_id: 2, image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 22, product_id: 2, image_url: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: 23, product_id: 2, image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800", is_primary: false, sort_order: 3, created_at: new Date(), updated_at: new Date() },
      
      // Product 3 - Quần Jean Slim Fit Stretch
      { id: 4, product_id: 3, image_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 24, product_id: 3, image_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      
      // Product 4 - Quần Short Thể Thao Nike Challenger
      { id: 5, product_id: 4, image_url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 25, product_id: 4, image_url: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      
      // Product 5 - Đầm Hoa Dáng Xoè Cổ V
      { id: 6, product_id: 5, image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 7, product_id: 5, image_url: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      
      // Product 6 - Áo Thun Gân Croptop Zara
      { id: 8, product_id: 6, image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 26, product_id: 6, image_url: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },
      
      // Product 7 - Nón Lưỡi Trai Adidas Trefoil Cap
      { id: 9, product_id: 7, image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 10, product_id: 7, image_url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // Product 8 - Áo Hoodie Adidas Adicolor Classics
      { id: 11, product_id: 8, image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 27, product_id: 8, image_url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // Product 9 - Áo Khoác Gió Nike Windrunner
      { id: 12, product_id: 9, image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: 28, product_id: 9, image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800", is_primary: false, sort_order: 2, created_at: new Date(), updated_at: new Date() },

      // Product 10 - Quần Short Adidas Club Tennis
      { id: 13, product_id: 10, image_url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },

      // Product 11 - Áo Sơ Mi Cotton Linen Cổ Tàu
      { id: 14, product_id: 11, image_url: "https://images.unsplash.com/photo-1626497764746-6dc36446b3f8?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },

      // Product 12 - Chân Váy Denim Dáng Chữ A
      { id: 15, product_id: 12, image_url: "https://images.unsplash.com/photo-1582142306909-195724d33ab9?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },

      // Product 13 - Đầm Dệt Kim Dáng Ôm Sang Trọng
      { id: 16, product_id: 13, image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },

      // Product 14 - Áo Thun Adidas Originals Trefoil Nữ
      { id: 17, product_id: 14, image_url: "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },

      // Product 15 - Nón Adidas Superlite Cap
      { id: 18, product_id: 15, image_url: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() },

      // Product 16 - Áo Khoác Phao Ultra Light Down
      { id: 19, product_id: 16, image_url: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800", is_primary: true, sort_order: 1, created_at: new Date(), updated_at: new Date() }
    ]);

    // 4. Seed Product Attributes
    await queryInterface.bulkInsert("product_attributes", [
      { id: 1, product_id: 1, attr_name: "Kiểu dáng", attr_value: "Slim fit", created_at: new Date(), updated_at: new Date() },
      { id: 2, product_id: 1, attr_name: "Sản xuất tại", attr_value: "Vietnam", created_at: new Date(), updated_at: new Date() },
      { id: 3, product_id: 2, attr_name: "Phong cách", attr_value: "Business Casual", created_at: new Date(), updated_at: new Date() },
      { id: 4, product_id: 3, attr_name: "Độ co giãn", attr_value: "Co giãn cực tốt", created_at: new Date(), updated_at: new Date() },
      { id: 5, product_id: 3, attr_name: "Kiểu ống", attr_value: "Slim Fit", created_at: new Date(), updated_at: new Date() },
      { id: 6, product_id: 4, attr_name: "Môn thể thao", attr_value: "Running, Training", created_at: new Date(), updated_at: new Date() },
      { id: 7, product_id: 5, attr_name: "Chiều dài", attr_value: "Midi", created_at: new Date(), updated_at: new Date() },
      { id: 8, product_id: 6, attr_name: "Độ dày", attr_value: "Vừa phải", created_at: new Date(), updated_at: new Date() },
      { id: 9, product_id: 7, attr_name: "Chống nắng", attr_value: "UPF 50+", created_at: new Date(), updated_at: new Date() },
      { id: 10, product_id: 9, attr_name: "Chống nước", attr_value: "Kháng nước nhẹ", created_at: new Date(), updated_at: new Date() },
      { id: 11, product_id: 11, attr_name: "Đặc điểm vải", attr_value: "Thoáng mát tự nhiên", created_at: new Date(), updated_at: new Date() },
      { id: 12, product_id: 15, attr_name: "Trọng lượng", attr_value: "Siêu nhẹ", created_at: new Date(), updated_at: new Date() },
      { id: 13, product_id: 16, attr_name: "Chỉ số lông vũ", attr_value: "Fill power 750+", created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_attributes", null, {});
    await queryInterface.bulkDelete("product_images", null, {});
    await queryInterface.bulkDelete("product_variants", null, {});
    await queryInterface.bulkDelete("products", null, {});
  },
};
