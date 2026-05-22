import userService from "../services/userService.js";

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const user = await userService.getUserProfileById(userId);

    return res.status(200).json({
      message: "Profile retrieved successfully",
      data: {
        fullName: user.full_name,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        avatarUrl: user.avatar_url,
        coverPhotoUrl: user.cover_photo_url,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const data = { ...req.body, user_id: req.user.id };

    // Nếu có file tải lên (Cloudinary), gán URL trực tiếp cho avatar_url
    if (req.file) {
      data.avatar_url = req.file.path;
    }

    const user = await userService.updateUserProfile(data);
    return res.status(200).json({
      message: "Profile updated successfully",
      data: {
        fullName: user.full_name,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        avatarUrl: user.avatar_url,
        coverPhotoUrl: user.cover_photo_url,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getUserProfile,
  updateUserProfile,
};
