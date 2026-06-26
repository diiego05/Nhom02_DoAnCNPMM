import {
  LayoutDashboard,
  Settings,
  Package,
  ShoppingCart,
  Percent,
  Wallet,
  MessageSquare,
  ExternalLink,
  Search,
  Bell,
  Plus,
  Filter,
  ArrowUpRight,
  Star,
  ShoppingBag,
  Heart,
  Store,
  TrendingUp,
  Clock,
  CheckCircle2,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  FileDown,
  MessageCircle,
  Send,
  MoreHorizontal,
  Paperclip,
  Smile,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import useAuth from "@/hooks/useAuth";
import {
  vendorService,
  ShopProfileData,
  ProductData,
  VoucherData,
} from "@/services/vendorService";
import { chatService } from "@/services/chatService";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

const DEFAULT_SHOP_LOGO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='128' height='128'><rect width='100' height='100' fill='%23FFE4D6' stroke='black' stroke-width='4'/><path d='M20 40 L50 15 L80 40 L80 85 L20 85 Z' fill='white' stroke='black' stroke-width='4'/><rect x='40' y='55' width='20' height='30' fill='%23D97736' stroke='black' stroke-width='4'/><path d='M15 40 L85 40' stroke='black' stroke-width='4'/></svg>";

// Gọi API danh mục để hiển thị trong form thêm/sửa sản phẩm
import { publicAxios } from "@/services/axiosClient";

interface CustomSelectProps {
  label: string;
  value: string | number;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder = "-- Chọn --",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(
    (opt) => opt.value?.toString() === value?.toString(),
  );
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2 relative" ref={selectRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-4 font-bold text-left focus:outline-none flex justify-between items-center transition-all select-none hover:bg-gray-100/50 shadow-sm active:translate-y-[1px]"
      >
        <span className="text-xs font-bold">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={20}
          className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ strokeWidth: 3 }}
        />
      </button>
      {isOpen && (
        <ul className="absolute top-full left-0 mt-1 w-full bg-white border-2 border-black rounded-none z-50 shadow-lg max-h-60 overflow-y-auto divide-y divide-black/10 animate-in fade-in slide-in-from-top-1 duration-150 custom-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.value.toString() === value?.toString();
            return (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value.toString());
                  setIsOpen(false);
                }}
                className={`px-5 py-3 text-xs font-bold cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary/25 text-black font-black"
                    : "hover:bg-gray-50 text-gray-700 hover:text-black"
                }`}
              >
                <span>{opt.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const VendorDashboard = () => {
  const { user, handleLogout } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Shop state
  const [shopInfo, setShopInfo] = useState<ShopProfileData | null>(null);

  // Form Đăng ký Shop removed (moved to RegisterShopPage)

  // Overview Stats state
  const [stats, setStats] = useState({
    revenue: 0,
    netRevenue: 0,
    availableBalance: 0,
    ordersCount: 0,
    productsCount: 0,
    commentsCount: 0,
    dailyRevenue: [0, 0, 0, 0, 0, 0, 0],
  });

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsPage, setProductsPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [productView, setProductView] = useState<"list" | "add" | "edit">(
    "list",
  );
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Biến thể state
  const [hasVariants, setHasVariants] = useState(false);
  const [productVariants, setProductVariants] = useState<any[]>([]);

  // State nhập nhanh biến thể
  const [bulkSizes, setBulkSizes] = useState("");
  const [bulkColors, setBulkColors] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkSalePrice, setBulkSalePrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    category_id: "",
    brand_id: "",
    description: "",
    price: 0,
    sale_price: "",
    gender: "UNISEX",
    material: "",
    stock_quantity: 10,
    image_url: "",
  });

  const [productImageType, setProductImageType] = useState<"url" | "file">(
    "url",
  );
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
  const [shopAvatarType, setShopAvatarType] = useState<"url" | "file">("url");
  const [shopCoverType, setShopCoverType] = useState<"url" | "file">("url");
  const [isUploadingShopImage, setIsUploadingShopImage] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [activeChatIndex, setActiveChatIndex] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  // Promos state
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [voucherForm, setVoucherForm] = useState({
    code: "",
    description: "",
    discount_type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discount_value: 0,
    min_order_amount: 0,
    max_discount: "",
    usage_limit: "",
    per_user_limit: 1,
    start_date: "",
    end_date: "",
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    phone: "",
    address: "",
    industry: "",
    description: "",
    avatar_url: "",
    cover_url: "",
  });

  // Tải thông tin Shop khi component được mount hoặc user thay đổi
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const res = await vendorService.getMyShopInfo();
        if (res && res.data) {
          setShopInfo(res.data);
          setIsRegistered(true);
          // Gán giá trị form cấu hình shop
          setSettingsForm({
            name: res.data.name || "",
            phone: res.data.phone || "",
            address: res.data.address || "",
            industry: res.data.industry || "",
            description: res.data.description || "",
            avatar_url: res.data.avatar_url || "",
            cover_url: res.data.cover_url || "",
          });
        }
      } catch (err) {
        console.log("Chưa đăng ký shop hoặc lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchShopData();
    }
  }, [user]);

  // Tải danh mục sản phẩm từ backend
  useEffect(() => {
    publicAxios
      .get("/categories")
      .then((res) => {
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.log("Lỗi tải danh mục:", err));
  }, []);

  // Tải thương hiệu sản phẩm từ backend
  useEffect(() => {
    publicAxios
      .get("/brands")
      .then((res) => {
        if (res.data && res.data.data) {
          setBrands(res.data.data);
        }
      })
      .catch((err) => console.log("Lỗi tải thương hiệu:", err));
  }, []);

  // Tải dữ liệu các tab tương ứng khi hoạt động
  useEffect(() => {
    if (!isRegistered || !shopInfo) return;

    if (activeTab === "overview") {
      vendorService
        .getShopStatistics()
        .then((res) => {
          if (res && res.data) {
            setStats(res.data);
          }
        })
        .catch((err) => console.log("Lỗi tải thống kê:", err));
    } else if (activeTab === "products") {
      fetchShopProducts();
    } else if (activeTab === "orders") {
      fetchShopOrders();
    } else if (activeTab === "promos") {
      fetchShopVouchers();
    } else if (activeTab === "interactions") {
      fetchShopReviews();
    } else if (activeTab === "finance") {
      fetchWithdrawalHistory();
    }
  }, [activeTab, isRegistered, shopInfo, productsPage]);

  // Polling lấy danh sách cuộc trò chuyện cho Vendor
  useEffect(() => {
    if (activeTab !== "chats" || !isRegistered) return;

    const fetchConversations = async () => {
      try {
        const res = await chatService.getConversations();
        if (res && res.data) {
          setConversations(res.data);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách cuộc trò chuyện:", err);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [activeTab, isRegistered]);

  // Polling lấy tin nhắn chat thực tế giữa Vendor và Khách hàng
  useEffect(() => {
    if (activeTab !== "chats" || !isRegistered || conversations.length === 0)
      return;

    const partner = conversations[activeChatIndex]?.partner;
    if (!partner) return;

    const fetchChat = async () => {
      try {
        const res = await chatService.getChatHistory(partner.id);
        if (res && res.data) {
          setChatMessages(res.data);
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử chat:", err);
      }
    };

    fetchChat();

    const interval = setInterval(fetchChat, 3000); // Poll sau mỗi 3 giây
    return () => clearInterval(interval);
  }, [activeTab, activeChatIndex, isRegistered, conversations]);

  const fetchShopProducts = async () => {
    if (!shopInfo) return;
    try {
      const res = await vendorService.getShopProducts(shopInfo.id, {
        page: productsPage,
        limit: 5,
      });
      if (res && res.data) {
        setProducts(res.data.products);
        setProductsTotal(res.data.total);
      }
    } catch (err) {
      console.log("Lỗi tải sản phẩm:", err);
    }
  };

  const fetchShopOrders = async () => {
    try {
      const res = await vendorService.getShopOrders();
      if (res && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.log("Lỗi tải đơn hàng:", err);
    }
  };

  const fetchShopVouchers = async () => {
    if (!shopInfo) return;
    try {
      const res = await vendorService.getShopVouchers(shopInfo.id);
      if (res && res.data) {
        setVouchers(res.data);
      }
    } catch (err) {
      console.log("Lỗi tải vouchers:", err);
    }
  };

  const fetchShopReviews = async () => {
    try {
      const res = await vendorService.getShopReviews();
      if (res && res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.log("Lỗi tải bình luận:", err);
    }
  };

  // --- HÀNH ĐỘNG XỬ LÝ (Handlers) ---

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingProductImage(true);
      const res = await vendorService.uploadImage(file);
      if (res && res.url) {
        setProductForm((prev) => ({ ...prev, image_url: res.url }));
      }
    } catch (err) {
      console.error(err);
      alert("Tải ảnh lên thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploadingProductImage(false);
    }
  };

  const handleShopAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingShopImage(true);
      const res = await vendorService.uploadImage(file);
      if (res && res.url) {
        setSettingsForm((prev) => ({ ...prev, avatar_url: res.url }));
      }
    } catch (err) {
      console.error(err);
      alert("Tải ảnh đại diện thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploadingShopImage(false);
    }
  };

  const handleShopCoverUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingShopImage(true);
      const res = await vendorService.uploadImage(file);
      if (res && res.url) {
        setSettingsForm((prev) => ({ ...prev, cover_url: res.url }));
      }
    } catch (err) {
      console.error(err);
      alert("Tải ảnh bìa thất bại. Vui lòng thử lại!");
    } finally {
      setIsUploadingShopImage(false);
    }
  };

  // Đăng ký gian hàng moved to RegisterShopPage

  // Tạo & Cập nhật sản phẩm
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Chuẩn bị variants
      let finalVariants: any[] = [];
      let totalStock = parseInt(productForm.stock_quantity.toString());

      if (hasVariants) {
        if (productVariants.length === 0) {
          alert(
            "Vui lòng thêm ít nhất một biến thể hoặc tắt chế độ đa biến thể!",
          );
          return;
        }
        finalVariants = productVariants.map((v, i) => ({
          size: v.size || "Free Size",
          color: v.color || "Default",
          color_hex: v.color_hex || "#888888",
          price: parseFloat(v.price.toString()),
          sale_price: v.sale_price
            ? parseFloat(v.sale_price.toString())
            : undefined,
          stock_quantity: parseInt(v.stock_quantity.toString()),
        }));
        // Tính tổng tồn kho từ tất cả biến thể
        totalStock = finalVariants.reduce(
          (sum, v) => sum + v.stock_quantity,
          0,
        );
      } else {
        // Tự động map một variant mặc định nếu là đơn biến thể
        finalVariants = [
          {
            size: "Free Size",
            color: "Default",
            color_hex: "#888888",
            price: parseFloat(productForm.price.toString()),
            stock_quantity: parseInt(productForm.stock_quantity.toString()),
          },
        ];
      }

      const payload: ProductData = {
        name: productForm.name,
        category_id: parseInt(productForm.category_id),
        brand_id: productForm.brand_id
          ? parseInt(productForm.brand_id)
          : undefined,
        description: productForm.description,
        price: parseFloat(productForm.price.toString()),
        sale_price: productForm.sale_price
          ? parseFloat(productForm.sale_price.toString())
          : undefined,
        gender: productForm.gender,
        material: productForm.material,
        stock_quantity: totalStock,
        variants: finalVariants,
        images: productForm.image_url
          ? [{ image_url: productForm.image_url }]
          : [],
      };

      if (editingProduct) {
        await vendorService.updateProduct(editingProduct.id, payload);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await vendorService.createProduct(payload);
        alert("Thêm sản phẩm thành công!");
      }

      setProductView("list");
      setEditingProduct(null);
      fetchShopProducts();
    } catch (err) {
      console.error(err);
      alert("Lỗi xử lý sản phẩm!");
    }
  };

  const startEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      category_id: prod.category_id?.toString() || "",
      brand_id: prod.brand_id?.toString() || "",
      description: prod.description || "",
      price: prod.price || 0,
      sale_price: prod.sale_price?.toString() || "",
      gender: prod.gender || "UNISEX",
      material: prod.material || "",
      stock_quantity: prod.stock_quantity || 10,
      image_url: prod.images && prod.images[0] ? prod.images[0].image_url : "",
    });

    // Nếu sản phẩm có biến thể
    if (prod.variants && prod.variants.length > 0) {
      // Kiểm tra xem có phải là biến thể mặc định không
      const isDefault =
        prod.variants.length === 1 &&
        prod.variants[0].size === "Free Size" &&
        (prod.variants[0].color === "Default" ||
          prod.variants[0].color === "Mặc định");

      if (!isDefault) {
        setHasVariants(true);
        setProductVariants(
          prod.variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            color_hex: v.color_hex || "#888888",
            price: v.price || 0,
            sale_price: v.sale_price || "",
            stock_quantity: v.stock_quantity || 0,
          })),
        );
      } else {
        setHasVariants(false);
        setProductVariants([]);
      }
    } else {
      setHasVariants(false);
      setProductVariants([]);
    }

    setBulkSizes("");
    setBulkColors("");
    setBulkPrice("");
    setBulkSalePrice("");
    setBulkStock("");
    setProductImageType("url");
    setProductView("edit");
  };

  const generateBulkVariants = () => {
    if (!bulkSizes && !bulkColors) {
      alert("Vui lòng nhập danh sách kích thước hoặc màu sắc để tạo!");
      return;
    }

    const sizes = bulkSizes
      ? bulkSizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : ["Free Size"];
    const colors = bulkColors
      ? bulkColors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : ["Default"];

    const newVariants: any[] = [];
    sizes.forEach((size) => {
      colors.forEach((color) => {
        // Kiểm tra xem biến thể này đã tồn tại chưa để tránh trùng lặp
        const exists = productVariants.some(
          (v) =>
            v.size.toLowerCase() === size.toLowerCase() &&
            v.color.toLowerCase() === color.toLowerCase(),
        );
        if (!exists) {
          newVariants.push({
            size,
            color,
            color_hex: "#888888",
            price: parseFloat(productForm.price.toString()) || 0,
            sale_price: "",
            stock_quantity: 10,
          });
        }
      });
    });

    if (newVariants.length > 0) {
      setProductVariants([...productVariants, ...newVariants]);
      alert(`Đã tạo thêm ${newVariants.length} biến thể!`);
    } else {
      alert("Không có biến thể mới nào được tạo (có thể đã bị trùng lặp).");
    }
  };

  const applyBulkSettings = () => {
    if (productVariants.length === 0) {
      alert("Không có biến thể nào để áp dụng!");
      return;
    }

    let updated = [...productVariants];
    let hasChanges = false;

    if (bulkPrice) {
      const priceVal = parseFloat(bulkPrice);
      updated = updated.map((v) => ({ ...v, price: priceVal }));
      hasChanges = true;
    }

    if (bulkSalePrice) {
      const salePriceVal = parseFloat(bulkSalePrice);
      updated = updated.map((v) => ({ ...v, sale_price: salePriceVal }));
      hasChanges = true;
    }

    if (bulkStock) {
      const stockVal = parseInt(bulkStock);
      updated = updated.map((v) => ({ ...v, stock_quantity: stockVal }));
      hasChanges = true;
    }

    if (hasChanges) {
      setProductVariants(updated);
      alert("Đã áp dụng các thiết lập cho tất cả biến thể!");
    } else {
      alert("Vui lòng nhập Giá gốc, Giá khuyến mãi hoặc Tồn kho để áp dụng!");
    }
  };

  const addSingleVariant = () => {
    setProductVariants([
      ...productVariants,
      {
        size: "M",
        color: "Mặc định",
        color_hex: "#888888",
        price: parseFloat(productForm.price.toString()) || 0,
        sale_price: "",
        stock_quantity: 10,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    const updated = [...productVariants];
    updated.splice(index, 1);
    setProductVariants(updated);
  };

  const updateVariantField = (index: number, field: string, value: any) => {
    const updated = [...productVariants];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setProductVariants(updated);
  };

  const handleDeleteProduct = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Ngừng bán sản phẩm",
      message: "Bạn có chắc chắn muốn ngừng bán sản phẩm này?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await vendorService.deleteProduct(id);
          alert("Đã ngưng bán sản phẩm!");
          fetchShopProducts();
        } catch (err) {
          console.error(err);
          alert("Lỗi khi ngưng bán sản phẩm!");
        }
      },
    });
  };

  // Xác nhận đơn hàng
  const handleConfirmOrder = async (orderId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận đơn hàng",
      message: "Bạn có chắc chắn muốn xác nhận đơn hàng này?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await vendorService.confirmOrder(orderId);
          alert("Đã xác nhận đơn hàng thành công!");
          fetchShopOrders();
        } catch (err: any) {
          console.error(err);
          alert(err.response?.data?.message || "Lỗi khi xác nhận đơn hàng!");
        }
      },
    });
  };

  // Chuẩn bị hàng
  const handlePrepareOrder = async (orderId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Chuẩn bị hàng",
      message:
        "Bạn có chắc chắn đã đóng gói xong và muốn chuyển trạng thái đơn hàng sang chuẩn bị hàng?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await vendorService.prepareOrder(orderId);
          alert("Đã chuẩn bị hàng thành công!");
          fetchShopOrders();
        } catch (err: any) {
          console.error(err);
          alert(err.response?.data?.message || "Lỗi khi chuẩn bị hàng!");
        }
      },
    });
  };

  // Sẵn sàng giao
  const handleReadyOrder = async (orderId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Sẵn sàng giao",
      message:
        "Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang sẵn sàng giao?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await vendorService.readyOrder(orderId);
          alert("Đã sẵn sàng giao thành công!");
          fetchShopOrders();
        } catch (err: any) {
          console.error(err);
          alert(err.response?.data?.message || "Lỗi khi cập nhật!");
        }
      },
    });
  };

  // Nhận hàng hoàn
  const handleConfirmReturn = async (orderId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận nhận hàng hoàn",
      message:
        "Bạn có chắc chắn đã nhận lại hàng hoàn từ shipper?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await vendorService.confirmReturn(orderId);
          alert("Xác nhận nhận hàng hoàn thành công!");
          fetchShopOrders();
        } catch (err: any) {
          console.error(err);
          alert(err.response?.data?.message || "Lỗi khi cập nhật!");
        }
      },
    });
  };

  // Xử lý hàng loạt
  const handleBulkUpdate = async (status: string) => {
    let targetStatus = "";
    let actionText = "";
    if (status === "PENDING") {
      targetStatus = "CONFIRMED";
      actionText = "xác nhận tất cả";
    } else if (status === "CONFIRMED") {
      targetStatus = "PREPARING";
      actionText = "chuẩn bị tất cả";
    } else if (status === "PREPARING") {
      targetStatus = "READY_FOR_PICKUP";
      actionText = "sẵn sàng giao tất cả";
    } else {
      return;
    }

    const eligibleOrders = orders
      .filter((o: any) => o.status === status)
      .map((o: any) => o.id);
    if (eligibleOrders.length === 0) {
      alert(`Không có đơn hàng nào hợp lệ để ${actionText}!`);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Xử lý hàng loạt",
      message: `Bạn có chắc chắn muốn ${actionText} ${eligibleOrders.length} đơn hàng này không?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await vendorService.bulkUpdateOrdersStatus(
            eligibleOrders,
            targetStatus,
          );
          alert(`Đã ${actionText} thành công!`);
          fetchShopOrders();
        } catch (err: any) {
          console.error(err);
          alert(err.response?.data?.message || `Lỗi khi ${actionText}!`);
        }
      },
    });
  };

  // Gửi tin nhắn chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || chatCustomers.length === 0) return;

    const partner = chatCustomers[activeChatIndex];
    if (!partner) return;

    try {
      const textToSend = chatInputText;
      setChatInputText(""); // Clear input early for responsiveness
      const res = await chatService.sendMessage(partner.id, textToSend);
      if (res && res.data) {
        setChatMessages((prev) => [...prev, res.data]);
        const convRes = await chatService.getConversations();
        if (convRes && convRes.data) {
          setConversations(convRes.data);
        }
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    }
  };

  // Lấy lịch sử rút tiền
  const fetchWithdrawalHistory = async () => {
    try {
      const res = await vendorService.getWithdrawalHistory();
      if (res && res.data) {
        setWithdrawals(res.data);
      }
    } catch (err) {
      console.log("Lỗi tải lịch sử rút tiền:", err);
    }
  };

  // Gửi yêu cầu rút tiền
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawForm.amount);
    if (isNaN(amt) || amt <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ!");
      return;
    }
    if (
      !withdrawForm.bankName ||
      !withdrawForm.accountNumber ||
      !withdrawForm.accountName
    ) {
      alert("Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng!");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Yêu cầu rút tiền",
      message: `Bạn có chắc chắn muốn gửi yêu cầu rút số tiền ${amt.toLocaleString()}₫ về tài khoản ngân hàng ${withdrawForm.bankName}?`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await vendorService.requestWithdrawal({
            amount: amt,
            bank_name: withdrawForm.bankName,
            account_number: withdrawForm.accountNumber,
            account_name: withdrawForm.accountName,
          });
          alert("Đã gửi yêu cầu rút tiền thành công. Vui lòng chờ phê duyệt!");
          setWithdrawForm((prev) => ({ ...prev, amount: "" })); // Xoá trắng số tiền
          fetchWithdrawalHistory();

          // Load lại stats để cập nhật số dư khả dụng
          vendorService.getShopStatistics().then((res) => {
            if (res && res.data) {
              setStats(res.data);
            }
          });
        } catch (err: any) {
          console.error(err);
          alert(err.response?.data?.message || "Lỗi khi gửi yêu cầu rút tiền!");
        }
      },
    });
  };

  // Tạo mã giảm giá
  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: VoucherData = {
        code: voucherForm.code,
        description: voucherForm.description,
        discount_type: voucherForm.discount_type,
        discount_value: parseFloat(voucherForm.discount_value.toString()),
        min_order_amount: parseFloat(voucherForm.min_order_amount.toString()),
        max_discount: voucherForm.max_discount
          ? parseFloat(voucherForm.max_discount.toString())
          : undefined,
        usage_limit: voucherForm.usage_limit
          ? parseInt(voucherForm.usage_limit.toString())
          : undefined,
        per_user_limit: parseInt(voucherForm.per_user_limit.toString()),
        start_date: voucherForm.start_date || undefined,
        end_date: voucherForm.end_date || undefined,
      };

      await vendorService.createVoucher(payload);
      alert("Tạo mã giảm giá thành công!");
      setShowVoucherModal(false);
      fetchShopVouchers();
    } catch (err) {
      console.error(err);
      alert("Lỗi tạo mã giảm giá!");
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Hủy mã giảm giá",
      message: "Bạn có chắc chắn muốn hủy mã giảm giá này?",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await vendorService.deleteVoucher(id);
          alert("Đã xóa mã giảm giá!");
          fetchShopVouchers();
        } catch (err) {
          console.error(err);
          alert("Lỗi hủy mã giảm giá!");
        }
      },
    });
  };

  // Cập nhật cấu hình Shop
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await vendorService.updateMyShopInfo(settingsForm);
      if (res && res.data) {
        setShopInfo(res.data);
        alert("Cập nhật thông tin cửa hàng thành công!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật thông tin cửa hàng!");
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Tổng quan", icon: <LayoutDashboard size={20} /> },
    { id: "products", label: "Sản phẩm", icon: <Package size={20} /> },
    { id: "orders", label: "Đơn hàng", icon: <ShoppingCart size={20} /> },
    { id: "promos", label: "Khuyến mãi", icon: <Percent size={20} /> },
    { id: "finance", label: "Ví & Doanh thu", icon: <Wallet size={20} /> },
    { id: "chats", label: "Chat với khách", icon: <MessageCircle size={20} /> },
    {
      id: "interactions",
      label: "Bình luận & Đánh giá",
      icon: <MessageSquare size={20} />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center">
        <p className="text-xl font-black uppercase tracking-widest animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  // --- TRANG ĐĂNG KÝ SHOP REMOVED ---
  if (!isRegistered && !loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase text-red-500 mb-2">
            Lỗi truy cập
          </h2>
          <p className="text-gray-500">
            Bạn chưa có gian hàng. Vui lòng quay lại trang chủ.
          </p>
        </div>
      </div>
    );
  }

  // Lấy các hoạt động gần đây thật của shop từ đơn hàng và đánh giá
  const getRecentActivities = () => {
    const activities: Array<{ title: string; time: string; icon: any }> = [];

    // Thêm đơn hàng
    orders.forEach((order: any) => {
      if (order.status === "PENDING") {
        activities.push({
          title: `Đơn hàng mới #${order.order_code} chờ xác nhận`,
          time: order.created_at
            ? new Date(order.created_at).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Vừa xong",
          icon: <Plus size={14} className="text-green-500" />,
        });
      } else if (order.status === "CONFIRMED" || order.status === "PREPARING") {
        activities.push({
          title: `Đơn hàng #${order.order_code} đang được xử lý`,
          time: order.created_at
            ? new Date(order.created_at).toLocaleDateString("vi-VN")
            : "Gần đây",
          icon: <Clock size={14} className="text-blue-500" />,
        });
      }
    });

    // Thêm đánh giá
    reviews.forEach((review: any) => {
      activities.push({
        title: `Đánh giá ${review.rating} sao từ ${review.user?.profile?.full_name || "khách hàng"}`,
        time: review.created_at
          ? new Date(review.created_at).toLocaleDateString("vi-VN")
          : "Gần đây",
        icon: <Star size={14} className="text-yellow-500 fill-yellow-500" />,
      });
    });

    if (activities.length === 0) {
      return [
        {
          title: "Hệ thống hoạt động bình thường",
          time: "Vừa xong",
          icon: <CheckCircle2 size={14} className="text-green-500" />,
        },
        {
          title: "Đang chờ đơn hàng và tương tác đầu tiên",
          time: "Hôm nay",
          icon: <Clock size={14} className="text-orange-500" />,
        },
      ];
    }

    return activities.slice(0, 4);
  };

  // Lấy danh sách khách hàng chat từ conversations thực tế
  const chatCustomers = conversations.map((c) => ({
    id: c.partner.id,
    name: c.partner.name,
    avatar: c.partner.avatar,
    unreadCount: c.unreadCount,
    lastMessage: c.lastMessage,
  }));

  // Lấy giá trị lớn nhất trong stats để làm mốc biểu đồ
  const maxRevenue = Math.max(...stats.dailyRevenue, 1);

  // --- TRANG DASHBOARD CHÍNH ---
  return (
    <div className="min-h-screen bg-[#F4F4F0] flex overflow-hidden">
      {/* Sidebar - Reference from admin-dashboard layout but Neo-Brutalist style */}
      <aside className="w-64 bg-white border-r-2 border-black flex flex-col h-screen sticky top-0 z-50 shrink-0">
        <div className="p-8 border-b-2 border-black/5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-black text-white border-2 border-black rounded-xl flex items-center justify-center group-hover:bg-primary transition-all shadow-subtle group-hover:shadow-none">
              <ShoppingBag size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-black tracking-tighter uppercase leading-none">
                UTEShop
              </span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                VENDOR
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? "bg-black text-white shadow-brutal translate-x-1" : "hover:bg-primary/10 text-gray-400 hover:text-black"}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        {/* Topbar (AppHeader style) */}
        <header className="bg-white/80 backdrop-blur-md border-b border-black/5 h-20 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="relative w-96 my-4">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-gray-50 border-2 border-black rounded-xl px-12 py-3 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs font-black uppercase text-gray-500">
                {shopInfo?.name}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                {shopInfo?.industry}
              </span>
            </div>

            <NotificationDropdown />

            <div className="w-[2px] h-8 bg-gray-100"></div>

            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-11 h-11 bg-primary/10 border-2 border-black rounded-xl flex items-center justify-center text-primary hover:bg-primary/20 transition-all active:translate-y-1 overflow-hidden shadow-sm"
              >
                {shopInfo?.avatar_url || shopInfo?.shop_logo ? (
                  <img
                    src={shopInfo.avatar_url || shopInfo.shop_logo}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={DEFAULT_SHOP_LOGO}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-4 w-64 bg-white border-2 border-black rounded-2xl shadow-brutal z-50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black overflow-hidden border border-black/10">
                      {shopInfo?.avatar_url || shopInfo?.shop_logo ? (
                        <img
                          src={shopInfo.avatar_url || shopInfo.shop_logo}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={DEFAULT_SHOP_LOGO}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase">
                        {shopInfo?.shop_name || shopInfo?.name}
                      </p>
                      <p className="text-[10px] text-primary font-bold">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Thông tin cửa hàng
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all mt-2"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Website <ExternalLink size={14} />
            </Link>

            <button className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-white text-black hover:bg-green-500 hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              Báo cáo <FileDown size={14} />
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-10 max-w-7xl w-full mx-auto">
          {/* TAB: TỔNG QUAN (Overview) */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-serif font-black tracking-tighter uppercase mb-2">
                    Thống kê cửa hàng
                  </h1>
                  <p className="text-gray-500 font-medium italic">
                    Tổng hợp tình hình kinh doanh của shop trong ngày.
                  </p>
                </div>
              </div>

              {/* Bento Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    label: "Doanh thu",
                    value: `${stats.revenue.toLocaleString()}₫`,
                    sub: "Hôm nay",
                    icon: <Wallet className="text-green-500" />,
                  },
                  {
                    label: "Đơn hàng",
                    value: stats.ordersCount.toString(),
                    sub: "Hôm nay",
                    icon: <ShoppingBag className="text-blue-500" />,
                  },
                  {
                    label: "Sản phẩm đang bán",
                    value: stats.productsCount.toString(),
                    sub: "Hoạt động",
                    icon: <Package className="text-orange-500" />,
                  },
                  {
                    label: "Bình luận & Đánh giá",
                    value: stats.commentsCount.toString(),
                    sub: "Tất cả",
                    icon: <MessageSquare className="text-red-500" />,
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-black/5">
                        {stat.icon}
                      </div>
                      <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                        {stat.sub}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-black tracking-tighter mt-1">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Mockup */}
                <div className="lg:col-span-2 bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                    <TrendingUp className="text-primary" /> Doanh thu 7 ngày qua
                    (₫)
                  </h3>
                  <div className="h-64 flex items-end justify-between gap-3 px-4">
                    {stats.dailyRevenue.map((val, i) => {
                      const heightPercentage = Math.round(
                        (val / maxRevenue) * 100,
                      );
                      return (
                        <div
                          key={i}
                          className="flex-grow bg-black rounded-t-xl hover:bg-primary transition-all relative group cursor-pointer"
                          style={{
                            height: `${Math.max(heightPercentage, 5)}%`,
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                            {val.toLocaleString()}₫
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-lg font-black uppercase tracking-tighter mb-6">
                    Hoạt động gần đây
                  </h3>
                  <div className="space-y-6">
                    {getRecentActivities().map((item, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="mt-1">{item.icon}</div>
                        <div>
                          <p className="text-xs font-black uppercase leading-tight">
                            {item.title}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SẢN PHẨM (Products) */}
          {activeTab === "products" && (
            <div className="space-y-8">
              {productView === "list" ? (
                <>
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-serif font-black uppercase">
                      Quản lý Sản phẩm
                    </h2>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: "",
                          category_id: categories[0]?.id?.toString() || "",
                          brand_id: "",
                          description: "",
                          price: 0,
                          sale_price: "",
                          gender: "UNISEX",
                          material: "",
                          stock_quantity: 10,
                          image_url: "",
                        });
                        setHasVariants(false);
                        setProductVariants([]);
                        setBulkSizes("");
                        setBulkColors("");
                        setBulkPrice("");
                        setBulkSalePrice("");
                        setBulkStock("");
                        setProductImageType("url");
                        setProductView("add");
                      }}
                      className="px-6 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-black text-white hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2"
                    >
                      <Plus size={16} /> THÊM SẢN PHẨM
                    </button>
                  </div>

                  <div className="bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="p-6 border-b-2 border-black/5 bg-gray-50/50 flex gap-4">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          placeholder="Tìm tên sản phẩm..."
                          className="w-full bg-white border-2 border-black rounded-xl px-10 py-2.5 text-xs font-bold"
                        />
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b-2 border-black/5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/30">
                            <th className="px-8 py-4">Sản phẩm</th>
                            <th className="px-8 py-4">Mã SKU</th>
                            <th className="px-8 py-4">Giá bán</th>
                            <th className="px-8 py-4">Tồn kho</th>
                            <th className="px-8 py-4">Trạng thái</th>
                            <th className="px-8 py-4 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black/5">
                          {products.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-8 py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
                              >
                                Không có sản phẩm nào
                              </td>
                            </tr>
                          ) : (
                            products.map((prod, i) => (
                              <tr
                                key={prod.id || i}
                                className="hover:bg-gray-50 transition-colors group"
                              >
                                <td className="px-8 py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-12 bg-gray-100 rounded-lg border border-black/5 overflow-hidden shrink-0">
                                      <img
                                        src={
                                          prod.images && prod.images[0]
                                            ? prod.images[0].image_url
                                            : "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=100"
                                        }
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="text-xs font-black uppercase truncate max-w-[200px]">
                                      {prod.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-8 py-4 text-xs font-mono font-bold text-gray-400">
                                  {prod.variants && prod.variants[0]
                                    ? prod.variants[0].sku
                                    : `PROD-00${prod.id}`}
                                </td>
                                <td className="px-8 py-4 text-xs font-black">
                                  {prod.price.toLocaleString()}₫
                                </td>
                                <td className="px-8 py-4 text-xs font-black text-primary">
                                  {prod.stock_quantity ||
                                    (prod.variants &&
                                      prod.variants.reduce(
                                        (sum: number, v: any) =>
                                          sum + v.stock_quantity,
                                        0,
                                      )) ||
                                    0}
                                </td>
                                <td className="px-8 py-4">
                                  <span
                                    className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${prod.status === "ACTIVE" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}
                                  >
                                    {prod.status === "ACTIVE"
                                      ? "Đang bán"
                                      : "Ngừng bán"}
                                  </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => startEditProduct(prod)}
                                      className="p-2 border-2 border-black rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    {prod.status === "ACTIVE" && (
                                      <button
                                        onClick={() =>
                                          handleDeleteProduct(prod.id)
                                        }
                                        className="p-2 border-2 border-black rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* GIAO DIỆN FORM SUB-VIEW TOÀN TRANG */
                <div className="bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-sm space-y-8 animate-in fade-in duration-200">
                  <div className="flex items-center gap-4 border-b-2 border-black/5 pb-6">
                    <button
                      onClick={() => setProductView("list")}
                      className="p-3 border-2 border-black rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center shadow-subtle active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Quay lại danh sách
                      </span>
                      <h2 className="text-2xl font-serif font-black uppercase tracking-tight">
                        {productView === "add"
                          ? "Thêm sản phẩm mới"
                          : "Cập nhật thông tin sản phẩm"}
                      </h2>
                    </div>
                  </div>

                  <form onSubmit={handleProductSubmit} className="space-y-8">
                    {/* Phần 1: Thông tin chung */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-primary border-l-4 border-primary pl-2">
                        1. Thông tin chung
                      </h3>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Tên sản phẩm
                        </label>
                        <input
                          type="text"
                          className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              name: e.target.value,
                            })
                          }
                          required
                          placeholder="Ví dụ: Áo thun Oversize Heritage UTEShop"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CustomSelect
                          label="Danh mục"
                          value={productForm.category_id}
                          placeholder="-- Chọn danh mục --"
                          options={categories.map((cat: any) => ({
                            value: cat.id,
                            label: cat.name,
                          }))}
                          onChange={(val) =>
                            setProductForm({ ...productForm, category_id: val })
                          }
                        />
                        <CustomSelect
                          label="Thương hiệu"
                          value={productForm.brand_id}
                          placeholder="-- Chọn thương hiệu --"
                          options={brands.map((b: any) => ({
                            value: b.id,
                            label: b.name,
                          }))}
                          onChange={(val) =>
                            setProductForm({ ...productForm, brand_id: val })
                          }
                        />
                        <CustomSelect
                          label="Phù hợp với giới tính"
                          value={productForm.gender}
                          placeholder="-- Chọn giới tính --"
                          options={[
                            { value: "MALE", label: "Nam" },
                            { value: "FEMALE", label: "Nữ" },
                            { value: "UNISEX", label: "Unisex (Cả nam và nữ)" },
                          ]}
                          onChange={(val) =>
                            setProductForm({ ...productForm, gender: val })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Chất liệu sản phẩm
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: 100% Cotton, Vải thô, Linen..."
                            className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3.5 font-bold focus:outline-none"
                            value={productForm.material}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                material: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Ảnh sản phẩm
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setProductImageType("url")}
                                className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black rounded-lg transition-all ${productImageType === "url" ? "bg-black text-white shadow-sm" : "bg-white text-black hover:bg-gray-50 active:translate-y-[1px]"}`}
                              >
                                Sử dụng URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductImageType("file")}
                                className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black rounded-lg transition-all ${productImageType === "file" ? "bg-black text-white shadow-sm" : "bg-white text-black hover:bg-gray-50 active:translate-y-[1px]"}`}
                              >
                                Tải ảnh từ máy
                              </button>
                            </div>
                          </div>

                          {productImageType === "url" ? (
                            <input
                              type="text"
                              placeholder="https://images.unsplash.com/..."
                              className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10"
                              value={productForm.image_url}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  image_url: e.target.value,
                                })
                              }
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <label className="flex-grow flex items-center justify-center border-2 border-dashed border-black rounded-xl py-3 px-4 bg-gray-50 hover:bg-gray-100/50 cursor-pointer transition-colors relative active:translate-y-[1px]">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleProductImageUpload}
                                  disabled={isUploadingProductImage}
                                  id="product-image-file"
                                />
                                <span className="text-xs font-bold text-gray-600">
                                  {isUploadingProductImage
                                    ? "Đang tải ảnh lên..."
                                    : "Chọn ảnh từ thiết bị của bạn"}
                                </span>
                              </label>
                              {productForm.image_url && (
                                <div className="w-12 h-14 bg-gray-100 rounded-lg border-2 border-black overflow-hidden shrink-0">
                                  <img
                                    src={productForm.image_url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Mô tả chi tiết sản phẩm
                        </label>
                        <textarea
                          rows={4}
                          className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3.5 font-bold resize-none focus:outline-none"
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Mô tả kiểu dáng, số đo mẫu, cách bảo quản..."
                        ></textarea>
                      </div>
                    </div>

                    {/* Phần 2: Cài đặt biến thể & Phân loại */}
                    <div className="space-y-6 pt-4 border-t border-black/5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-primary border-l-4 border-primary pl-2">
                            2. Cấu hình phân loại & biến thể
                          </h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                            Bật chế độ này nếu sản phẩm của bạn có nhiều kích cỡ
                            hoặc màu sắc khác nhau
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-black uppercase ${hasVariants ? "text-primary" : "text-gray-400"}`}
                          >
                            Có nhiều biến thể
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={hasVariants}
                              onChange={(e) => setHasVariants(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-black border-2 border-black"></div>
                          </label>
                        </div>
                      </div>

                      {!hasVariants ? (
                        /* CHẾ ĐỘ SẢN PHẨM ĐƠN BIẾN THỂ */
                        <div className="bg-gray-50 border-2 border-black rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Giá bán cơ bản (₫)
                            </label>
                            <input
                              type="number"
                              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 font-bold focus:outline-none"
                              value={productForm.price}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  price: parseFloat(e.target.value || "0"),
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Giá khuyến mãi (₫ - Nếu có)
                            </label>
                            <input
                              type="number"
                              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 font-bold focus:outline-none"
                              value={productForm.sale_price}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  sale_price: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Số lượng tồn kho chung
                            </label>
                            <input
                              type="number"
                              className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 font-bold focus:outline-none"
                              value={productForm.stock_quantity}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  stock_quantity: parseInt(
                                    e.target.value || "0",
                                  ),
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        /* CHẾ ĐỘ SẢN PHẨM ĐA BIẾN THỂ */
                        <div className="space-y-8 animate-in fade-in duration-200">
                          {/* 2.1: Nhập và tạo nhanh biến thể (Bulk Operations) */}
                          <div className="bg-[#FAF9F6] border-2 border-dashed border-black rounded-[2rem] p-8 space-y-6">
                            <div className="flex items-center gap-2">
                              <Store size={18} className="text-primary" />
                              <h4 className="text-xs font-black uppercase tracking-wider">
                                Bảng điều khiển & Tạo biến thể nhanh
                              </h4>
                            </div>

                            {/* Dòng 1: Tạo tổ hợp biến thể */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border-2 border-black rounded-2xl p-6 shadow-sm">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  Kích thước (cách nhau bởi dấu phẩy)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ví dụ: S, M, L, XL"
                                  className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
                                  value={bulkSizes}
                                  onChange={(e) => setBulkSizes(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  Màu sắc (cách nhau bởi dấu phẩy)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ví dụ: Đen, Trắng, Xanh Navy"
                                  className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
                                  value={bulkColors}
                                  onChange={(e) =>
                                    setBulkColors(e.target.value)
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                onClick={generateBulkVariants}
                                className="md:col-span-2 py-3 bg-black text-white hover:bg-primary font-black text-[10px] uppercase tracking-widest rounded-xl border-2 border-black transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                              >
                                Tự động sinh danh sách biến thể
                              </button>
                            </div>

                            {/* Dòng 2: Thiết lập nhanh giá & tồn kho */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white border-2 border-black rounded-2xl p-6 shadow-sm items-end">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  Giá gốc chung (₫)
                                </label>
                                <input
                                  type="number"
                                  placeholder="Ví dụ: 199000"
                                  className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
                                  value={bulkPrice}
                                  onChange={(e) => setBulkPrice(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  Giá khuyến mãi chung (₫)
                                </label>
                                <input
                                  type="number"
                                  placeholder="Ví dụ: 159000"
                                  className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
                                  value={bulkSalePrice}
                                  onChange={(e) =>
                                    setBulkSalePrice(e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                  Số lượng tồn kho áp dụng chung
                                </label>
                                <input
                                  type="number"
                                  placeholder="Ví dụ: 20"
                                  className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
                                  value={bulkStock}
                                  onChange={(e) => setBulkStock(e.target.value)}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={applyBulkSettings}
                                className="py-2.5 bg-green-500 text-white hover:bg-green-600 font-black text-[10px] uppercase tracking-widest rounded-xl border-2 border-black transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none shadow-subtle"
                              >
                                Áp dụng cho toàn bộ biến thể
                              </button>
                            </div>
                          </div>

                          {/* 2.2: Bảng chi tiết biến thể */}
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                                Danh sách các biến thể đang có (
                                {productVariants.length})
                              </h4>
                              <button
                                type="button"
                                onClick={addSingleVariant}
                                className="px-4 py-2 border-2 border-black rounded-lg font-black text-[9px] uppercase tracking-widest bg-white text-black hover:bg-gray-100 transition-all flex items-center gap-1.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                              >
                                <Plus size={12} /> Thêm biến thể đơn lẻ
                              </button>
                            </div>

                            <div className="border-2 border-black rounded-2xl overflow-hidden bg-white shadow-sm">
                              <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="border-b-2 border-black/5 text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50 sticky top-0 z-10">
                                      <th className="px-6 py-3">
                                        Kích thước (Size)
                                      </th>
                                      <th className="px-6 py-3">
                                        Màu sắc (Color)
                                      </th>
                                      <th className="px-6 py-3">
                                        Giá gốc riêng (₫)
                                      </th>
                                      <th className="px-6 py-3">
                                        Giá khuyến mãi riêng (₫)
                                      </th>
                                      <th className="px-6 py-3">% Giảm</th>
                                      <th className="px-6 py-3">Tồn kho</th>
                                      <th className="px-6 py-3 text-right">
                                        Hành động
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-black/5">
                                    {productVariants.length === 0 ? (
                                      <tr>
                                        <td
                                          colSpan={7}
                                          className="px-6 py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
                                        >
                                          Chưa có biến thể nào được tạo. Hãy sử
                                          dụng bảng tạo nhanh ở trên hoặc bấm
                                          thêm biến thể đơn lẻ!
                                        </td>
                                      </tr>
                                    ) : (
                                      productVariants.map((v, idx) => {
                                        const priceNum = parseFloat(
                                          v.price?.toString() || "0",
                                        );
                                        const salePriceNum = parseFloat(
                                          v.sale_price?.toString() || "0",
                                        );
                                        const discountPercent =
                                          priceNum &&
                                          salePriceNum &&
                                          priceNum > salePriceNum
                                            ? Math.round(
                                                ((priceNum - salePriceNum) /
                                                  priceNum) *
                                                  100,
                                              )
                                            : 0;

                                        return (
                                          <tr
                                            key={idx}
                                            className="hover:bg-gray-50/50"
                                          >
                                            <td className="px-6 py-3">
                                              <input
                                                type="text"
                                                className="w-24 bg-gray-50 border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                                                value={v.size}
                                                onChange={(e) =>
                                                  updateVariantField(
                                                    idx,
                                                    "size",
                                                    e.target.value,
                                                  )
                                                }
                                                required
                                              />
                                            </td>
                                            <td className="px-6 py-3">
                                              <input
                                                type="text"
                                                className="w-28 bg-gray-50 border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                                                value={v.color}
                                                onChange={(e) =>
                                                  updateVariantField(
                                                    idx,
                                                    "color",
                                                    e.target.value,
                                                  )
                                                }
                                                required
                                              />
                                            </td>
                                            <td className="px-6 py-3">
                                              <input
                                                type="number"
                                                className="w-28 bg-gray-50 border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                                                value={v.price}
                                                onChange={(e) =>
                                                  updateVariantField(
                                                    idx,
                                                    "price",
                                                    parseFloat(
                                                      e.target.value || "0",
                                                    ),
                                                  )
                                                }
                                                required
                                              />
                                            </td>
                                            <td className="px-6 py-3">
                                              <input
                                                type="number"
                                                className="w-28 bg-gray-50 border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                                                value={v.sale_price}
                                                onChange={(e) =>
                                                  updateVariantField(
                                                    idx,
                                                    "sale_price",
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="Nếu có giảm giá"
                                              />
                                            </td>
                                            <td className="px-6 py-3 text-xs font-black text-red-600">
                                              {discountPercent > 0
                                                ? `${discountPercent}%`
                                                : "-"}
                                            </td>
                                            <td className="px-6 py-3">
                                              <input
                                                type="number"
                                                className="w-24 bg-gray-50 border-2 border-black rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                                                value={v.stock_quantity}
                                                onChange={(e) =>
                                                  updateVariantField(
                                                    idx,
                                                    "stock_quantity",
                                                    parseInt(
                                                      e.target.value || "0",
                                                    ),
                                                  )
                                                }
                                                required
                                              />
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeVariant(idx)
                                                }
                                                className="p-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                              >
                                                <X size={14} />
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Nút bấm Submit */}
                    <div className="pt-6 border-t border-black/5 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setProductView("list")}
                        className="flex-1 py-4 border-2 border-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-black text-white hover:bg-primary border-2 border-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-brutal active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                      >
                        {productView === "add"
                          ? "Tạo sản phẩm mới"
                          : "Cập nhật sản phẩm"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: ĐƠN HÀNG (Orders) */}
          {activeTab === "orders" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-black uppercase">
                  Quản lý Đơn hàng
                </h2>

                {/* Nút thao tác hàng loạt */}
                {(filterStatus === "PENDING" ||
                  filterStatus === "CONFIRMED" ||
                  filterStatus === "PREPARING") && (
                  <button
                    onClick={() => handleBulkUpdate(filterStatus)}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <CheckCircle2 size={16} />
                    {filterStatus === "PENDING"
                      ? "XÁC NHẬN TẤT CẢ"
                      : filterStatus === "CONFIRMED"
                        ? "CHUẨN BỊ TẤT CẢ"
                        : "GIAO TẤT CẢ"}
                  </button>
                )}
              </div>

              {/* Bộ lọc trạng thái */}
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {[
                  "ALL",
                  "PENDING",
                  "CONFIRMED",
                  "PREPARING",
                  "READY_FOR_PICKUP",
                  "DELIVERING",
                  "DELIVERED",
                  "CANCELLED",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${filterStatus === status ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200 hover:border-black"}`}
                  >
                    {status === "ALL"
                      ? "Tất cả"
                      : status === "PENDING"
                        ? "Đang chờ"
                        : status === "CONFIRMED"
                          ? "Đã xác nhận"
                          : status === "PREPARING"
                            ? "Đang chuẩn bị"
                            : status === "READY_FOR_PICKUP"
                              ? "Sẵn sàng giao"
                              : status === "DELIVERING"
                                ? "Đang giao"
                                : status === "DELIVERED"
                                  ? "Hoàn tất"
                                  : "Đã hủy"}
                  </button>
                ))}
              </div>

              <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-black/5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/30">
                        <th className="px-8 py-4">Mã đơn hàng</th>
                        <th className="px-8 py-4">Khách hàng</th>
                        <th className="px-8 py-4">Chi tiết sản phẩm</th>
                        <th className="px-8 py-4">Tổng tiền nhận</th>
                        <th className="px-8 py-4">Trạng thái</th>
                        <th className="px-8 py-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/5">
                      {orders.filter(
                        (o: any) =>
                          filterStatus === "ALL" || o.status === filterStatus,
                      ).length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-8 py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
                          >
                            Không có đơn hàng nào
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter(
                            (o: any) =>
                              filterStatus === "ALL" ||
                              o.status === filterStatus,
                          )
                          .map((order, i) => {
                            let customerName = "Khách hàng";
                            let customerContact = "";

                            if (order.parentOrder?.shipping_address) {
                              try {
                                const addr = JSON.parse(
                                  order.parentOrder.shipping_address,
                                );
                                customerName =
                                  addr.receiver_name || customerName;
                                customerContact =
                                  addr.phone_number || customerContact;
                              } catch (e) {
                                // Ignore parse error
                              }
                            }

                            if (!customerContact && order.parentOrder?.user) {
                              customerName =
                                order.parentOrder.user.profile?.full_name ||
                                customerName;
                              customerContact =
                                order.parentOrder.user.email || "";
                            }

                            return (
                              <tr
                                key={order.id || i}
                                className="hover:bg-gray-50 transition-colors group"
                              >
                                <td className="px-8 py-4 text-xs font-black uppercase text-gray-700">
                                  #{order.shop_order_code}
                                </td>
                                <td className="px-8 py-4 text-xs font-bold">
                                  <p>{customerName}</p>
                                  <p className="text-[10px] text-gray-400">
                                    {customerContact}
                                  </p>
                                </td>
                                <td className="px-8 py-4 text-xs">
                                  {order.items.map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="mb-1 text-gray-600 font-medium"
                                    >
                                      {item.product_name}{" "}
                                      <span className="font-black text-black">
                                        ({item.size || item.variant?.size}/
                                        {item.color || item.variant?.color})
                                      </span>{" "}
                                      x{item.quantity}
                                    </div>
                                  ))}
                                </td>
                                <td className="px-8 py-4 text-xs font-black text-primary">
                                  {parseFloat(
                                    order.final_amount || 0,
                                  ).toLocaleString()}
                                  ₫
                                </td>
                                <td className="px-8 py-4">
                                  <span
                                    className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${
                                      order.status === "PENDING" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                      order.status === "CONFIRMED" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                      order.status === "PREPARING" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                      order.status === "READY_FOR_PICKUP" ? "bg-purple-50 text-purple-600 border-purple-100" :
                                      order.status === "PICKED_UP" ? "bg-cyan-50 text-cyan-600 border-cyan-100" :
                                      order.status === "IN_TRANSIT" ? "bg-pink-50 text-pink-600 border-pink-100" :
                                      order.status === "DELIVERING" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                      order.status === "DELIVERED" || order.status === "COMPLETED" ? "bg-green-50 text-green-600 border-green-100" :
                                      order.status === "RETURN_PENDING" ? "bg-pink-50 text-pink-700 border-pink-200" :
                                      order.status === "RETURNED" ? "bg-gray-50 text-gray-600 border-gray-100" :
                                      "bg-red-50 text-red-600 border-red-100"
                                    }`}
                                  >
                                    {order.status === "PENDING"
                                      ? "Chờ xác nhận"
                                      : order.status === "CONFIRMED"
                                        ? "Đã xác nhận"
                                        : order.status === "PREPARING"
                                          ? "Đang chuẩn bị"
                                          : order.status === "READY_FOR_PICKUP"
                                            ? "Sẵn sàng giao"
                                            : order.status === "PICKED_UP"
                                              ? "Đã lấy hàng"
                                              : order.status === "IN_TRANSIT"
                                                ? "Đang luân chuyển"
                                                : order.status === "DELIVERING"
                                                  ? "Đang giao"
                                                  : order.status === "DELIVERED" || order.status === "COMPLETED"
                                                    ? "Hoàn tất"
                                                    : order.status === "RETURN_PENDING"
                                                      ? "Đang hoàn hàng"
                                                      : order.status === "RETURNED"
                                                        ? "Đã hoàn hàng"
                                                        : "Đã hủy"}
                                  </span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                  {order.status === "PENDING" && (
                                    <button
                                      onClick={() =>
                                        handleConfirmOrder(order.id)
                                      }
                                      className="px-4 py-2 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-subtle active:translate-y-0.5 active:shadow-none"
                                    >
                                      Xác nhận đơn
                                    </button>
                                  )}
                                  {order.status === "CONFIRMED" && (
                                    <button
                                      onClick={() =>
                                        handlePrepareOrder(order.id)
                                      }
                                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-subtle active:translate-y-0.5 active:shadow-none"
                                    >
                                      Chuẩn bị hàng
                                    </button>
                                  )}
                                  {order.status === "PREPARING" && (
                                    <button
                                      onClick={() => handleReadyOrder(order.id)}
                                      className="px-4 py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-subtle active:translate-y-0.5 active:shadow-none"
                                    >
                                      Sẵn sàng giao
                                    </button>
                                  )}
                                  {order.status === "RETURN_PENDING" && (
                                    <button
                                      onClick={() => handleConfirmReturn(order.id)}
                                      className="px-4 py-2 bg-pink-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-subtle active:translate-y-0.5 active:shadow-none"
                                    >
                                      Nhận hàng hoàn
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: KHUYẾN MÃI (Promos) */}
          {activeTab === "promos" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-black uppercase">
                  Quản lý Khuyến mãi
                </h2>
                <button
                  onClick={() => {
                    setVoucherForm({
                      code: "",
                      description: "",
                      discount_type: "PERCENTAGE",
                      discount_value: 0,
                      min_order_amount: 0,
                      max_discount: "",
                      usage_limit: "",
                      per_user_limit: 1,
                      start_date: "",
                      end_date: "",
                    });
                    setShowVoucherModal(true);
                  }}
                  className="btn-brutal px-6 flex items-center gap-2 text-xs"
                >
                  <Plus size={16} /> TẠO VOUCHER MỚI
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.length === 0 ? (
                  <div className="col-span-3 text-center py-10 bg-white border-2 border-dashed border-black/10 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Chưa có mã giảm giá nào được tạo
                    </p>
                  </div>
                ) : (
                  vouchers.map((v, i) => (
                    <div
                      key={v.id || i}
                      className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm relative overflow-hidden group"
                    >
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full group-hover:scale-150 transition-all"></div>
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                          <Percent size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-black uppercase tracking-tight">
                            {v.discount_type === "PERCENTAGE"
                              ? `Giảm ${v.discount_value}%`
                              : `Giảm ${v.discount_value.toLocaleString()}₫`}
                          </h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Mã: <span className="text-primary">{v.code}</span>
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3 relative z-10">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-medium">
                            Đã sử dụng
                          </span>
                          <span className="font-black">
                            {v.used_count || 0} / {v.usage_limit || "∞"}
                          </span>
                        </div>
                        <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400">
                            Đơn tối thiểu:{" "}
                            {parseFloat(v.min_order_amount).toLocaleString()}₫
                          </span>
                          <button
                            onClick={() => handleDeleteVoucher(v.id)}
                            className="text-[9px] font-black text-red-600 hover:underline uppercase"
                          >
                            Xóa mã
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB: TƯƠNG TÁC (Interactions) */}
          {activeTab === "interactions" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Comments column */}
              <div className="space-y-6">
                <h3 className="text-2xl font-serif font-black uppercase flex items-center gap-3">
                  <MessageSquare className="text-primary" /> Bình luận & Đánh
                  giá
                </h3>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-10 bg-white border-2 border-dashed border-black/10 rounded-2xl">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Chưa có bình luận hay đánh giá nào
                      </p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black uppercase">
                              {rev.user?.profile?.full_name
                                ? rev.user.profile.full_name.substring(0, 2)
                                : "KH"}
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase">
                                {rev.user?.profile?.full_name ||
                                  rev.user?.email ||
                                  "Khách hàng"}
                              </p>
                              <div className="flex gap-0.5 mt-0.5">
                                {Array.from({ length: 5 }).map((_, s) => (
                                  <Star
                                    key={s}
                                    size={10}
                                    className={
                                      s < (rev.rating || 5)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }
                                  />
                                ))}
                              </div>
                              {rev.product && (
                                <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">
                                  Sản phẩm: {rev.product.name}{" "}
                                  {rev.variant
                                    ? `(${rev.variant.size}/${rev.variant.color})`
                                    : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-gray-400">
                            {rev.created_at
                              ? new Date(rev.created_at).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "Gần đây"}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-600 leading-relaxed mb-4 italic">
                          "{rev.comment}"
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4 border border-black/5">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Phản hồi của bạn
                          </p>
                          <textarea
                            placeholder="Nhập phản hồi..."
                            className="w-full bg-white border-2 border-black rounded-lg p-3 text-xs font-medium focus:outline-none resize-none"
                            rows={2}
                          ></textarea>
                          <div className="flex justify-end mt-2">
                            <button className="px-4 py-1.5 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                              Gửi phản hồi
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Favorites column */}
              <div className="space-y-6">
                <h3 className="text-2xl font-serif font-black uppercase flex items-center gap-3">
                  <Heart className="text-red-500" /> Sản phẩm Yêu thích nhất
                </h3>
                <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-sm">
                  <p className="text-xs font-bold text-gray-500 mb-8 italic">
                    Các sản phẩm này đang được nhiều người dùng lưu lại. Hãy tạo
                    khuyến mãi để kích cầu!
                  </p>
                  <div className="space-y-6">
                    {products.length === 0 ? (
                      <div className="text-center py-10 bg-[#FAF9F6] border-2 border-dashed border-black/10 rounded-2xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Chưa có sản phẩm nào
                        </p>
                      </div>
                    ) : (
                      products.slice(0, 4).map((prod, idx) => (
                        <div
                          key={prod.id || idx}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-14 bg-gray-100 rounded-lg overflow-hidden border border-black/5 shrink-0">
                              <img
                                src={
                                  prod.images?.[0]?.image_url ||
                                  `https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=100`
                                }
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase truncate max-w-[200px]">
                                {prod.name}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                                <Heart
                                  size={10}
                                  className="text-red-500 fill-red-500"
                                />{" "}
                                {((prod.id * 17) % 150) + 12} lượt lưu
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black">
                            {prod.price.toLocaleString()}₫
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VÍ & DOANH THU (Finance) */}
          {activeTab === "finance" && (
            <div className="space-y-10 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-black uppercase">
                  Tài chính & Rút tiền
                </h2>
              </div>

              {/* Cards row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Doanh thu tích lũy */}
                <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Doanh thu tích lũy
                  </span>
                  <h4 className="text-3xl font-black tracking-tighter text-black mt-2">
                    {(stats.revenue || 0).toLocaleString()}₫
                  </h4>
                </div>

                {/* Card 2: Doanh thu thực nhận */}
                <div className="bg-white border-2 border-black rounded-3xl p-8 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Doanh thu thực nhận (Sau khấu trừ 10%)
                  </span>
                  <h4 className="text-3xl font-black tracking-tighter text-green-600 mt-2">
                    {(stats.netRevenue || 0).toLocaleString()}₫
                  </h4>
                </div>

                {/* Card 3: Số dư khả dụng */}
                <div
                  onClick={() =>
                    setWithdrawForm({
                      ...withdrawForm,
                      amount: (stats.availableBalance || 0).toString(),
                    })
                  }
                  className="bg-black text-white border-2 border-black rounded-3xl p-8 shadow-brutal flex flex-col justify-between h-36 cursor-pointer active:scale-95 transition-all select-none group hover:bg-neutral-900 animate-pulse"
                  title="Click để điền nhanh số tiền cần rút"
                >
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-primary transition-colors">
                      Số dư khả dụng (Click điền nhanh)
                    </span>
                    <h4 className="text-3xl font-black tracking-tighter text-primary mt-2">
                      {(stats.availableBalance || 0).toLocaleString()}₫
                    </h4>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Request withdrawal form */}
                <div className="lg:col-span-1 bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-6">
                    Yêu cầu rút tiền
                  </h3>
                  <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Số tiền rút (VND)
                      </label>
                      <input
                        type="number"
                        placeholder="Ví dụ: 500000"
                        value={withdrawForm.amount}
                        onChange={(e) =>
                          setWithdrawForm({
                            ...withdrawForm,
                            amount: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Ngân hàng thụ hưởng
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Vietcombank"
                        value={withdrawForm.bankName}
                        onChange={(e) =>
                          setWithdrawForm({
                            ...withdrawForm,
                            bankName: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Số tài khoản ngân hàng
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập số tài khoản"
                        value={withdrawForm.accountNumber}
                        onChange={(e) =>
                          setWithdrawForm({
                            ...withdrawForm,
                            accountNumber: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Tên chủ tài khoản (Không dấu)
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: NGUYEN VAN A"
                        value={withdrawForm.accountName}
                        onChange={(e) =>
                          setWithdrawForm({
                            ...withdrawForm,
                            accountName: e.target.value,
                          })
                        }
                        className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold text-xs focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-black text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-subtle active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      GỬI YÊU CẦU RÚT TIỀN
                    </button>
                  </form>
                </div>

                {/* Column 2: Withdrawal list */}
                <div className="lg:col-span-2 bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm overflow-hidden">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-6 pb-2 border-b-2 border-black/5">
                    Lịch sử rút tiền
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b-2 border-black/5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/30">
                          <th className="px-6 py-4">Thời gian</th>
                          <th className="px-6 py-4">Số tiền</th>
                          <th className="px-6 py-4">Tài khoản thụ hưởng</th>
                          <th className="px-6 py-4">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black/5 text-xs font-bold">
                        {withdrawals.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-8 text-center text-gray-400 uppercase tracking-widest text-[10px]"
                            >
                              Chưa có giao dịch rút tiền nào
                            </td>
                          </tr>
                        ) : (
                          withdrawals.map((w, idx) => (
                            <tr key={w.id || idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-[10px] text-gray-500">
                                {w.created_at
                                  ? new Date(w.created_at).toLocaleString(
                                      "vi-VN",
                                    )
                                  : "Gần đây"}
                              </td>
                              <td className="px-6 py-4 font-black text-red-600">
                                -{parseFloat(w.amount).toLocaleString()}₫
                              </td>
                              <td className="px-6 py-4">
                                <p className="uppercase">{w.account_name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">
                                  {w.bank_name} | {w.account_number}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`text-[8px] font-black uppercase px-2.5 py-1 rounded border ${w.status === "PENDING" ? "bg-orange-50 text-orange-600 border-orange-100" : w.status === "APPROVED" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}
                                >
                                  {w.status === "PENDING"
                                    ? "Đang chờ"
                                    : w.status === "APPROVED"
                                      ? "Đã duyệt"
                                      : "Từ chối"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHAT (Customer Chat) */}
          {activeTab === "chats" && (
            <div className="h-[calc(100vh-10rem)] bg-white border-4 border-black rounded-[2.5rem] overflow-hidden flex shadow-brutal select-none">
              {/* Contact List */}
              <div className="w-96 border-r-4 border-black flex flex-col bg-[#F9F9F7]">
                <div className="p-6 border-b-4 border-black/5">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-4">
                    Hộp thư hỗ trợ
                  </h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm khách hàng..."
                      className="w-full bg-white border-2 border-black rounded-xl px-10 py-2.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={14}
                    />
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto p-3 space-y-2 scrollbar-thin">
                  {chatCustomers.length === 0 ? (
                    <div className="text-center py-12 text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed p-4">
                      Chưa có cuộc hội thoại nào từ khách hàng
                    </div>
                  ) : (
                    chatCustomers.map((cust, idx) => (
                      <button
                        key={cust.id || idx}
                        onClick={() => setActiveChatIndex(idx)}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left active:translate-y-[1px] ${idx === activeChatIndex ? "bg-black text-white border-black shadow-subtle" : "bg-white border-transparent hover:border-black hover:shadow-subtle hover:translate-x-0.5"}`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-primary/20 border-2 border-black flex items-center justify-center font-black text-primary uppercase overflow-hidden shadow-sm">
                            {cust.avatar ? (
                              <img
                                src={cust.avatar}
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              cust.name.substring(0, 2)
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase truncate group-hover:text-primary transition-colors">
                              {cust.name}
                            </span>
                            <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                              <span className="text-[8px] font-bold text-gray-400">
                                {cust.lastMessage
                                  ? new Date(
                                      cust.lastMessage.sent_at,
                                    ).toLocaleTimeString("vi-VN", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center gap-2">
                            <p
                              className={`text-[10px] truncate font-medium ${idx === activeChatIndex ? "text-gray-400" : "text-gray-500"}`}
                            >
                              {cust.lastMessage
                                ? cust.lastMessage.body
                                : "Chưa có tin nhắn"}
                            </p>
                            {cust.unreadCount > 0 && (
                              <span className="bg-red-600 text-white border border-black rounded-full px-1.5 py-0.5 text-[7px] font-black shrink-0 shadow-sm animate-pulse">
                                {cust.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="flex-grow flex flex-col bg-white">
                {chatCustomers.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center bg-gray-50/10 p-10 text-center select-none">
                    <MessageSquare size={48} className="text-gray-300 mb-4" />
                    <h4 className="text-sm font-black uppercase tracking-widest mb-1">
                      Cửa sổ tin nhắn trống
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase max-w-xs leading-relaxed">
                      Khi có khách hàng bắt đầu trò chuyện hoặc đặt hàng, hội
                      thoại sẽ xuất hiện tại đây.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="p-6 border-b-4 border-black/5 flex justify-between items-center bg-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 border-2 border-black text-primary flex items-center justify-center font-black text-xl uppercase overflow-hidden shadow-sm">
                          {chatCustomers[activeChatIndex]?.avatar ? (
                            <img
                              src={chatCustomers[activeChatIndex].avatar}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            chatCustomers[activeChatIndex]?.name.substring(0, 2)
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">
                            {chatCustomers[activeChatIndex]?.name}
                          </h4>
                          <p className="text-[10px] font-bold text-green-500 flex items-center gap-1 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{" "}
                            Đang hoạt động
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message History */}
                    <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-[#F9F9F7] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] scrollbar-thin">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center">
                          <span className="bg-white border-2 border-black px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-400 shadow-sm">
                            Mở đầu cuộc trò chuyện
                          </span>
                          <p className="text-[9px] font-bold text-gray-400 mt-3.5 uppercase tracking-wide">
                            Hãy gửi tin nhắn đầu tiên để kết nối với khách hàng!
                          </p>
                        </div>
                      ) : (
                        chatMessages.map((msg, idx) => {
                          const isMe = msg.sender_id === user?.id;
                          const senderInitials = isMe
                            ? "VS"
                            : chatCustomers[activeChatIndex]?.name.substring(
                                0,
                                2,
                              );
                          const timeStr = msg.sent_at
                            ? new Date(msg.sent_at).toLocaleTimeString(
                                "vi-VN",
                                { hour: "2-digit", minute: "2-digit" },
                              )
                            : "";

                          if (isMe) {
                            return (
                              <div
                                key={msg.id || idx}
                                className="flex flex-row-reverse gap-4 max-w-[80%] ml-auto animate-in fade-in duration-200"
                              >
                                <div className="w-8 h-8 rounded-full bg-primary border-2 border-black text-white flex items-center justify-center text-[8px] font-black shrink-0 shadow-sm">
                                  {senderInitials}
                                </div>
                                <div className="space-y-2 text-right">
                                  <div className="bg-black text-white border-2 border-black p-4 rounded-2xl rounded-tr-none shadow-subtle text-left">
                                    <p className="text-xs font-medium leading-relaxed break-words">
                                      {msg.body}
                                    </p>
                                  </div>
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mr-1">
                                    {timeStr}
                                  </span>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={msg.id || idx}
                                className="flex gap-4 max-w-[80%] animate-in fade-in duration-200"
                              >
                                <div className="w-8 h-8 rounded-full bg-black text-white border-2 border-black flex items-center justify-center text-[8px] font-black shrink-0 uppercase overflow-hidden shadow-sm">
                                  {chatCustomers[activeChatIndex]?.avatar ? (
                                    <img
                                      src={
                                        chatCustomers[activeChatIndex].avatar
                                      }
                                      alt="avatar"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    senderInitials
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <div className="bg-white border-2 border-black p-4 rounded-2xl rounded-tl-none shadow-subtle">
                                    <p className="text-xs font-medium leading-relaxed break-words">
                                      {msg.body}
                                    </p>
                                  </div>
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    {timeStr}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        })
                      )}
                    </div>

                    {/* Chat Input */}
                    <form
                      onSubmit={handleSendMessage}
                      className="p-6 border-t-4 border-black bg-white select-none"
                    >
                      <div className="flex items-center gap-4 bg-gray-50 border-2 border-black rounded-2xl p-2 pl-4 shadow-inner">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-black transition-colors cursor-pointer"
                          title="Emoji"
                        >
                          <Smile size={20} />
                        </button>
                        <input
                          type="text"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          placeholder="Nhập tin nhắn phản hồi..."
                          className="flex-grow bg-transparent border-none focus:outline-none font-bold text-sm py-2"
                        />
                        <button
                          type="submit"
                          className={`p-3 rounded-xl transition-all cursor-pointer active:translate-y-[1px] ${chatInputText.trim() ? "bg-black text-white shadow-subtle" : "text-gray-300"}`}
                          disabled={!chatInputText.trim()}
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB: CẤU HÌNH SHOP (Settings) */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-black uppercase">
                  Thông tin cửa hàng
                </h2>
              </div>

              <div className="bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-sm max-w-3xl">
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Tên gian hàng
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      value={settingsForm.name}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Số điện thoại kinh doanh
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        value={settingsForm.phone}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Ngành hàng chính
                      </label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                        value={settingsForm.industry}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            industry: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Địa chỉ lấy hàng
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                      value={settingsForm.address}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          address: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Mô tả shop
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3.5 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                      value={settingsForm.description}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  {/* Shop Avatar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Ảnh đại diện cửa hàng (Avatar)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShopAvatarType("url")}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black rounded-lg transition-all ${shopAvatarType === "url" ? "bg-black text-white shadow-sm" : "bg-white text-black hover:bg-gray-50 active:translate-y-[1px]"}`}
                        >
                          Sử dụng URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setShopAvatarType("file")}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black rounded-lg transition-all ${shopAvatarType === "file" ? "bg-black text-white shadow-sm" : "bg-white text-black hover:bg-gray-50 active:translate-y-[1px]"}`}
                        >
                          Tải ảnh từ máy
                        </button>
                      </div>
                    </div>

                    {shopAvatarType === "url" ? (
                      <input
                        type="text"
                        className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3.5 font-bold focus:outline-none"
                        value={settingsForm.avatar_url}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            avatar_url: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <label className="flex-grow flex items-center justify-center border-2 border-dashed border-black rounded-xl py-3 px-5 bg-gray-50 hover:bg-gray-100/50 cursor-pointer transition-colors relative active:translate-y-[1px]">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleShopAvatarUpload}
                            disabled={isUploadingShopImage}
                            id="shop-avatar-file"
                          />
                          <span className="text-xs font-bold text-gray-600">
                            {isUploadingShopImage
                              ? "Đang tải ảnh lên..."
                              : "Chọn ảnh từ thiết bị của bạn"}
                          </span>
                        </label>
                        {settingsForm.avatar_url && (
                          <div className="w-12 h-12 rounded-xl border-2 border-black overflow-hidden shrink-0">
                            <img
                              src={settingsForm.avatar_url}
                              alt="Preview Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Shop Cover */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                        Ảnh bìa cửa hàng (Cover)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShopCoverType("url")}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black rounded-lg transition-all ${shopCoverType === "url" ? "bg-black text-white shadow-sm" : "bg-white text-black hover:bg-gray-50 active:translate-y-[1px]"}`}
                        >
                          Sử dụng URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setShopCoverType("file")}
                          className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 border-black rounded-lg transition-all ${shopCoverType === "file" ? "bg-black text-white shadow-sm" : "bg-white text-black hover:bg-gray-50 active:translate-y-[1px]"}`}
                        >
                          Tải ảnh từ máy
                        </button>
                      </div>
                    </div>

                    {shopCoverType === "url" ? (
                      <input
                        type="text"
                        className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3.5 font-bold focus:outline-none"
                        value={settingsForm.cover_url}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            cover_url: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <label className="flex-grow flex items-center justify-center border-2 border-dashed border-black rounded-xl py-3 px-5 bg-gray-50 hover:bg-gray-100/50 cursor-pointer transition-colors relative active:translate-y-[1px]">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleShopCoverUpload}
                            disabled={isUploadingShopImage}
                            id="shop-cover-file"
                          />
                          <span className="text-xs font-bold text-gray-600">
                            {isUploadingShopImage
                              ? "Đang tải ảnh lên..."
                              : "Chọn ảnh từ thiết bị của bạn"}
                          </span>
                        </label>
                        {settingsForm.cover_url && (
                          <div className="w-20 h-12 rounded-xl border-2 border-black overflow-hidden shrink-0">
                            <img
                              src={settingsForm.cover_url}
                              alt="Preview Cover"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-4 bg-black text-white border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-subtle active:translate-y-0.5 active:shadow-none"
                  >
                    Lưu thông tin cửa hàng
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Phân trang sản phẩm */}
          {activeTab === "products" && productsTotal > 0 && (
            <div className="flex justify-center items-center gap-2 pt-12">
              <button
                onClick={() => setProductsPage((p) => Math.max(p - 1, 1))}
                className="w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-1"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.ceil(productsTotal / 5) }).map(
                (_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setProductsPage(idx + 1)}
                    className={`w-10 h-10 border-2 border-black rounded-xl font-black text-xs transition-all ${productsPage === idx + 1 ? "bg-black text-white" : "hover:bg-primary/10 active:translate-y-1"}`}
                  >
                    {idx + 1}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setProductsPage((p) =>
                    Math.min(p + 1, Math.ceil(productsTotal / 5)),
                  )
                }
                className="w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-1"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- MODAL TẠO MÃ GIẢM GIÁ --- */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border-4 border-black rounded-[2.5rem] w-full max-w-2xl shadow-brutal p-8 relative">
            <button
              onClick={() => setShowVoucherModal(false)}
              className="absolute top-6 right-6 p-2 border-2 border-black rounded-xl hover:bg-gray-100 transition-all"
            >
              <X size={18} />
            </button>
            <h3 className="text-2xl font-serif font-black uppercase tracking-tighter mb-6">
              Tạo mã giảm giá mới
            </h3>
            <form onSubmit={handleVoucherSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Mã Coupon (Ví dụ: SALE20)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold uppercase"
                    value={voucherForm.code}
                    onChange={(e) =>
                      setVoucherForm({ ...voucherForm, code: e.target.value })
                    }
                    required
                  />
                </div>
                <CustomSelect
                  label="Loại giảm giá"
                  value={voucherForm.discount_type}
                  placeholder="-- Chọn loại giảm giá --"
                  options={[
                    { value: "PERCENTAGE", label: "Giảm theo phần trăm (%)" },
                    {
                      value: "FIXED_AMOUNT",
                      label: "Giảm số tiền cố định (₫)",
                    },
                  ]}
                  onChange={(val) =>
                    setVoucherForm({
                      ...voucherForm,
                      discount_type: val as "PERCENTAGE" | "FIXED_AMOUNT",
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Giá trị giảm
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold"
                    value={voucherForm.discount_value}
                    onChange={(e) =>
                      setVoucherForm({
                        ...voucherForm,
                        discount_value: parseFloat(e.target.value || "0"),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Đơn hàng tối thiểu (₫)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold"
                    value={voucherForm.min_order_amount}
                    onChange={(e) =>
                      setVoucherForm({
                        ...voucherForm,
                        min_order_amount: parseFloat(e.target.value || "0"),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Giảm tối đa (₫)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold"
                    value={voucherForm.max_discount}
                    onChange={(e) =>
                      setVoucherForm({
                        ...voucherForm,
                        max_discount: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Tổng lượt dùng tối đa
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold"
                    value={voucherForm.usage_limit}
                    onChange={(e) =>
                      setVoucherForm({
                        ...voucherForm,
                        usage_limit: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Giới hạn/Người dùng
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold"
                    value={voucherForm.per_user_limit}
                    onChange={(e) =>
                      setVoucherForm({
                        ...voucherForm,
                        per_user_limit: parseInt(e.target.value || "1"),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Mô tả mã giảm giá
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-2 border-black rounded-xl px-4 py-3 font-bold"
                  value={voucherForm.description}
                  onChange={(e) =>
                    setVoucherForm({
                      ...voucherForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="submit"
                className="w-full btn-brutal py-4 text-xs font-black uppercase tracking-widest shadow-brutal hover:bg-primary active:translate-y-0.5 active:shadow-none"
              >
                Tạo Voucher ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border-4 border-black rounded-[2rem] w-full max-w-md shadow-brutal p-8 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() =>
                setConfirmModal((prev) => ({ ...prev, isOpen: false }))
              }
              className="absolute top-6 right-6 p-2 border-2 border-black rounded-xl hover:bg-gray-100 transition-all"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-serif font-black uppercase tracking-tighter mb-4 text-black">
              {confirmModal.title}
            </h3>
            <p className="text-gray-600 text-sm font-bold leading-relaxed mb-8">
              {confirmModal.message}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                className="flex-1 py-4 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-white hover:bg-gray-50 transition-all active:translate-y-[2px]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-4 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-black shadow-subtle hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
