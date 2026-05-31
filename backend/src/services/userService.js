import db from "../models/index.js";

const getUserProfileById = (id) => {
  // TODO: Implement get user by id
  return new Promise(async (resolve, reject) => {
    try {
      let userProfile = await db.UserProfile.findOne({
        where: { user_id: id },
        raw: true,
      });
      let userAccount = await db.User.findByPk(id, { attributes: ["loyalty_points", "email", "phone"], raw: true });
      if (userProfile || userAccount) {
        resolve({ ...userProfile, ...userAccount });
      } else {
        resolve({});
      }
    } catch (error) {
      reject(error);
    }
  });
};

const updateUserProfile = (data) => {
  // TODO: Implement update user
  return new Promise(async (resolve, reject) => {
    try {
      console.log("data.user_id:", data.user_id);
      let userProfile = await db.UserProfile.findOne({
        where: { user_id: data.user_id },
      });
      if (userProfile) {
        await userProfile.update({
          full_name: data.full_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          id_card: data.id_card,
          avatar_url: data.avatar_url,
          cover_photo_url: data.cover_photo_url,
        });
        resolve(userProfile);
      } else {
        resolve({});
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getFavorites = async (userId) => {
  return await db.Wishlist.findAll({
    where: { user_id: userId },
    include: [
      { 
        model: db.Product, 
        as: "product",
        include: [
          {
            model: db.ProductImage,
            as: "images",
            where: { is_primary: true },
            required: false,
          }
        ]
      }
    ],
    order: [["created_at", "DESC"]],
  });
};

const getViewedProducts = async (userId) => {
  return await db.UserViewedProduct.findAll({
    where: { user_id: userId },
    include: [
      { 
        model: db.Product, 
        as: "product",
        include: [
          {
            model: db.ProductImage,
            as: "images",
            where: { is_primary: true },
            required: false,
          }
        ]
      }
    ],
    order: [["viewed_at", "DESC"]],
    limit: 20,
  });
};

export default {
  getUserProfileById,
  updateUserProfile,
  getFavorites,
  getViewedProducts,
};
