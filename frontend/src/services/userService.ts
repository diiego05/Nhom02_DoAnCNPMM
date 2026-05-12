import { axiosClient } from "@/services/axiosClient";

export type UpdateProfileData = {
  full_name?: string;
  date_of_birth?: string;
  address?: string;
  gender?: string;
  id_card?: string;
  avatar_url?: string;
  cover_photo_url?: string;
};

export const userService = {
  getProfile: () => axiosClient.get("/user/profile"),
  updateProfile: (data: UpdateProfileData | FormData) =>
    axiosClient.put("/user/edit-profile", data),
};
