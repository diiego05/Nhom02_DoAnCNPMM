import db from "../models/index.js";

const getMyAddresses = async (userId) => {
  return await db.Address.findAll({
    where: { user_id: userId },
    order: [
      ["is_default", "DESC"],
      ["created_at", "DESC"],
    ],
  });
};

const getAddressById = async (id, userId) => {
  return await db.Address.findOne({
    where: { id, user_id: userId },
  });
};

const createAddress = async (userId, data) => {
  const transaction = await db.sequelize.transaction();
  try {
    // Nếu đây là địa chỉ mặc định, cập nhật các địa chỉ khác thành false
    if (data.is_default) {
      await db.Address.update(
        { is_default: false },
        { where: { user_id: userId }, transaction }
      );
    } else {
      // Nếu user chưa có địa chỉ nào, set địa chỉ này thành mặc định
      const count = await db.Address.count({ where: { user_id: userId } });
      if (count === 0) {
        data.is_default = true;
      }
    }

    const newAddress = await db.Address.create(
      {
        user_id: userId,
        recipient_name: data.recipient_name,
        phone_number: data.phone_number,
        address_line: data.address_line,
        is_default: data.is_default || false,
      },
      { transaction }
    );

    await transaction.commit();
    return newAddress;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateAddress = async (id, userId, data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const address = await db.Address.findOne({
      where: { id, user_id: userId },
    });
    if (!address) {
      throw new Error("Address not found");
    }

    if (data.is_default && !address.is_default) {
      await db.Address.update(
        { is_default: false },
        { where: { user_id: userId }, transaction }
      );
    }

    await address.update(
      {
        recipient_name: data.recipient_name ?? address.recipient_name,
        phone_number: data.phone_number ?? address.phone_number,
        address_line: data.address_line ?? address.address_line,
        is_default: data.is_default ?? address.is_default,
      },
      { transaction }
    );

    await transaction.commit();
    return address;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteAddress = async (id, userId) => {
  const address = await db.Address.findOne({
    where: { id, user_id: userId },
  });
  if (!address) {
    throw new Error("Address not found");
  }
  
  const wasDefault = address.is_default;
  await address.destroy();

  // Nếu xóa địa chỉ mặc định, set một địa chỉ khác làm mặc định
  if (wasDefault) {
    const anotherAddress = await db.Address.findOne({
      where: { user_id: userId },
    });
    if (anotherAddress) {
      anotherAddress.is_default = true;
      await anotherAddress.save();
    }
  }

  return true;
};

export default {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
