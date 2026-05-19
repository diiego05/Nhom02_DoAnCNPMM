import {
  Product,
  ProductFilters,
  ProductListResponse,
} from "@/types/product.types";
import { publicAxios } from "./axiosClient";

const productService = {
  // Lấy danh sách sản phẩm với bộ lọc
  getProducts: async (filters: ProductFilters) => {
    // Lọc bỏ các tham số undefined/null
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null),
    );
    const response = await publicAxios.get("/products", {
      params: cleanFilters,
    });
    return response.data.data as ProductListResponse;
  },

  // Lấy chi tiết sản phẩm
  getProductBySlug: async (slug: string) => {
    const response = await publicAxios.get(`/products/${slug}`);
    return response.data.data as Product;
  },

  // Lấy sản phẩm nổi bật
  getFeaturedProducts: async (limit = 10) => {
    const response = await publicAxios.get("/products/featured", {
      params: { limit },
    });
    return response.data.data as Product[];
  },

  // Lấy sản phẩm mới nhất
  getNewestProducts: async (limit = 10) => {
    const response = await publicAxios.get("/products/newest", {
      params: { limit },
    });
    return response.data.data as Product[];
  },

  // Lấy sản phẩm bán chạy nhất
  getBestSellerProducts: async (limit = 10) => {
    const response = await publicAxios.get("/products/best-sellers", {
      params: { limit },
    });
    return response.data.data as Product[];
  },

  // Lấy sản phẩm xem nhiều nhất
  getMostViewedProducts: async (limit = 10) => {
    const response = await publicAxios.get("/products/most-viewed", {
      params: { limit },
    });
    return response.data.data as Product[];
  },

  // Lấy sản phẩm tương tự
  getSimilarProducts: async (slug: string) => {
    const response = await publicAxios.get(`/products/${slug}/similar`);
    return response.data.data as Product[];
  },
};

export default productService;
