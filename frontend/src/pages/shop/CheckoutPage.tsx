import { MapPin, Truck, CreditCard, Wallet, ShieldCheck, ChevronLeft, Package, Loader2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/stores/hooks';
import { useCart } from '@/hooks/useCart';
import { useAddresses, useCreateAddress } from '@/hooks/useAddresses';
import { useCalculateCheckout, useCreateOrder } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useUser';
import { useValidCoupons } from '@/hooks/useCoupons';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateOrderPayload } from '@/types/order.types';
import { Tag, Check } from 'lucide-react';

const addressSchema = yup.object().shape({
  recipient_name: yup.string().required('Vui lòng nhập tên người nhận'),
  phone_number: yup.string().required('Vui lòng nhập số điện thoại'),
  address_line: yup.string().required('Vui lòng nhập địa chỉ giao hàng'),
  note: yup.string().optional(),
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => !!state.auth.accessToken);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/checkout');
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

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [shippingFee] = useState(30000);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");

  // Coupon and Points state
  const [couponCode, setCouponCode] = useState("");
  const [inputCoupon, setInputCoupon] = useState("");
  const [usePoints, setUsePoints] = useState(false);
  const [calculatedData, setCalculatedData] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(addressSchema),
  });

  // Khi danh sách địa chỉ thay đổi, chọn địa chỉ mặc định
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId && !isAddingNewAddress) {
      const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setValue('recipient_name', defaultAddr.recipient_name);
      setValue('phone_number', defaultAddr.phone_number);
      setValue('address_line', defaultAddr.address_line);
    } else if (addresses && addresses.length === 0) {
      setIsAddingNewAddress(true);
    }
  }, [addresses, selectedAddressId, isAddingNewAddress, setValue]);

  const handleSelectAddress = (id: number) => {
    setSelectedAddressId(id);
    setIsAddingNewAddress(false);
    const addr = addresses?.find(a => a.id === id);
    if (addr) {
      setValue('recipient_name', addr.recipient_name);
      setValue('phone_number', addr.phone_number);
      setValue('address_line', addr.address_line);
    }
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setIsAddingNewAddress(true);
    reset({ recipient_name: '', phone_number: '', address_line: '', note: '' });
  };

  const onSubmit = async (data: any) => {
    const checkoutItems = buyNowItem ? [buyNowItem] : (cart?.items || []);
    
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
      recipientName: data.recipient_name,
      recipientPhone: data.phone_number,
      shippingAddress: data.address_line,
      note: data.note,
      paymentMethod: paymentMethod,
      coupon_code: couponCode || undefined,
      use_points: usePoints,
      items: checkoutItems.map((item: any) => ({
        product_id: item.product_id,
        product_variant_id: item.product_variant_id || undefined,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      is_cart_checkout: !buyNowItem,
    };

    console.log(payload);
    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        navigate("/orders"); // Chuyển đến trang lịch sử đơn hàng
      },
      onError: (error) => {
        console.error("Lỗi khi đặt hàng", error);
        alert("Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại!");
      }
    });
  };

  const cartItems = buyNowItem ? [buyNowItem] : (cart?.items || []);
  const subtotal = buyNowItem ? (buyNowItem.unit_price * buyNowItem.quantity) : (cart?.totalAmount || 0);

  // Trigger calculate API when dependencies change
  useEffect(() => {
    if (cartItems.length > 0) {
      calculateMutation.mutate({
        items: cartItems.map((item: any) => ({
          product_id: item.product_id,
          product_variant_id: item.product_variant_id || undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
        couponCode: couponCode || undefined,
        usePoints
      }, {
        onSuccess: (data) => setCalculatedData(data),
        onError: (error: any) => {
          const errMsg = error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá";
          alert(errMsg);
          if (couponCode) {
            setCouponCode("");
            setInputCoupon("");
          }
        }
      });
    }
  }, [cart, buyNowItem, couponCode, usePoints]);

  if (isCartLoading || isAddressesLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const displaySubtotal = calculatedData ? calculatedData.subtotal : subtotal;
  const discountAmount = calculatedData ? calculatedData.discountAmount : 0;
  const pointsDiscount = calculatedData ? calculatedData.pointsDiscount : 0;
  const currentShippingFee = calculatedData ? calculatedData.shippingFee : shippingFee;
  const displayTotal = calculatedData ? calculatedData.totalAmount : subtotal + currentShippingFee;

  const handleApplyCoupon = () => {
    setCouponCode(inputCoupon);
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation / Progress */}
        <div className="mb-12 flex items-center justify-between">
          <Link to="/cart" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-primary transition-all">
            <ChevronLeft size={20} /> Quay lại giỏ hàng
          </Link>
          <div className="flex gap-4 items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary">01 Thông tin</span>
            <span className="w-8 h-[2px] bg-gray-200"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">02 Thanh toán</span>
            <span className="w-8 h-[2px] bg-gray-200"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">03 Hoàn tất</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Shipping Info (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm">
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
                {addresses?.map(addr => (
                  <div 
                    key={addr.id} 
                    onClick={() => handleSelectAddress(addr.id)}
                    className={`p-5 rounded-2xl relative cursor-pointer group transition-all border-2 ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-black'}`}
                  >
                    <div className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center bg-white border-2 ${selectedAddressId === addr.id ? 'border-primary' : 'border-gray-300'}`}>
                      {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                    </div>
                    <p className="text-xs font-black uppercase mb-1">
                      {addr.recipient_name}
                      {addr.is_default && <span className="ml-2 text-[10px] text-primary bg-white px-2 py-0.5 border border-primary rounded font-bold">Mặc định</span>}
                    </p>
                    <p className="text-xs font-bold text-gray-500">{addr.phone_number}</p>
                    <p className="text-xs font-medium text-gray-600 mt-2 leading-relaxed">{addr.address_line}</p>
                  </div>
                ))}
              </div>

              {(isAddingNewAddress || (addresses && addresses.length === 0)) && (
                <div className="space-y-4 pt-4 border-t border-dashed border-gray-200">
                  <p className="text-sm font-black uppercase">Thêm địa chỉ mới</p>
                  <div>
                    <input {...register('recipient_name')} placeholder="Họ và tên" className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    {errors.recipient_name && <p className="text-red-500 text-xs mt-1 font-bold">{errors.recipient_name.message}</p>}
                  </div>
                  <div>
                    <input {...register('phone_number')} placeholder="Số điện thoại" className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    {errors.phone_number && <p className="text-red-500 text-xs mt-1 font-bold">{errors.phone_number.message}</p>}
                  </div>
                  <div>
                    <input {...register('address_line')} placeholder="Địa chỉ chi tiết" className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    {errors.address_line && <p className="text-red-500 text-xs mt-1 font-bold">{errors.address_line.message}</p>}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-dashed border-gray-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Ghi chú cho đơn hàng</p>
                <textarea {...register('note')} rows={2} placeholder="Ví dụ: Giao giờ hành chính..." className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-sm"></textarea>
              </div>
            </div>
          </div>

          {/* Column 2: Shipping & Payment Methods (4/12) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Shipping Methods */}
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Truck className="text-primary" /> Phương thức vận chuyển
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <label className="relative flex items-center justify-between p-6 bg-primary/5 border-2 border-primary rounded-2xl cursor-pointer transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center bg-white">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase">Giao hàng tiêu chuẩn</p>
                      <p className="text-xs text-gray-500 font-bold">Dự kiến giao: 2-3 ngày</p>
                    </div>
                  </div>
                  <span className="text-sm font-black">{currentShippingFee.toLocaleString()}₫</span>
                </label>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <CreditCard className="text-primary" /> Phương thức thanh toán
              </h3>
              
              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`w-full flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'bg-primary/5 border-primary' : 'bg-white border-black/10 hover:border-black'}`}
                >
                  <div className="flex items-center gap-4">
                    <Wallet size={24} className={paymentMethod === 'COD' ? 'text-primary' : 'text-gray-400'} />
                    <p className="text-sm font-black uppercase">Thanh toán khi nhận hàng (COD)</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${paymentMethod === 'COD' ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                  </div>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("VNPAY")}
                  className={`w-full flex items-center justify-between p-6 border-2 rounded-2xl transition-all group ${paymentMethod === 'VNPAY' ? 'bg-primary/5 border-primary' : 'bg-white border-black/10 hover:border-black'}`}
                >
                  <div className="flex items-center gap-4">
                    <img src="https://vnpay.vn/wp-content/uploads/2020/07/icon-vnpay.png" alt="VNPAY" className="h-8 object-contain" />
                    <p className="text-sm font-black uppercase group-hover:text-primary">Thanh toán qua VNPAY</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${paymentMethod === 'VNPAY' ? 'border-primary' : 'border-gray-300'}`}>
                    {paymentMethod === 'VNPAY' && <div className="w-2 h-2 rounded-full bg-primary"></div>}
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
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Mã giảm giá</label>
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
                      <button type="button" className="text-red-500 ml-2 hover:underline" onClick={() => { setCouponCode(""); setInputCoupon(""); }}>Hủy</button>
                    </div>
                  )}

                  {/* Available Coupons */}
                  {validCoupons && validCoupons.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {validCoupons.map((coupon: any) => (
                        <button
                          key={coupon.id}
                          type="button"
                          onClick={() => { setInputCoupon(coupon.code); setCouponCode(coupon.code); }}
                          className={`shrink-0 border-2 rounded-xl p-3 text-left transition-all ${couponCode === coupon.code ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-black/30'}`}
                        >
                          <p className="font-black text-sm uppercase">{coupon.code}</p>
                          <p className="text-[10px] font-bold text-gray-500">Giảm {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `${Number(coupon.discount_value).toLocaleString()}₫`}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-gray-200 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${usePoints ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white group-hover:border-primary'}`}>
                      {usePoints && <Check size={16} strokeWidth={4} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black uppercase tracking-tight">Sử dụng điểm tích lũy</p>
                      <p className="text-xs font-bold text-gray-500">
                        Bạn đang có <span className="text-primary">{profile?.loyalty_points || 0} điểm</span> (1 điểm = 100₫)
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
          </div>

          {/* Column 3: Order Summary (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-black text-white border-2 border-black rounded-[2.5rem] p-8 shadow-brutal flex flex-col gap-8">
              <h3 className="text-xl font-black uppercase tracking-tighter border-b border-white/20 pb-4 flex items-center gap-3">
                <Package className="text-primary" /> Đơn hàng
              </h3>

              <div className="space-y-6">
                {cartItems.map(item => {
                  const imageUrl = item.product?.images?.find(img => img.is_primary)?.image_url || item.product?.images?.[0]?.image_url || '';
                  return (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-white/10 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                       <img src={imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8088"}${imageUrl}`} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                       <p className="text-xs font-black uppercase truncate max-w-[120px]">{item.product?.name}</p>
                       <p className="text-[10px] font-bold text-gray-400">
                         {item.variant ? `Size ${item.variant.size} / ${item.variant.color}` : 'Mặc định'}
                       </p>
                       <div className="flex justify-between items-center mt-1">
                         <p className="text-xs font-black text-primary">{(Number(item.unit_price)).toLocaleString()}₫</p>
                         <p className="text-[10px] font-black text-gray-400">x{item.quantity}</p>
                       </div>
                    </div>
                  </div>
                )})}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>TẠM TÍNH</span>
                  <span className="text-white">{displaySubtotal.toLocaleString()}₫</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>GIẢM GIÁ (VOUCHER)</span>
                    <span className="text-red-400">-{discountAmount.toLocaleString()}₫</span>
                  </div>
                )}
                
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>GIẢM GIÁ (ĐIỂM)</span>
                    <span className="text-red-400">-{pointsDiscount.toLocaleString()}₫</span>
                  </div>
                )}

                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>VẬN CHUYỂN</span>
                  <span className="text-green-400">{currentShippingFee === 0 ? 'Miễn phí' : `${currentShippingFee.toLocaleString()}₫`}</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs font-black uppercase tracking-widest">TỔNG CỘNG</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">{displayTotal.toLocaleString()}₫</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={createOrderMutation.isPending || cartItems.length === 0}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
              >
                {createOrderMutation.isPending ? <Loader2 className="animate-spin" size={24} /> : 'ĐẶT HÀNG NGAY'}
              </button>

              <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest justify-center">
                <ShieldCheck size={14} className="text-green-500" /> Thanh toán được bảo mật
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
