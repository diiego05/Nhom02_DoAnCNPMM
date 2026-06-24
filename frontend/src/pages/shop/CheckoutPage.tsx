import {
  MapPin,
  Truck,
  CreditCard,
  Wallet,
  ShieldCheck,
  ChevronLeft,
  Package,
  Loader2,
  Store,
  Landmark,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/stores/hooks";
import { useCart } from "@/hooks/useCart";
import { useAddresses, useCreateAddress } from "@/hooks/useAddresses";
import { useCalculateCheckout, useCreateOrder } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useUser";
import { useValidCoupons } from "@/hooks/useCoupons";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { CreateOrderPayload } from "@/types/order.types";
import { Tag, Check, Ticket } from "lucide-react";
const addressSchema = yup.object().shape({
  recipient_name: yup.string().required("Vui lòng nhập tên người nhận"),
  phone_number: yup.string().required("Vui lòng nhập số điện thoại"),
  address_line: yup.string().required("Vui lòng nhập địa chỉ giao hàng"),
  note: yup.string().optional(),
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login?redirect=/checkout");
    }
  }, [isAuthenticated, navigate]);

  const buyNowItem = location.state?.buyNowItem;
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { data: addresses, isLoading: isAddressesLoading } = useAddresses();
  const { data: profile } = useProfile();
  const { data: validCoupons } = useValidCoupons();

  const createOrderMutation = useCreateOrder();
  const createAddressMutation = useCreateAddress();
  const calculateMutation = useCalculateCheckout();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Coupon and Points state
  const [couponCode, setCouponCode] = useState("");
  const [inputCoupon, setInputCoupon] = useState("");
  const [shopCoupons, setShopCoupons] = useState<Record<string, string>>({});
  const [usePoints, setUsePoints] = useState(false);
  const [calculatedData, setCalculatedData] = useState<any>(null);

  const platformCoupons = validCoupons?.filter((c: any) => !c.shop_id) || [];
  const availableShopCoupons =
    validCoupons?.filter((c: any) => c.shop_id) || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(addressSchema),
  });

  // Khi danh sách địa chỉ thay đổi, chọn địa chỉ mặc định
  useEffect(() => {
    if (
      addresses &&
      addresses.length > 0 &&
      !selectedAddressId &&
      !isAddingNewAddress
    ) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setValue("recipient_name", defaultAddr.recipient_name);
      setValue("phone_number", defaultAddr.phone_number);
      setValue("address_line", defaultAddr.address_line);
    } else if (addresses && addresses.length === 0) {
      setIsAddingNewAddress(true);
    }
  }, [addresses, selectedAddressId, isAddingNewAddress, setValue]);

  const handleSelectAddress = (id: number) => {
    setSelectedAddressId(id);
    setIsAddingNewAddress(false);
    const addr = addresses?.find((a) => a.id === id);
    if (addr) {
      setValue("recipient_name", addr.recipient_name);
      setValue("phone_number", addr.phone_number);
      setValue("address_line", addr.address_line);
    }
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setIsAddingNewAddress(true);
    reset({ recipient_name: "", phone_number: "", address_line: "", note: "" });
  };

  const onSubmit = async (data: any) => {
    const checkoutItems = buyNowItem ? [buyNowItem] : cart?.items || [];

    if (checkoutItems.length === 0) {
      alert("Đơn hàng của bạn đang trống!");
      return;
    }

    // Nếu người dùng đang thêm địa chỉ mới, hãy lưu nó vào DB trước
    if (isAddingNewAddress) {
      try {
        await createAddressMutation.mutateAsync({
          recipient_name: data.recipient_name,
          phone_number: data.phone_number,
          address_line: data.address_line,
          is_default: addresses?.length === 0, // Set default if it's the first address
        });
      } catch (error) {
        console.error("Lỗi khi lưu địa chỉ mới", error);
      }
    }

    const payload: CreateOrderPayload = {
      addressId: selectedAddressId || undefined,
      note: data.note,
      paymentMethod: paymentMethod,
      platformCouponCode: couponCode || undefined,
      shopCoupons: shopCoupons,
      usePoints: usePoints,
      items: checkoutItems.map((item: any) => ({
        product_id:
          item.product_id || item.variant?.product?.id || item.product?.id,
        variant_id:
          item.product_variant_id ||
          item.variant_id ||
          item.variant?.id ||
          undefined,
        quantity: item.quantity,
        unit_price:
          item.variant?.sale_price || item.variant?.price || item.unit_price,
      })),
      is_cart_checkout: !buyNowItem,
    };

    console.log(payload);
    createOrderMutation.mutate(payload, {
      onSuccess: (data: any) => {
        if (data && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          setCurrentStep(3); // Chuyển đến trang Hoàn tất
        }
      },
      onError: (error) => {
        console.error("Lỗi khi đặt hàng", error);
        alert("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại!");
      },
    });
  };

  const cartItems = buyNowItem ? [buyNowItem] : cart?.items || [];
  const subtotal = buyNowItem
    ? buyNowItem.unit_price * buyNowItem.quantity
    : cart?.totalAmount || 0;

  const groupedCartItems = cartItems.reduce((acc: any, item: any) => {
    const product = item.variant?.product || item.product;
    const shopId = product?.shop?.id || product?.shop_id || "unknown";
    if (!acc[shopId]) {
      acc[shopId] = {
        shop: product?.shop || { id: product?.shop_id },
        items: [],
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  const shopGroups: any[] = Object.values(groupedCartItems);
  const fallbackShippingFee =
    shopGroups.length > 0 ? shopGroups.length * 30000 : 0;

  // Trigger calculate API when dependencies change
  useEffect(() => {
    if (cartItems.length > 0) {
      calculateMutation.mutate(
        {
          items: cartItems.map((item: any) => ({
            product_id:
              item.product_id || item.variant?.product?.id || item.product?.id,
            variant_id:
              item.product_variant_id ||
              item.variant_id ||
              item.variant?.id ||
              undefined,
            quantity: item.quantity,
            unit_price:
              item.variant?.sale_price ||
              item.variant?.price ||
              item.unit_price,
          })),
          platformCouponCode: couponCode || undefined,
          shopCoupons: shopCoupons,
          usePoints,
        },
        {
          onSuccess: (data) => setCalculatedData(data),
          onError: (error: any) => {
            const errMsg =
              error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá";
            alert(errMsg);
            if (couponCode) {
              setCouponCode("");
              setInputCoupon("");
            }
          },
        },
      );
    }
  }, [cart, buyNowItem, couponCode, shopCoupons, usePoints]);

  if (isCartLoading || isAddressesLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const displaySubtotal = calculatedData
    ? calculatedData.parentSubtotal
    : subtotal;
  const discountAmount = calculatedData
    ? calculatedData.totalShopDiscount + calculatedData.platformDiscount
    : 0;
  const pointsDiscount = calculatedData
    ? calculatedData.pointsDiscount || 0
    : 0;
  const currentShippingFee = calculatedData
    ? calculatedData.totalShippingFee
    : fallbackShippingFee;
  const displayTotal = calculatedData
    ? calculatedData.totalAmount
    : subtotal + currentShippingFee;

  const handleApplyCoupon = () => {
    setCouponCode(inputCoupon);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation / Progress */}
        {currentStep < 3 && (
          <div className="mb-12 flex items-center justify-between">
            <Link
              to="/cart"
              className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-primary transition-all"
            >
              <ChevronLeft size={20} /> Quay lại giỏ hàng
            </Link>
            <div className="flex gap-4 items-center">
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= 1 ? "text-primary border-b-2 border-primary" : "text-gray-400"}`}
              >
                01 Thông tin
              </span>
              <span className="w-8 h-[2px] bg-gray-200"></span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= 2 ? "text-primary border-b-2 border-primary" : "text-gray-400"}`}
              >
                02 Thanh toán
              </span>
              <span className="w-8 h-[2px] bg-gray-200"></span>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${currentStep === 3 ? "text-primary border-b-2 border-primary" : "text-gray-400"}`}
              >
                03 Hoàn tất
              </span>
            </div>
          </div>
        )}

        {currentStep === 3 ? (
          <div className="max-w-2xl mx-auto mt-20 text-center space-y-8">
            <div className="w-32 h-32 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-primary">
              <Check size={64} strokeWidth={3} />
            </div>
            <h1 className="text-5xl font-serif font-black tracking-tighter uppercase text-primary">
              Đặt hàng thành công!
            </h1>
            <p className="text-gray-500 font-medium text-lg">
              Cảm ơn bạn đã mua sắm tại UTEShop. Đơn hàng của bạn đang được xử
              lý và sẽ sớm được giao đến bạn.
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Link
                to="/orders"
                className="bg-black text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                Xem đơn hàng
              </Link>
              <Link
                to="/"
                className="bg-white border-2 border-black text-black px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Column 1: Shipping Info (Step 1) */}
            {currentStep === 1 && (
              <div className="lg:col-span-8 space-y-6">
                <div className="card-brutal !p-8 !rounded-[2rem]">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                      <MapPin className="text-primary" /> Địa chỉ nhận hàng
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter"
                    >
                      + Thêm mới
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* Saved Addresses List */}
                    {addresses?.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr.id)}
                        className={`p-5 rounded-2xl relative cursor-pointer group transition-all border ${selectedAddressId === addr.id ? "border-primary bg-primary/5 shadow-sm" : "border-black/10 hover:border-black hover:shadow-subtle hover:-translate-y-1"}`}
                      >
                        <div
                          className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center bg-white border ${selectedAddressId === addr.id ? "border-primary" : "border-gray-300"}`}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                          )}
                        </div>
                        <p className="text-xs font-black uppercase mb-1">
                          {addr.recipient_name}
                          {addr.is_default && (
                            <span className="ml-2 text-[10px] text-primary bg-white px-2 py-0.5 border border-primary rounded font-bold">
                              Mặc định
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-bold text-gray-500">
                          {addr.phone_number}
                        </p>
                        <p className="text-xs font-medium text-gray-600 mt-2 leading-relaxed">
                          {addr.address_line}
                        </p>
                      </div>
                    ))}
                  </div>

                  {(isAddingNewAddress ||
                    (addresses && addresses.length === 0)) && (
                      <div className="space-y-4 pt-4 border-t border-dashed border-gray-200">
                        <p className="text-sm font-black uppercase">
                          Thêm địa chỉ mới
                        </p>
                        <div>
                          <input
                            {...register("recipient_name")}
                            placeholder="Họ và tên"
                            className="input-brutal text-sm"
                          />
                          {errors.recipient_name && (
                            <p className="text-red-500 text-xs mt-1 font-bold">
                              {errors.recipient_name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            {...register("phone_number")}
                            placeholder="Số điện thoại"
                            className="input-brutal text-sm"
                          />
                          {errors.phone_number && (
                            <p className="text-red-500 text-xs mt-1 font-bold">
                              {errors.phone_number.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            {...register("address_line")}
                            placeholder="Địa chỉ chi tiết"
                            className="input-brutal text-sm"
                          />
                          {errors.address_line && (
                            <p className="text-red-500 text-xs mt-1 font-bold">
                              {errors.address_line.message}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="mt-8 pt-8 border-t border-dashed border-gray-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                      Ghi chú cho đơn hàng
                    </p>
                    <textarea
                      {...register("note")}
                      rows={2}
                      placeholder="Ví dụ: Giao giờ hành chính..."
                      className="input-brutal text-sm resize-none"
                    ></textarea>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!selectedAddressId}
                      className="bg-black text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50"
                    >
                      Tiếp tục thanh toán
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Column 2: Shipping & Payment Methods (Step 2) */}
            {currentStep === 2 && (
              <div className="lg:col-span-8 space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border-2 border-black shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-gray-500">
                        Giao đến
                      </p>
                      <p className="text-sm font-bold truncate max-w-sm">
                        {addresses?.find((a) => a.id === selectedAddressId)
                          ?.address_line || "Chưa có địa chỉ"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[10px] font-black text-primary hover:underline uppercase"
                  >
                    Thay đổi
                  </button>
                </div>

                {/* Shipping Methods */}
                <div className="card-brutal !p-8 !rounded-[2rem]">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <Truck className="text-primary" /> Phương thức vận chuyển
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <label className="relative flex items-center justify-between p-6 bg-primary/5 border border-primary rounded-2xl cursor-pointer transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full border border-primary flex items-center justify-center bg-white">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase">
                            Giao hàng tiêu chuẩn
                          </p>
                          <p className="text-xs text-gray-500 font-bold">
                            Dự kiến giao: 2-3 ngày
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black">
                        {currentShippingFee.toLocaleString()}₫
                      </span>
                    </label>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="card-brutal !p-8 !rounded-[2rem]">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <CreditCard className="text-primary" /> Phương thức thanh
                    toán
                  </h3>

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`w-full flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === "COD" ? "bg-primary/5 border-primary" : "bg-white border-black/10 hover:border-black"}`}
                    >
                      <div className="flex items-center gap-4">
                        <Wallet
                          size={24}
                          className={
                            paymentMethod === "COD"
                              ? "text-primary"
                              : "text-gray-400"
                          }
                        />
                        <p className="text-sm font-black uppercase">
                          Thanh toán khi nhận hàng (COD)
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${paymentMethod === "COD" ? "border-primary" : "border-gray-300"}`}
                      >
                        {paymentMethod === "COD" && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("VNPAY")}
                      className={`w-full flex items-center justify-between p-6 border-2 rounded-2xl transition-all group ${paymentMethod === "VNPAY" ? "bg-primary/5 border-primary" : "bg-white border-black/10 hover:border-black"}`}
                    >
                      <div className="flex items-center gap-4">
                        <Landmark
                          size={24}
                          className={
                            paymentMethod === "VNPAY"
                              ? "text-primary"
                              : "text-gray-400"
                          }
                        />
                        <p className="text-sm font-black uppercase group-hover:text-primary">
                          Thanh toán qua VNPAY
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${paymentMethod === "VNPAY" ? "border-primary" : "border-gray-300"}`}
                      >
                        {paymentMethod === "VNPAY" && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Coupons & Points Area */}
                <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                    <Tag className="text-primary" /> Khuyến mãi & Điểm
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                        Mã giảm giá
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          placeholder="Nhập mã voucher..."
                          className="flex-1 bg-gray-50 border-2 border-black/20 rounded-xl px-4 py-3 font-bold uppercase text-sm focus:border-primary outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={calculateMutation.isPending}
                          className="bg-black text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50"
                        >
                          Áp dụng
                        </button>
                      </div>
                      {couponCode && (
                        <div className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
                          <Check size={14} /> Đang áp dụng mã: {couponCode}
                          <button
                            type="button"
                            className="text-red-500 ml-2 hover:underline"
                            onClick={() => {
                              setCouponCode("");
                              setInputCoupon("");
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      )}

                      {/* Available Coupons */}
                      {platformCoupons && platformCoupons.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {platformCoupons.map((coupon: any) => (
                            <button
                              key={coupon.id}
                              type="button"
                              onClick={() => {
                                setInputCoupon(coupon.code);
                                setCouponCode(coupon.code);
                              }}
                              className={`shrink-0 border-2 rounded-xl p-3 text-left transition-all ${couponCode === coupon.code ? "border-primary bg-primary/5" : "border-black/10 hover:border-black/30"}`}
                            >
                              <p className="font-black text-sm uppercase">
                                {coupon.code}
                              </p>
                              <p className="text-[10px] font-bold text-gray-500">
                                Giảm{" "}
                                {coupon.discount_type === "PERCENT"
                                  ? `${coupon.discount_value}%`
                                  : `${Number(coupon.discount_value).toLocaleString()}₫`}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${usePoints ? "bg-primary border-primary text-white" : "border-gray-300 bg-white group-hover:border-primary"}`}
                        >
                          {usePoints && <Check size={16} strokeWidth={4} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black uppercase tracking-tight">
                            Sử dụng điểm tích lũy
                          </p>
                          <p className="text-xs font-bold text-gray-500">
                            Bạn đang có{" "}
                            <span className="text-primary">
                              {profile?.loyalty_points || 0} điểm
                            </span>{" "}
                            (1 điểm = 100₫)
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={usePoints}
                          onChange={(e) => setUsePoints(e.target.checked)}
                          disabled={!profile?.loyalty_points}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Order Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-white border-2 border-black text-black px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createOrderMutation.isPending || cartItems.length === 0
                    }
                    className="flex-1 bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                  >
                    {createOrderMutation.isPending ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      "ĐẶT HÀNG NGAY"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Column 3: Order Summary (4/12) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-black text-white border-2 border-black rounded-[2.5rem] p-8 shadow-brutal flex flex-col gap-8">
                <h3 className="text-xl font-black uppercase tracking-tighter border-b border-white/20 pb-4 flex items-center gap-3">
                  <Package className="text-primary" /> Đơn hàng
                </h3>

                <div className="space-y-6">
                  {shopGroups.map((group) => (
                    <div
                      key={group.shop?.id || "unknown"}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                        <Store className="text-primary w-4 h-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">
                          {group.shop?.name || "UTEShop Official"}
                        </h4>
                      </div>
                      {group.items.map((item: any) => {
                        const product = item.variant?.product || item.product;
                        const imageUrl =
                          product?.images?.find((img: any) => img.is_primary)
                            ?.image_url ||
                          product?.images?.[0]?.image_url ||
                          "";
                        const unitPrice =
                          item.variant?.sale_price ||
                          item.variant?.price ||
                          item.unit_price ||
                          0;
                        return (
                          <div
                            key={item.id}
                            className="flex gap-4 items-center pl-2"
                          >
                            <div className="w-16 h-20 bg-white/10 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                              <img
                                src={
                                  imageUrl.startsWith("http")
                                    ? imageUrl
                                    : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8088"}${imageUrl}`
                                }
                                alt={product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-grow">
                              <p className="text-xs font-black uppercase truncate max-w-[120px]">
                                {product?.name}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400">
                                {item.variant
                                  ? `Size ${item.variant.size} / ${item.variant.color}`
                                  : "Mặc định"}
                              </p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs font-black text-primary">
                                  {Number(unitPrice).toLocaleString()}₫
                                </p>
                                <p className="text-[10px] font-black text-gray-400">
                                  x{item.quantity}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Shop Coupon Section */}
                      {availableShopCoupons.filter(
                        (c: any) => c.shop_id === group.shop?.id,
                      ).length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Ticket size={16} className="text-primary" />
                              <span className="text-xs font-bold text-gray-400 uppercase">
                                Mã của Shop
                              </span>
                            </div>
                            <select
                              value={shopCoupons[group.shop?.id] || ""}
                              onChange={(e) =>
                                setShopCoupons((prev) => ({
                                  ...prev,
                                  [group.shop?.id]: e.target.value,
                                }))
                              }
                              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                            >
                              <option value="" className="text-black">
                                Chọn mã giảm giá
                              </option>
                              {availableShopCoupons
                                .filter((c: any) => c.shop_id === group.shop?.id)
                                .map((c: any) => (
                                  <option
                                    key={c.id}
                                    value={c.code}
                                    className="text-black"
                                  >
                                    {c.code} - Giảm{" "}
                                    {c.discount_type === "PERCENT"
                                      ? `${c.discount_value}%`
                                      : `${Number(c.discount_value).toLocaleString()}đ`}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>TẠM TÍNH</span>
                    <span className="text-white">
                      {displaySubtotal.toLocaleString()}₫
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>GIẢM GIÁ (VOUCHER)</span>
                      <span className="text-red-400">
                        -{discountAmount.toLocaleString()}₫
                      </span>
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-gray-400">
                      <span>GIẢM GIÁ (ĐIỂM)</span>
                      <span className="text-red-400">
                        -{pointsDiscount.toLocaleString()}₫
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>VẬN CHUYỂN</span>
                    <span className="text-green-400">
                      {currentShippingFee === 0
                        ? "Miễn phí"
                        : `${currentShippingFee.toLocaleString()}₫`}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-xs font-black uppercase tracking-widest">
                      TỔNG CỘNG
                    </span>
                    <span className="text-3xl font-black text-primary tracking-tighter">
                      {displayTotal.toLocaleString()}₫
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                    <span>Điểm thưởng nhận được</span>
                    <span className="text-green-500">
                      +{Math.floor(displayTotal / 10000)} điểm
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest justify-center">
                  <ShieldCheck size={14} className="text-green-500" /> Thanh
                  toán được bảo mật
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
