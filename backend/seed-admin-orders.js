import db from "./src/models/index.js";
import bcrypt from "bcryptjs";

const { User, UserProfile, Role, Product, ProductVariant, Order, OrderItem, AddressBook } = db;

const seedAdminAndOrders = async () => {
  try {
    console.log("Connecting to database and syncing models...");
    // Sync models to make sure all tables exist (especially product_variants or others)
    await db.sequelize.sync({ force: false });
    console.log("Database models synchronized successfully.");

    // 1. Ensure Roles exist
    console.log("Ensuring roles exist...");
    await Role.findOrCreate({
      where: { id: 1 },
      defaults: { id: 1, role_name: "ADMIN" }
    });
    await Role.findOrCreate({
      where: { id: 2 },
      defaults: { id: 2, role_name: "USER" }
    });
    console.log("Roles ensured.");

    // 2. Ensure Admin User exists
    console.log("Ensuring admin user exists...");
    const adminPassword = "123";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const adminData = {
      email: "admin@gmail.com",
      phone: "0900000001",
      password: hashedAdminPassword,
      role_id: 1, // ADMIN
      status: "ACTIVE"
    };

    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: adminData.email },
      defaults: adminData
    });

    if (!adminCreated) {
      await adminUser.update({
        role_id: 1,
        password: hashedAdminPassword,
        status: "ACTIVE"
      });
      console.log("Admin user already existed, updated properties.");
    } else {
      console.log("Admin user created successfully.");
    }

    await UserProfile.findOrCreate({
      where: { user_id: adminUser.id },
      defaults: {
        user_id: adminUser.id,
        first_name: "System",
        last_name: "Admin",
        full_name: "System Admin",
        avatar_url: "https://ui-avatars.com/api/?name=System+Admin&background=d97736&color=fff"
      }
    });
    console.log("Admin profile ensured.");

    // 3. Ensure User with ID 1 exists (the user for whom we need dummy orders)
    console.log("Ensuring target user with ID 1 exists...");
    const userPassword = "123";
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);
    
    let targetUser = await User.findByPk(1);
    if (!targetUser) {
      targetUser = await User.create({
        id: 1,
        email: "user1@gmail.com",
        phone: "0901234567",
        password: hashedUserPassword,
        role_id: 2, // USER
        status: "ACTIVE"
      });
      console.log("Target user with ID 1 created.");
    } else {
      console.log("Target user with ID 1 already exists.");
    }

    await UserProfile.findOrCreate({
      where: { user_id: 1 },
      defaults: {
        user_id: 1,
        first_name: "Kiệt",
        last_name: "Nguyễn",
        full_name: "Nguyễn Kiệt",
        avatar_url: "https://ui-avatars.com/api/?name=Nguyen+Kiet&background=4f46e5&color=fff"
      }
    });
    console.log("Target user profile ensured.");

    // Ensure target user has an address in AddressBook so we have shipping_address_id
    const [address, addressCreated] = await AddressBook.findOrCreate({
      where: { user_id: 1 },
      defaults: {
        user_id: 1,
        recipient_name: "Nguyễn Kiệt",
        phone: "0901234567",
        address_line: "123 Đường Lê Lợi",
        ward: "Phường Bến Nghé",
        district: "Quận 1",
        province: "Thành phố Hồ Chí Minh",
        is_default: true
      }
    });
    console.log("Shipping address ensured.");

    // 4. Ensure some Products and Variants exist so we can link them to orders
    console.log("Ensuring products and variants exist...");
    let variants = await ProductVariant.findAll();
    if (variants.length === 0) {
      console.log("No product variants found, seeding some dummy products and variants...");
      const [category] = await db.ProductCategory.findOrCreate({
        where: { id: 1 },
        defaults: {
          id: 1,
          name: "Điện thoại",
          description: "Điện thoại di động thông minh",
          status: "ACTIVE"
        }
      });

      const p1 = await Product.create({
        id: 1,
        name: "iPhone 15 Pro Max",
        description: "Điện thoại flagship mới nhất từ Apple",
        price: 29990000,
        category_id: category.id,
        status: "ACTIVE"
      });

      const p2 = await Product.create({
        id: 2,
        name: "Samsung Galaxy S24 Ultra",
        description: "Điện thoại flagship Android với AI features",
        price: 24990000,
        category_id: category.id,
        status: "ACTIVE"
      });

      await ProductVariant.create({
        id: 1,
        product_id: p1.id,
        sku: "IP15PM-256-GR",
        price: 29990000,
        status: "active"
      });

      await ProductVariant.create({
        id: 2,
        product_id: p2.id,
        sku: "S24U-256-TI",
        price: 24990000,
        status: "active"
      });

      variants = await ProductVariant.findAll();
      console.log("Dummy products and variants seeded successfully.");
    } else {
      console.log(`Found ${variants.length} existing variants.`);
    }

    // 5. Generate dummy orders for target user (customer_id: 1)
    console.log("Generating dummy orders...");
    const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    
    // For each status, we create 4 orders
    let orderCount = 0;
    for (const status of statuses) {
      console.log(`Creating 4 dummy orders for status: ${status}...`);
      for (let i = 1; i <= 4; i++) {
        let paymentStatus = "UNPAID";
        if (status === "DELIVERED" || status === "SHIPPED" || status === "PROCESSING" || status === "CONFIRMED") {
          paymentStatus = "PAID";
        } else if (status === "CANCELLED") {
          paymentStatus = Math.random() > 0.5 ? "REFUNDED" : "UNPAID";
        }

        const selectedVariant = variants[Math.floor(Math.random() * variants.length)];
        const qty = Math.floor(Math.random() * 2) + 1; // 1 or 2
        const itemPrice = parseFloat(selectedVariant.price);
        const totalPrice = itemPrice * qty;

        const now = new Date();
        const createdDate = new Date(now.getTime() - (Math.random() * 10 + 1) * 24 * 60 * 60 * 1000); // 1-10 days ago

        const order = await Order.create({
          customer_id: 1,
          order_status: status,
          payment_status: paymentStatus,
          total_price: totalPrice,
          created_at: createdDate,
          confirmed_at: (status !== "PENDING" && status !== "CANCELLED") ? new Date(createdDate.getTime() + 30 * 60 * 1000) : null,
          shipped_at: (status === "SHIPPED" || status === "DELIVERED") ? new Date(createdDate.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
          delivered_at: (status === "DELIVERED") ? new Date(createdDate.getTime() + 4 * 24 * 60 * 60 * 1000) : null,
          cancelled_at: (status === "CANCELLED") ? new Date(createdDate.getTime() + 2 * 60 * 60 * 1000) : null,
          notes: `Đơn hàng ảo thử nghiệm số ${i} cho trạng thái ${status}`,
          shipping_address_id: address.id,
          shipping_address_snapshot: JSON.stringify({
            recipient_name: "Nguyễn Kiệt",
            phone: "0901234567",
            address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
          })
        });

        await OrderItem.create({
          order_id: order.id,
          variant_id: selectedVariant.id,
          quantity: qty,
          price: itemPrice
        });

        orderCount++;
      }
    }

    console.log(`\n✅ Seeding complete! Generated ${orderCount} dummy orders for user 1 successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error running seeding script:", error);
    process.exit(1);
  }
};

seedAdminAndOrders();
