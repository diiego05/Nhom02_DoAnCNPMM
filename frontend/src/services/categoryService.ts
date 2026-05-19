import { publicAxios } from "./axiosClient";
import type { Category } from "@/types/category.types";

export const categoryService = {
  getAllCategories: async () => {
    const response = await publicAxios.get("/categories");
    return response.data.data as Category[];
  },
};
