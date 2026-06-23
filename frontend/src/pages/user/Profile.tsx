import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/stores/hooks";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  PackageSearch,
  Star,
  Ticket,
  Map,
  Store,
  ShieldCheck,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { useAppDispatch } from "@/stores/hooks";
import { setUser } from "@/stores/slices/authSlice";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from "@/hooks/useAddresses";
import { useFavorites, useViewedProducts, useProfile } from "@/hooks/useUser";
import { useTopShops } from "@/hooks/useShops";
import { formatPrice } from "@/utils/format";
import { axiosClient } from "@/services/axiosClient";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

interface IUpdateProfileData {
  full_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  shipper_shop_id?: number | null;
}

const addressSchema = yup.object().shape({
  recipient_name: yup.string().required("Vui lòng nhập tên người nhận"),
  phone_number: yup.string().required("Vui lòng nhập số điện thoại"),
  address_line: yup.string().required("Vui lòng nhập địa chỉ chi tiết"),
});

const Profile = () => {
  const { handleLogout } = useAuth();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  
  const isShipper =
    (typeof user?.role === "string"
      ? user.role.toLowerCase() === "shipper"
      : user?.role?.role_name?.toLowerCase() === "shipper") || user?.email?.includes("shipper");

  const hasShop =
    (typeof user?.role === "string"
      ? user.role.toLowerCase() === "vendor"
      : user?.role?.role_name?.toLowerCase() === "vendor") || user?.isVendor; // Giả lập kiểm tra quyền

  const isManager =
    (typeof user?.role === "string"
      ? user.role.toLowerCase() === "manager"
      : user?.role?.role_name?.toLowerCase() === "manager") || user?.email?.includes("manager");

  const isAdmin =
    (typeof user?.role === "string"
      ? user.role.toLowerCase() === "admin"
      : user?.role?.role_name?.toLowerCase() === "admin") || user?.email?.includes("admin");

  const schema = yup.object({
    full_name: yup.string().required("Tên không được để trống"),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, "Số điện thoại phải có đúng 10 chữ số")
      .required("Số điện thoại không được để trống"),
    date_of_birth: yup.string().required("Ngày sinh không được để trống"),
    gender: yup.string().required("Giới tính không được để trống"),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IUpdateProfileData>({
    defaultValues: {
      full_name: user?.fullName || "",
      phone: user?.phone || "",
      date_of_birth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      gender: user?.gender || "male",
      shipper_shop_id: user?.profile?.shipper_shop_id || user?.shipper_shop_id || null,
    },
    resolver: yupResolver(schema),
  });

  const [isUpdating, setIsUpdating] = useState(false);

  // Đồng bộ lại dữ liệu form khi user đã được tải xong từ Redux store
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.fullName || "",
        phone: user.phone || "",
        date_of_birth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        gender: user.gender || "male",
        shipper_shop_id: user.profile?.shipper_shop_id || user.shipper_shop_id || null,
      });
    }
  }, [user, reset]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address logic
  const { data: addresses, isLoading: isAddressesLoading } = useAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  // New features hooks
  const { data: profile } = useProfile({ enabled: !!user });
  const { data: favorites } = useFavorites({ enabled: !!user });
  const { data: viewedProducts } = useViewedProducts({ enabled: !!user });
  const { data: shopsData } = useTopShops(100);

  const [activeTab, setActiveTab] = useState<"profile" | "favorites" | "viewed" | "points" | "shipper_orders">(
    isShipper ? "shipper_orders" : "profile"
  );

  // Shipper Orders state
  const [shipperOrders, setShipperOrders] = useState<any[]>([]);
  const [shipperOrdersLoading, setShipperOrdersLoading] = useState(false);

  // Failed modal state
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [failedReason, setFailedReason] = useState("Không liên lạc được người mua");
  const [otherReason, setOtherReason] = useState("");

  const fetchShipperOrders = async () => {
    try {
      setShipperOrdersLoading(true);
      const response = await axiosClient.get("/orders/shipper");
      setShipperOrders(response.data.data.orders || []);
    } catch (error) {
      console.error("Error fetching shipper orders:", error);
    } finally {
      setShipperOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isShipper && activeTab === "shipper_orders") {
      fetchShipperOrders();
    }
  }, [isShipper, activeTab]);

  const handleUpdateStatus = async (orderId: number, status: string, note?: string) => {
    try {
      await axiosClient.patch(`/orders/${orderId}/status`, { status, note });
      alert("Cập nhật trạng thái thành công!");
      fetchShipperOrders();
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleFailDeliverySubmit = () => {
    if (!selectedOrderId) return;
    const finalReason = failedReason === "Lý do khác" ? otherReason : failedReason;
    if (failedReason === "Lý do khác" && !otherReason.trim()) {
      alert("Vui lòng nhập lý do khác");
      return;
    }
    handleUpdateStatus(selectedOrderId, "CANCELLED", finalReason);
    setShowFailedModal(false);
    setSelectedOrderId(null);
    setOtherReason("");
  };

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: yupResolver(addressSchema),
  });

  const onSubmitAddress = async (data: any) => {
    try {
      if (editingAddressId) {
        await updateAddressMutation.mutateAsync({
          id: editingAddressId,
          payload: {
            recipient_name: data.recipient_name,
            phone_number: data.phone_number,
            address_line: data.address_line,
          }
        });
        alert("Cập nhật địa chỉ thành công!");
      } else {
        await createAddressMutation.mutateAsync({
          recipient_name: data.recipient_name,
          phone_number: data.phone_number,
          address_line: data.address_line,
          is_default: addresses?.length === 0,
        });
        alert("Thêm địa chỉ thành công!");
      }
      setIsAddingAddress(false);
      setEditingAddressId(null);
      resetAddress();
    } catch (error) {
      alert(editingAddressId ? "Cập nhật địa chỉ thất bại!" : "Thêm địa chỉ thất bại!");
    }
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    resetAddress({
      recipient_name: addr.recipient_name,
      phone_number: addr.phone_number,
      address_line: addr.address_line,
    });
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      try {
        await deleteAddressMutation.mutateAsync(id);
        alert("Xóa địa chỉ thành công!");
      } catch (error) {
        alert("Xóa địa chỉ thất bại!");
      }
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await updateAddressMutation.mutateAsync({
        id,
        payload: { is_default: true }
      });
      alert("Đã đặt làm địa chỉ mặc định!");
    } catch (error) {
      alert("Cập nhật thất bại!");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: IUpdateProfileData) => {
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("phone", data.phone);
    formData.append("date_of_birth", data.date_of_birth);
    formData.append("gender", data.gender);
    if (data.shipper_shop_id !== undefined && data.shipper_shop_id !== null) {
      formData.append("shipper_shop_id", String(data.shipper_shop_id));
    } else {
      formData.append("shipper_shop_id", "");
    }

    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }
    try {
      const response = await userService.updateProfile(formData);
      const updatedProfile = response.data.data;
      if (updatedProfile) {
        dispatch(
          setUser({
            ...user!,
            fullName: updatedProfile.fullName,
            dateOfBirth: updatedProfile.dateOfBirth,
            gender: updatedProfile.gender,
            avatarUrl: updatedProfile.avatarUrl,
            shipper_shop_id: updatedProfile.shipper_shop_id,
            profile: {
              ...user?.profile,
              ...updatedProfile,
            }
          }),
        );
        reset({
          full_name: updatedProfile.fullName,
          phone: updatedProfile.phone,
          date_of_birth: updatedProfile.dateOfBirth?.split("T")[0] || "",
          gender: updatedProfile.gender,
          shipper_shop_id: updatedProfile.shipper_shop_id || null,
        });
        // Xóa preview để hiển thị ảnh thật từ Cloudinary
        setAvatarPreview(null);
      }
      alert("Cập nhật thông tin thành công!");
      setSelectedFile(null);
    } catch (error) {
      alert("Cập nhật thông tin thất bại!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 flex flex-col gap-6">
            <Card className="p-6 flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-full border-[3px] border-black overflow-hidden mb-4 shadow-brutal cursor-pointer relative group"
                onClick={triggerFileInput}
              >
                <img
                  src={
                    avatarPreview ||
                    (user?.avatarUrl
                      ? user.avatarUrl.startsWith("http")
                        ? user.avatarUrl
                        : `${API_URL}${user.avatarUrl}`
                      : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a0a0a0"><rect width="24" height="24" fill="%23e4e6eb"/><circle cx="12" cy="8" r="4"/><path d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>`)
                  }
                  alt={user?.fullName || "User"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-bold uppercase">
                    Thay đổi
                  </span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
              <h2 className="font-serif text-2xl font-bold">
                {user?.fullName || "Khách"}
              </h2>
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 mt-2 uppercase tracking-widest">
                {isAdmin ? "ADMIN" : isManager ? "MANAGER" : isShipper ? "SHIPPER" : "HẠNG VÀNG"}
              </span>
            </Card>

            <div className="border-[3px] border-black shadow-brutal bg-white overflow-hidden">
              <nav className="flex flex-col">
                {isShipper ? (
                  <>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("profile"); }}
                      className={`flex items-center gap-3 px-6 py-4 font-bold border-b border-black transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <User size={18} /> Thông tin tài khoản
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("shipper_orders"); }}
                      className={`flex items-center gap-3 px-6 py-4 font-bold border-b border-black transition-colors ${activeTab === 'shipper_orders' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <PackageSearch size={18} /> Đơn hàng cần giao
                    </a>
                  </>
                ) : isAdmin ? (
                  <>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("profile"); }}
                      className={`flex items-center gap-3 px-6 py-4 font-bold border-b border-black transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <User size={18} /> Thông tin tài khoản
                    </a>
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-6 py-4 hover:bg-primary hover:text-white border-b border-black text-primary font-black transition-all group"
                    >
                      <ShieldCheck
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                      Hệ thống Admin
                    </Link>
                  </>
                ) : isManager ? (
                  <>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("profile"); }}
                      className={`flex items-center gap-3 px-6 py-4 font-bold border-b border-black transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <User size={18} /> Thông tin tài khoản
                    </a>
                    <Link
                      to="/manager"
                      className="flex items-center gap-3 px-6 py-4 hover:bg-primary hover:text-white border-b border-black text-primary font-black transition-all group"
                    >
                      <ShieldCheck
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                      Hệ thống Manager
                    </Link>
                  </>
                ) : (
                  <>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("profile"); }}
                      className={`flex items-center gap-3 px-6 py-4 font-bold border-b border-black transition-colors ${activeTab === 'profile' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <User size={18} /> Thông tin tài khoản
                    </a>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 border-b border-black text-gray-700 font-medium transition-colors"
                    >
                      <Package size={18} /> Đơn hàng của tôi
                    </Link>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("favorites"); }}
                      className={`flex items-center gap-3 px-6 py-4 font-medium border-b border-black transition-colors ${activeTab === 'favorites' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <Heart size={18} /> Sản phẩm yêu thích
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("viewed"); }}
                      className={`flex items-center gap-3 px-6 py-4 font-medium border-b border-black transition-colors ${activeTab === 'viewed' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <Map size={18} /> Sản phẩm đã xem
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setActiveTab("points"); }}
                      className={`flex items-center gap-3 px-6 py-4 font-medium border-b border-black transition-colors ${activeTab === 'points' ? 'bg-primary text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      <Star size={18} /> Quản lý ví điểm
                    </a>
                    <Link
                      to="/vendor"
                      className="flex items-center gap-3 px-6 py-4 hover:bg-primary hover:text-white border-b border-black text-primary font-black transition-all group"
                    >
                      <Store
                        size={18}
                        className="group-hover:scale-110 transition-transform"
                      />
                      {hasShop ? "Kênh Người Bán" : "Đăng ký mở shop"}
                    </Link>
                  </>
                )}

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-red-50 text-red-600 font-bold transition-colors cursor-pointer"
                >
                  <LogOut size={18} /> Đăng xuất
                </a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4 flex flex-col gap-6">
            {activeTab === "profile" && (
              <>
                <div className="mb-2">
                  <h1 className="font-serif text-4xl font-bold mb-2">
                    THÔNG TIN TÀI KHOẢN
                  </h1>
                  <p className="text-gray-600">
                    Quản lý thông tin cá nhân và bảo mật tài khoản của bạn tại
                    UTEShop.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Form */}
                  <Card className={`p-0 ${(isShipper || isAdmin || isManager) ? 'lg:col-span-3' : 'lg:col-span-2'} flex flex-col`}>
                    <div className="p-6 border-b-2 border-black flex items-center gap-2">
                      <User size={20} />
                      <h3 className="font-serif text-xl font-bold">
                        Hồ sơ cá nhân
                      </h3>
                    </div>
                    <div className="p-6 md:p-8 flex-grow">
                      <form
                        className="space-y-6"
                        onSubmit={handleSubmit((data) => onSubmit(data))}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Controller
                            control={control}
                            name="full_name"
                            render={({ field, fieldState }) => (
                              <div>
                                <Input
                                  label="Họ và tên"
                                  id="fullname"
                                  name="full_name"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                {fieldState.error?.message && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {fieldState.error.message}
                                  </p>
                                )}
                              </div>
                            )}
                          />
                          <Controller
                            control={control}
                            name="phone"
                            render={({ field, fieldState }) => (
                              <div>
                                <Input
                                  label="Số điện thoại"
                                  id="phone"
                                  name="phone"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                {fieldState.error?.message && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {fieldState.error.message}
                                  </p>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label="Email"
                            id="email"
                            type="email"
                            value={user?.email || ""}
                            disabled
                          />
                          <Controller
                            control={control}
                            name="date_of_birth"
                            render={({ field, fieldState }) => (
                              <div>
                                <Input
                                  label="Ngày sinh"
                                  id="dob"
                                  name="date_of_birth"
                                  type="date"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                                {fieldState.error?.message && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {fieldState.error.message}
                                  </p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        {isShipper && (
                          <div>
                            <label className="text-xs font-bold uppercase tracking-wider mb-3 block">
                              Cửa hàng nhận hàng đi giao
                            </label>
                            <Controller
                              control={control}
                              name="shipper_shop_id"
                              render={({ field }) => (
                                <select
                                  id="shipper_shop_id"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(Number(e.target.value) || null)}
                                  className="w-full border-2 border-black p-3 rounded-lg focus:border-primary outline-none text-xs font-bold uppercase bg-white"
                                >
                                  <option value="">Chọn cửa hàng...</option>
                                  {shopsData?.data?.map((shop: any) => (
                                    <option key={shop.id} value={shop.id}>
                                      {shop.shop_name} ({shop.industry})
                                    </option>
                                  ))}
                                </select>
                              )}
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider mb-3 block">
                            Giới tính
                          </label>
                          <div className="flex items-center space-x-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <Controller
                                control={control}
                                name="gender"
                                render={({ field }) => (
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={field.value === "male"}
                                    onChange={field.onChange}
                                    className="w-4 h-4 text-primary focus:ring-primary border-black accent-primary"
                                  />
                                )}
                              />
                              <span>Nam</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <Controller
                                control={control}
                                name="gender"
                                render={({ field }) => (
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={field.value === "female"}
                                    onChange={field.onChange}
                                    className="w-4 h-4 text-primary focus:ring-primary border-black accent-primary"
                                  />
                                )}
                              />
                              <span>Nữ</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <Controller
                                control={control}
                                name="gender"
                                render={({ field }) => (
                                  <input
                                    type="radio"
                                    name="gender"
                                    value="other"
                                    checked={field.value === "other"}
                                    onChange={field.onChange}
                                    className="w-4 h-4 text-primary focus:ring-primary border-black accent-primary"
                                  />
                                )}
                              />
                              <span>Khác</span>
                            </label>
                          </div>
                          {errors.gender?.message && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.gender.message}
                            </p>
                          )}
                        </div>

                        <div className="pt-4">
                          <Button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full md:w-auto"
                          >
                            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </Card>

                  {/* Stats & Rank */}
                  {!isShipper && !isAdmin && !isManager && (
                    <div className="flex flex-col gap-6 lg:col-span-1">
                      <Card className="p-0 flex flex-col">
                        <div className="p-5 border-b-2 border-black">
                          <h3 className="font-serif text-lg font-bold">Thống kê</h3>
                        </div>
                        <div className="flex flex-col">
                          <div className="p-5 border-b-2 border-black flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setActiveTab("points")}>
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                                <Star size={20} />
                              </div>
                              <div>
                                <p className="font-serif text-2xl font-bold leading-none">
                                  {profile?.loyalty_points || 0}
                                </p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">
                                  Điểm tích lũy
                                </p>
                              </div>
                            </div>
                            <span>›</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Address Book */}
                {!isShipper && !isAdmin && !isManager && (
                  <Card className="p-0 mt-2 flex flex-col">
                    <div className="p-6 border-b-2 border-black flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={20} />
                        <h3 className="font-serif text-xl font-bold">
                          Sổ địa chỉ nhận hàng
                        </h3>
                      </div>
                      {!isAddingAddress && (
                        <button 
                          onClick={() => {
                            setIsAddingAddress(true);
                            setEditingAddressId(null);
                            resetAddress({ recipient_name: "", phone_number: "", address_line: "" });
                          }}
                          className="border-2 border-black px-4 py-1 text-sm font-bold hover:bg-black hover:text-white transition-colors"
                        >
                          + Thêm địa chỉ mới
                        </button>
                      )}
                    </div>
                    
                    <div className="p-6 md:p-8 flex flex-col gap-4">
                      {isAddressesLoading ? (
                        <p>Đang tải...</p>
                      ) : addresses && addresses.length > 0 ? (
                        addresses.map(addr => (
                          <div key={addr.id} className="border-2 border-black/10 rounded-2xl p-5 relative transition-all hover:border-black">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">{addr.recipient_name}</span>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-600">{addr.phone_number}</span>
                              {addr.is_default && (
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 uppercase tracking-wider border border-primary rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-4">{addr.address_line}</p>
                            
                            {!addr.is_default && (
                              <button 
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-xs font-bold text-primary hover:underline mt-2 inline-block"
                              >
                                Đặt làm mặc định
                              </button>
                            )}

                            <div className="absolute top-4 right-4 flex items-center gap-3">
                              <button 
                                onClick={() => handleEditAddress(addr)}
                                className="text-gray-500 hover:text-black text-xs font-bold transition-colors"
                              >
                                Sửa
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">Bạn chưa có địa chỉ giao hàng nào.</p>
                      )}

                      {isAddingAddress && (
                        <div className="mt-4 pt-6 border-t-2 border-dashed border-gray-200">
                          <h4 className="font-bold mb-4">{editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h4>
                          <form onSubmit={handleAddressSubmit(onSubmitAddress)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <input {...registerAddress("recipient_name")} placeholder="Họ và tên người nhận" className="w-full border-2 border-black/20 p-3 rounded-lg focus:border-primary outline-none" />
                                {addressErrors.recipient_name && <p className="text-red-500 text-xs mt-1">{String(addressErrors.recipient_name.message)}</p>}
                              </div>
                              <div>
                                <input {...registerAddress("phone_number")} placeholder="Số điện thoại" className="w-full border-2 border-black/20 p-3 rounded-lg focus:border-primary outline-none" />
                                {addressErrors.phone_number && <p className="text-red-500 text-xs mt-1">{String(addressErrors.phone_number.message)}</p>}
                              </div>
                            </div>
                            <div>
                              <input {...registerAddress("address_line")} placeholder="Địa chỉ chi tiết" className="w-full border-2 border-black/20 p-3 rounded-lg focus:border-primary outline-none" />
                              {addressErrors.address_line && <p className="text-red-500 text-xs mt-1">{String(addressErrors.address_line.message)}</p>}
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); resetAddress(); }} className="px-6 py-2 border-2 border-black font-bold hover:bg-gray-100 transition-colors rounded-lg">Hủy</button>
                              <button type="submit" className="px-6 py-2 bg-primary text-white font-bold border-2 border-primary hover:bg-primary/90 transition-colors rounded-lg">{editingAddressId ? "Cập nhật" : "Lưu địa chỉ"}</button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </>
            )}

            {activeTab === "favorites" && (
              <div>
                <div className="mb-6">
                  <h1 className="font-serif text-4xl font-bold mb-2">SẢN PHẨM YÊU THÍCH</h1>
                  <p className="text-gray-600">Danh sách các sản phẩm bạn đã lưu lại.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {favorites && favorites.length > 0 ? (
                    favorites.map((fav: any) => (
                      <Link to={`/products/${fav.product.slug}`} key={fav.id} className="bg-white border-2 border-black rounded-[2rem] p-4 flex flex-col gap-4 shadow-subtle hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                        <div className="aspect-square bg-gray-100 rounded-[1rem] overflow-hidden border-2 border-black/10">
                          <img src={(fav.product.images?.[0]?.image_url)?.startsWith('http') ? fav.product.images[0].image_url : `${API_URL}${fav.product.images?.[0]?.image_url}`} alt={fav.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg truncate">{fav.product.name}</h3>
                          <p className="text-primary font-black mt-1">{formatPrice(fav.product.price)}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 italic col-span-full">Bạn chưa có sản phẩm yêu thích nào.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "viewed" && (
              <div>
                <div className="mb-6">
                  <h1 className="font-serif text-4xl font-bold mb-2">SẢN PHẨM VỪA XEM</h1>
                  <p className="text-gray-600">Những sản phẩm bạn đã quan tâm gần đây.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {viewedProducts && viewedProducts.length > 0 ? (
                    viewedProducts.map((view: any) => (
                      <Link to={`/products/${view.product.slug}`} key={view.id} className="bg-white border-2 border-black rounded-[2rem] p-4 flex flex-col gap-4 shadow-subtle hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                        <div className="aspect-square bg-gray-100 rounded-[1rem] overflow-hidden border-2 border-black/10">
                          <img src={(view.product.images?.[0]?.image_url)?.startsWith('http') ? view.product.images[0].image_url : `${API_URL}${view.product.images?.[0]?.image_url}`} alt={view.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg truncate">{view.product.name}</h3>
                          <p className="text-primary font-black mt-1">{formatPrice(view.product.price)}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-2">Xem lúc: {new Date(view.viewed_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 italic col-span-full">Bạn chưa xem sản phẩm nào.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "points" && (
              <div>
                <div className="mb-6">
                  <h1 className="font-serif text-4xl font-bold mb-2">QUẢN LÝ VÍ ĐIỂM</h1>
                  <p className="text-gray-600">Theo dõi điểm tích lũy và các ưu đãi của bạn.</p>
                </div>
                
                <Card className="p-8 bg-gradient-to-br from-yellow-400 to-yellow-600 border-none shadow-xl text-white mb-8 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 opacity-20">
                    <Star size={200} className="fill-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold uppercase tracking-widest text-yellow-100 mb-2">Điểm hiện có</p>
                    <h2 className="text-6xl font-black mb-4">{profile?.loyalty_points?.toLocaleString() || 0} <span className="text-xl">điểm</span></h2>
                    <p className="text-sm font-medium">Tương đương <strong>{((profile?.loyalty_points || 0) * 100).toLocaleString()}₫</strong> khi thanh toán</p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2 border-b-2 border-black pb-4">
                    <Ticket size={24} /> Lịch sử dùng điểm
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 font-bold">Chưa có lịch sử giao dịch điểm.</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "shipper_orders" && isShipper && (
              <>
                <div className="mb-6">
                  <h1 className="font-serif text-4xl font-bold mb-2">
                    ĐƠN HÀNG CẦN GIAO
                  </h1>
                  <p className="text-gray-600 font-bold uppercase tracking-wider">
                    Danh sách đơn hàng sẵn sàng giao của cửa hàng bạn trực thuộc hoặc đơn đã nhận giao.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {shipperOrdersLoading ? (
                    <p className="text-gray-500 italic">Đang tải danh sách đơn hàng...</p>
                  ) : shipperOrders && shipperOrders.length > 0 ? (
                    shipperOrders.map((order: any) => {
                      const shippingAddress = order.parentOrder?.shipping_address || "Chưa có địa chỉ";
                      const paymentMethod = order.parentOrder?.payment_method || "COD";
                      const note = order.parentOrder?.note || "Không có ghi chú";
                      const statusLabels: Record<string, string> = {
                        READY_FOR_PICKUP: "Chờ lấy hàng",
                        DELIVERING: "Đang giao",
                        DELIVERED: "Chờ người mua xác nhận (Shipper đã giao)",
                        CANCELLED: "Giao không thành công (Hủy đơn)",
                      };
                      const statusColors: Record<string, string> = {
                        READY_FOR_PICKUP: "bg-blue-100 text-blue-700 border-blue-200",
                        DELIVERING: "bg-yellow-100 text-yellow-700 border-yellow-200",
                        DELIVERED: "bg-green-100 text-green-700 border-green-200",
                        CANCELLED: "bg-red-100 text-red-700 border-red-200",
                      };

                      return (
                        <Card key={order.id} className="p-6 border-2 border-black flex flex-col gap-4 shadow-subtle text-left">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b-2 border-black/10">
                            <div>
                              <span className="text-xs font-black uppercase text-gray-500">Mã đơn hàng:</span>
                              <span className="ml-2 font-serif font-black text-black">{order.shop_order_code}</span>
                            </div>
                            <span className={`px-3 py-1 border text-[10px] font-black uppercase tracking-widest rounded-lg ${statusColors[order.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                              {statusLabels[order.status] || order.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-gray-700">
                            <div>
                              <p className="mb-1"><span className="text-black uppercase text-[10px] font-black">Cửa hàng:</span> {order.shop?.shop_name}</p>
                              <p className="mb-1"><span className="text-black uppercase text-[10px] font-black">Địa chỉ giao hàng:</span> {shippingAddress}</p>
                              <p className="mb-1"><span className="text-black uppercase text-[10px] font-black">Ghi chú khách hàng:</span> {note}</p>
                            </div>
                            <div>
                              <p className="mb-1"><span className="text-black uppercase text-[10px] font-black">Thanh toán:</span> {paymentMethod}</p>
                              <p className="mb-1"><span className="text-black uppercase text-[10px] font-black">Tiền thu hộ (COD):</span> <span className="text-primary font-black text-sm">{Number(order.final_amount).toLocaleString()}₫</span></p>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="border-t border-black/5 pt-3">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Chi tiết sản phẩm</p>
                            <div className="space-y-2">
                              {order.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center text-xs">
                                  <span className="font-bold">{item.product_name} <span className="text-gray-400">x{item.quantity}</span></span>
                                  <span className="font-mono text-gray-500 font-bold">{Number(item.unit_price).toLocaleString()}₫</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-3 pt-4 border-t-2 border-dashed border-black/10">
                            {order.status === "READY_FOR_PICKUP" && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, "DELIVERING")}
                                className="px-5 py-2 border-2 border-black rounded-lg text-xs font-black uppercase tracking-widest bg-primary text-white hover:bg-black transition-all active:translate-y-[2px]"
                              >
                                Nhận giao hàng
                              </button>
                            )}

                            {order.status === "DELIVERING" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                                  className="px-5 py-2 border-2 border-black rounded-lg text-xs font-black uppercase tracking-widest bg-green-500 text-white hover:bg-black transition-all active:translate-y-[2px]"
                                >
                                  Xác nhận đã giao
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOrderId(order.id);
                                    setShowFailedModal(true);
                                  }}
                                  className="px-5 py-2 border-2 border-black rounded-lg text-xs font-black uppercase tracking-widest bg-red-500 text-white hover:bg-black transition-all active:translate-y-[2px]"
                                >
                                  Giao không thành công
                                </button>
                              </>
                            )}
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 italic py-10 text-center bg-white border-2 border-black border-dashed rounded-2xl">Không có đơn hàng nào cần xử lý.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Giao hàng không thành công Modal */}
      {showFailedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border-4 border-black rounded-3xl shadow-brutal max-w-md w-full p-6 animate-in zoom-in-95 text-left">
            <h3 className="font-serif text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2 text-red-600">
              Lý do giao thất bại
            </h3>
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-wider block mb-1">Chọn lý do</label>
              <div className="flex flex-col gap-2">
                {[
                  "Không liên lạc được người mua",
                  "Người mua từ chối nhận hàng",
                  "Sai địa chỉ giao hàng",
                  "Lý do khác",
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-3 p-3 border-2 border-black/10 rounded-xl cursor-pointer hover:border-black transition-all">
                    <input
                      type="radio"
                      name="failedReason"
                      value={reason}
                      checked={failedReason === reason}
                      onChange={(e) => setFailedReason(e.target.value)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-xs font-bold text-gray-800">{reason}</span>
                  </label>
                ))}
              </div>

              {failedReason === "Lý do khác" && (
                <div>
                  <label className="text-xs font-black uppercase tracking-wider block mb-1">Mô tả lý do</label>
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Nhập lý do cụ thể..."
                    className="w-full border-2 border-black p-3 rounded-xl focus:border-primary outline-none text-xs font-bold min-h-[80px]"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-black/10">
              <button
                type="button"
                onClick={() => {
                  setShowFailedModal(false);
                  setSelectedOrderId(null);
                  setOtherReason("");
                }}
                className="px-5 py-2 border-2 border-black rounded-lg text-xs font-black uppercase tracking-widest bg-white text-black hover:bg-gray-100 transition-all active:translate-y-[2px]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleFailDeliverySubmit}
                className="px-5 py-2 border-2 border-black rounded-lg text-xs font-black uppercase tracking-widest bg-red-500 text-white hover:bg-black transition-all active:translate-y-[2px]"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
