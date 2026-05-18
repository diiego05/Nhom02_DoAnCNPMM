import db from "./src/models/index.js";
import bcrypt from "bcryptjs";

const createVendorAccount = async () => {
  try {
    // 1. Ensure Roles exist
    const [adminRole] = await db.Role.findOrCreate({ where: { role_name: "ADMIN" } });
    const [userRole] = await db.Role.findOrCreate({ where: { role_name: "USER" } });
    const [vendorRole] = await db.Role.findOrCreate({ where: { role_name: "VENDOR" } });
    const [managerRole] = await db.Role.findOrCreate({ where: { role_name: "MANAGER" } });

    console.log("Roles verified/created.");

    // 2. Create Vendor User
    const email = "vendor@test.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const [user, created] = await db.User.findOrCreate({
      where: { email },
      defaults: {
        password: hashedPassword,
        role_id: vendorRole.id,
        status: "ACTIVE",
        auth_provider: "local"
      }
    });

    if (created) {
      console.log(`User ${email} created successfully.`);
      
      // 3. Create User Profile
      await db.UserProfile.create({
        user_id: user.id,
        full_name: "Test Vendor",
        gender: "male",
        address: "123 UTEShop St, HCMC"
      });
      console.log("User profile created.");
    } else {
      // Update existing user to be a vendor and active
      await user.update({
        role_id: vendorRole.id,
        status: "ACTIVE"
      });
      console.log(`User ${email} already existed, updated to VENDOR role and ACTIVE status.`);
    }

    console.log("\n-----------------------------------");
    console.log("VENDOR ACCOUNT DETAILS:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------\n");

    process.exit(0);
  } catch (err) {
    console.error("Error creating vendor account:", err);
    process.exit(1);
  }
};

createVendorAccount();
