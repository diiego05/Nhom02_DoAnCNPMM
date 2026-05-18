import { MapPin, Truck, CreditCard, Wallet, ShieldCheck, ChevronLeft, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
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

        {/* Bento Grid Layout - 3:4:3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Shipping Info (3/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <MapPin className="text-primary" /> Địa chỉ nhận hàng
                </h3>
                <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter">+ Thêm địa chỉ mới</button>
              </div>
              
              <div className="space-y-4">
                {/* Saved Addresses List */}
                <div className="p-5 border-2 border-primary bg-primary/5 rounded-2xl relative cursor-pointer group">
                  <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center bg-white">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-xs font-black uppercase mb-1">Nguyễn Văn A <span className="ml-2 text-[10px] text-primary bg-white px-2 py-0.5 border border-primary rounded font-bold">Mặc định</span></p>
                  <p className="text-xs font-bold text-gray-500">0123 456 789</p>
                  <p className="text-xs font-medium text-gray-600 mt-2 leading-relaxed">Số 123 Đường Võ Văn Ngân, Phường Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh</p>
                </div>

                <div className="p-5 border-2 border-black/10 hover:border-black rounded-2xl cursor-pointer transition-all">
                  <p className="text-xs font-black uppercase mb-1">Trần Thị B</p>
                  <p className="text-xs font-bold text-gray-500">0987 654 321</p>
                  <p className="text-xs font-medium text-gray-600 mt-2 leading-relaxed">456 Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-dashed border-gray-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Ghi chú cho đơn hàng</p>
                <textarea rows={2} placeholder="Ví dụ: Giao giờ hành chính..." className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-4 font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none text-sm"></textarea>
              </div>
            </div>
          </div>

          {/* Column 2: Shipping & Payment Methods (4/12) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Shipping Methods */}
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Truck className="text-primary" /> Phương thức vận chuyển
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <label className="relative flex items-center justify-between p-6 bg-primary/5 border-2 border-primary rounded-2xl cursor-pointer transition-all active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center bg-white">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black uppercase">Giao hàng nhanh</p>
                        <span className="text-[8px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded italic">VOUCHER ÁP DỤNG</span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold">Dự kiến giao: 1-2 ngày</p>
                    </div>
                  </div>
                  <span className="text-sm font-black">30.000₫</span>
                </label>
                
                <label className="relative flex items-center justify-between p-6 bg-white border-2 border-black/10 rounded-2xl cursor-pointer hover:border-black transition-all active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>
                    <div>
                      <p className="text-sm font-black uppercase">Tiêu chuẩn</p>
                      <p className="text-xs text-gray-500 font-bold">Dự kiến giao: 3-5 ngày</p>
                    </div>
                  </div>
                  <span className="text-sm font-black">15.000₫</span>
                </label>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <CreditCard className="text-primary" /> Phương thức thanh toán
              </h3>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-6 bg-primary/5 border-2 border-primary rounded-2xl cursor-pointer transition-all active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <Wallet size={24} className="text-primary" />
                    <p className="text-sm font-black uppercase">Thanh toán khi nhận hàng (COD)</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center bg-white">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                </button>
                
                <button className="w-full flex items-center justify-between p-6 bg-white border-2 border-black rounded-2xl hover:bg-primary transition-all group active:translate-y-1">
                  <div className="flex items-center gap-4">
                    <img src="https://vnpay.vn/wp-content/uploads/2020/07/icon-vnpay.png" alt="VNPAY" className="h-8 object-contain" />
                    <p className="text-sm font-black uppercase group-hover:text-white">Thanh toán qua VNPAY</p>
                  </div>
                  <div className="bg-primary text-white text-[10px] font-black px-2 py-1 rounded border border-black shadow-subtle group-hover:bg-black group-hover:shadow-none uppercase">KHUYÊN DÙNG</div>
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Order Summary (3/12) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-black text-white border-2 border-black rounded-[2.5rem] p-8 shadow-brutal flex flex-col gap-8">
              <h3 className="text-xl font-black uppercase tracking-tighter border-b border-white/20 pb-4 flex items-center gap-3">
                <Package className="text-primary" /> Đơn hàng
              </h3>

              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-16 h-20 bg-white/10 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                       <img src={`https://images.unsplash.com/photo-${i === 1 ? '1591047139829-d91aecb6caea' : '1541099649105-f69ad21f3246'}?q=80&w=200`} alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                       <p className="text-xs font-black uppercase truncate max-w-[120px]">{i === 1 ? 'Heritage Jacket' : 'Slim Fit Jeans'}</p>
                       <p className="text-[10px] font-bold text-gray-400">Size L / 1x</p>
                       <p className="text-xs font-black mt-1 text-primary">{i === 1 ? '1.250.000₫' : '850.000₫'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>TẠM TÍNH</span>
                  <span className="text-white">2.100.000₫</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>VẬN CHUYỂN</span>
                  <span className="text-green-400">30.000₫</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs font-black uppercase tracking-widest">TỔNG CỘNG</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">2.130.000₫</span>
                </div>
              </div>

              <Link
                to="/orders"
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 flex items-center justify-center"
              >
                 ĐẶT HÀNG NGAY
              </Link>

              <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest justify-center">
                <ShieldCheck size={14} className="text-green-500" /> Thanh toán được bảo mật
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
