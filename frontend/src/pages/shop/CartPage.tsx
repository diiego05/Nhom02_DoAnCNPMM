import { Trash2, Plus, Minus, Ticket, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const cartItems = [
    {
      id: 1,
      name: "Áo Khoác Heritage Jacket",
      category: "Nam",
      price: 1250000,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=500&auto=format&fit=crop",
      size: "L",
      color: "Đen Carbon",
      quantity: 1
    },
    {
      id: 2,
      name: "Quần Jeans Slim Fit",
      category: "Nữ",
      price: 850000,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=500&auto=format&fit=crop",
      size: "M",
      color: "Xanh Indigo",
      quantity: 2
    }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 2000000 ? 0 : 30000;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#F4F4F0] pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-serif font-black tracking-tighter uppercase mb-2">Giỏ hàng</h1>
            <p className="text-gray-500 font-medium">Bạn đang có <span className="text-black font-bold">{cartItems.length} sản phẩm</span> trong giỏ hàng</p>
          </div>
          <Link to="/products" className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-primary hover:border-primary transition-all">
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          
          {/* Main Content - Left Column (7/10) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
              <div className="space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-8 py-6 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0 group">
                    {/* Thumbnail */}
                    <div className="w-32 h-40 bg-gray-50 rounded-2xl overflow-hidden border-2 border-black flex-shrink-0 relative group-hover:shadow-subtle transition-all">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">{item.name}</h3>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Phân loại: <span className="text-black">{item.size} / {item.color}</span></p>
                        </div>
                        <button className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-gray-50 border-2 border-black rounded-xl h-12 overflow-hidden">
                          <button className="w-12 h-full flex items-center justify-center hover:bg-white transition-all font-bold text-lg border-r-2 border-black">
                            <Minus size={16} />
                          </button>
                          <span className="w-14 text-center font-black text-base">{item.quantity}</span>
                          <button className="w-12 h-full flex items-center justify-center hover:bg-white transition-all font-bold text-lg border-l-2 border-black">
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-400 line-through">{(item.price * 1.2).toLocaleString()}₫</p>
                          <p className="text-xl font-black text-black">{item.price.toLocaleString()}₫</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty Cart Placeholder (hidden if items exist) */}
            {cartItems.length === 0 && (
               <div className="bg-white border-2 border-dashed border-gray-300 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <ShoppingBag size={40} />
                  </div>
                  <h2 className="text-2xl font-black uppercase mb-2">Giỏ hàng trống</h2>
                  <p className="text-gray-500 mb-8 max-w-xs">Hãy chọn cho mình những sản phẩm ưng ý nhất để làm đầy giỏ hàng nhé!</p>
                  <Link to="/products" className="btn-brutal px-10">Khám phá ngay</Link>
               </div>
            )}
          </div>

          {/* Sidebar - Right Column (3/10) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Voucher Section */}
            <div className="bg-white border-2 border-black rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Ticket className="text-primary" size={18} /> Mã giảm giá
                </h3>
                <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter">Chọn mã khác</button>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nhập mã..." 
                  className="flex-grow bg-gray-50 border-2 border-black rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="bg-black text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-primary transition-all active:translate-y-1">
                  Áp dụng
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Voucher khả dụng</p>
                <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-all">
                  <div className="w-8 h-8 bg-white border border-black/10 rounded-lg flex items-center justify-center text-primary">
                    <Ticket size={16} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] font-black uppercase">UTE2024</p>
                    <p className="text-[9px] font-bold text-gray-500">Giảm 50k cho đơn từ 1M</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-brutal flex flex-col gap-6">
              <h3 className="text-xl font-black uppercase tracking-tighter border-b-2 border-black pb-4">Tổng quan đơn hàng</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold uppercase tracking-widest">Tạm tính</span>
                   <span className="font-black">{subtotal.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 font-bold uppercase tracking-widest">Phí giao hàng</span>
                   <span className="font-black text-green-600">{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()}₫`}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                   <span className="text-gray-500 font-bold uppercase tracking-widest">Tổng cộng</span>
                   <div className="text-right">
                      <p className="text-xs text-primary font-black mb-1 italic">Đã bao gồm VAT</p>
                      <p className="text-3xl font-black tracking-tighter">{total.toLocaleString()}₫</p>
                   </div>
                </div>
              </div>

              <Link to="/checkout" className="btn-brutal w-full mt-4 py-5 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black tracking-widest shadow-brutal active:shadow-none active:translate-x-[4px] active:translate-y-[4px] whitespace-nowrap">
                THANH TOÁN NGAY <ArrowRight size={16} />
              </Link>
              
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                Thanh toán an toàn 100% với bảo mật SSL <br />
                Đổi trả dễ dàng trong vòng 30 ngày
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
