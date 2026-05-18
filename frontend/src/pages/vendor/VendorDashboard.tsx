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
  User,
  FileDown,
  MessageCircle,
  Send,
  MoreHorizontal,
  Paperclip,
  Smile
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import useAuth from '@/hooks/useAuth';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    // Logic kiểm tra quyền Vendor
    const hasVendorRole = user?.isVendor || 
      (typeof user?.role === 'string' && user.role === 'VENDOR') || 
      (typeof user?.role === 'object' && user.role?.role_name === 'VENDOR');
    
    if (hasVendorRole) {
      setIsRegistered(true);
    }
  }, [user]);

  const sidebarItems = [
    { id: "overview", label: "Tổng quan", icon: <LayoutDashboard size={20} /> },
    { id: "products", label: "Sản phẩm", icon: <Package size={20} /> },
    { id: "orders", label: "Đơn hàng", icon: <ShoppingCart size={20} /> },
    { id: "promos", label: "Khuyến mãi", icon: <Percent size={20} /> },
    { id: "finance", label: "Ví & Doanh thu", icon: <Wallet size={20} /> },
    { id: "chats", label: "Chat với khách", icon: <MessageCircle size={20} /> },
    { id: "interactions", label: "Bình luận & Yêu thích", icon: <MessageSquare size={20} /> },
    { id: "settings", label: "Cấu hình Shop", icon: <Settings size={20} /> },
  ];

  // --- TRANG ĐĂNG KÝ SHOP ---
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
             <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brutal">
                <Store size={32} />
             </div>
             <h1 className="text-4xl font-serif font-black tracking-tighter uppercase">Trở thành Người bán hàng</h1>
             <p className="text-gray-500 font-medium mt-2">Mở gian hàng của bạn trên UTEShop và bắt đầu kinh doanh ngay hôm nay</p>
          </div>

          <div className="bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-brutal">
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setIsRegistered(true); }}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Tên gian hàng</label>
                  <input type="text" placeholder="Ví dụ: UTEShop Official" className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Số điện thoại kinh doanh</label>
                    <input type="tel" placeholder="0xxx xxx xxx" className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ngành hàng chính</label>
                    <select className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all">
                      <option>Thời trang Nam</option>
                      <option>Thời trang Nữ</option>
                      <option>Phụ kiện & Trang sức</option>
                      <option>Giày dép</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Địa chỉ kho hàng (Lấy hàng)</label>
                  <textarea rows={3} placeholder="Số nhà, tên đường, phường/xã..." className="w-full bg-gray-50 border-2 border-black rounded-xl px-5 py-4 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none" required></textarea>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-black text-primary focus:ring-primary" required />
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
                    Tôi đồng ý với các <span className="text-primary underline cursor-pointer">Điều khoản & Chính sách</span> dành cho Người bán của UTEShop.
                  </p>
                </div>
              </div>

              <button type="submit" className="w-full btn-brutal py-5 text-sm shadow-brutal hover:bg-primary transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                KHỞI TẠO GIAN HÀNG NGAY
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
               <span className="font-serif text-lg font-black tracking-tighter uppercase leading-none">UTEShop</span>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">VENDOR</span>
             </div>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-black text-white shadow-brutal translate-x-1' : 'hover:bg-primary/10 text-gray-400 hover:text-black'}`}
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           </div>

           <div className="flex items-center gap-6">
              <button className="relative w-11 h-11 border-2 border-black rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all active:translate-y-1">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-black rounded-full"></span>
              </button>
              
              <div className="w-[2px] h-8 bg-gray-100"></div>

              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-11 h-11 bg-primary/10 border-2 border-black rounded-xl flex items-center justify-center text-primary hover:bg-primary/20 transition-all active:translate-y-1 overflow-hidden shadow-sm"
                >
                  <User size={24} />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-4 w-64 bg-white border-2 border-black rounded-2xl shadow-brutal z-50 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">VD</div>
                      <div>
                        <p className="text-xs font-black uppercase">Vendor</p>
                        <p className="text-[10px] text-primary font-bold">vendor@uteshop.vn</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Thông tin cá nhân</button>
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Cài đặt bảo mật</button>
                      <button className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all mt-2">Đăng xuất</button>
                    </div>
                  </div>
                )}
              </div>

               <button className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-white text-black hover:bg-green-500 hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                 Báo cáo <FileDown size={14} />
               </button>

               <Link to="/" className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                 Xem Shop <ExternalLink size={14} />
               </Link>
           </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-10 max-w-7xl w-full mx-auto">
          
          {/* TAB: TỔNG QUAN (Overview) */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="flex justify-between items-end">
                 <div>
                   <h1 className="text-4xl font-serif font-black tracking-tighter uppercase mb-2">Thống kê cửa hàng</h1>
                   <p className="text-gray-500 font-medium italic">Tổng hợp tình hình kinh doanh trong ngày.</p>
                 </div>
              </div>

              {/* Bento Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: "Doanh thu", value: "24.5M", sub: "+15%", icon: <Wallet className="text-green-500" /> },
                   { label: "Đơn hàng", value: "128", sub: "Hôm nay", icon: <ShoppingBag className="text-blue-500" /> },
                   { label: "Bình luận mới", value: "12", sub: "Chờ phản hồi", icon: <MessageSquare className="text-orange-500" /> },
                   { label: "Yêu thích", value: "450", sub: "Sản phẩm", icon: <Heart className="text-red-500" /> }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                         <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-black/5">{stat.icon}</div>
                         <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">{stat.sub}</span>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                         <p className="text-2xl font-black tracking-tighter mt-1">{stat.value}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Chart Mockup */}
                 <div className="lg:col-span-2 bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                       <TrendingUp className="text-primary" /> Doanh thu 7 ngày qua
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-3 px-4">
                       {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                         <div key={i} className="flex-grow bg-black rounded-t-xl hover:bg-primary transition-all relative group cursor-pointer" style={{ height: `${h}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">{(h*100).toLocaleString()}k</div>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 {/* Recent Activity */}
                 <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Hoạt động gần đây</h3>
                    <div className="space-y-6">
                       {[
                         { title: "Đơn hàng mới #UTE99210", time: "2 phút trước", icon: <Plus size={14} className="text-green-500" /> },
                         { title: "Sản phẩm 'Heritage' sắp hết hàng", time: "15 phút trước", icon: <Clock size={14} className="text-orange-500" /> },
                         { title: "Khách hàng đánh giá 5 sao", time: "1 giờ trước", icon: <Star size={14} className="text-yellow-500 fill-yellow-500" /> }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-4 items-start">
                            <div className="mt-1">{item.icon}</div>
                            <div>
                               <p className="text-xs font-black uppercase leading-tight">{item.title}</p>
                               <p className="text-[10px] font-bold text-gray-400 mt-1">{item.time}</p>
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
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-serif font-black uppercase">Quản lý Sản phẩm</h2>
                  <button className="px-6 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-black text-white hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2">
                     <Plus size={16} /> THÊM SẢN PHẨM
                  </button>
              </div>
              
              <div className="bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-sm">
                 <div className="p-6 border-b-2 border-black/5 bg-gray-50/50 flex gap-4">
                    <div className="relative flex-grow">
                       <input type="text" placeholder="Tìm tên, SKU..." className="w-full bg-white border-2 border-black rounded-xl px-10 py-2.5 text-xs font-bold" />
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <button className="px-4 py-2.5 border-2 border-black rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-all">
                       <Filter size={16} /> Bộ lọc
                    </button>
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
                          {[1, 2, 3, 4, 5].map(i => (
                             <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-8 py-4">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-12 bg-gray-100 rounded-lg border border-black/5 overflow-hidden shrink-0">
                                         <img src={`https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=100`} className="w-full h-full object-cover" />
                                      </div>
                                      <span className="text-xs font-black uppercase truncate max-w-[150px]">Heritage Jacket V.0{i}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-4 text-xs font-mono font-bold text-gray-400">JKT-2024-00{i}</td>
                                <td className="px-8 py-4 text-xs font-black">1.250.000₫</td>
                                <td className="px-8 py-4 text-xs font-black text-primary">24</td>
                                <td className="px-8 py-4">
                                   <span className="text-[9px] font-black uppercase bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100">Đang bán</span>
                                </td>
                                <td className="px-8 py-4 text-right">
                                   <div className="flex justify-end gap-2">
                                       <button className="p-2 border-2 border-black rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Edit3 size={14}/></button>
                                       <button className="p-2 border-2 border-black rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Trash2 size={14}/></button>
                                    </div>
                                </td>
                             </tr>
                          ))}
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
                 <h2 className="text-3xl font-serif font-black uppercase">Quản lý Khuyến mãi</h2>
                 <button className="btn-brutal px-6 flex items-center gap-2 text-xs">
                    <Plus size={16} /> TẠO VOUCHER MỚI
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full group-hover:scale-150 transition-all"></div>
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                         <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center">
                            <Percent size={24} />
                         </div>
                         <div>
                            <h4 className="text-lg font-black uppercase tracking-tight">GIẢM 50K CHO ĐƠN 1M</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mã: <span className="text-primary">UTE2024_{i}</span></p>
                         </div>
                      </div>
                      <div className="space-y-3 relative z-10">
                         <div className="flex justify-between text-xs">
                            <span className="text-gray-500 font-medium">Đã sử dụng</span>
                            <span className="font-black">12/100</span>
                         </div>
                         <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-black h-full rounded-full" style={{ width: '12%' }}></div>
                         </div>
                         <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400">Hết hạn: 30/06/2024</span>
                            <span className="text-[10px] font-black text-green-600 uppercase">ĐANG CHẠY</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* TAB: TƯƠNG TÁC (Interactions - Comments & Favorites) */}
          {activeTab === "interactions" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Comments column */}
               <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-black uppercase flex items-center gap-3">
                     <MessageSquare className="text-primary" /> Bình luận & Đánh giá
                  </h3>
                  <div className="space-y-4">
                     {[1, 2].map(i => (
                        <div key={i} className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm">
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black">KH</div>
                                 <div>
                                    <p className="text-xs font-black uppercase">Khách hàng #{i}</p>
                                    <div className="flex gap-0.5 mt-0.5">
                                       {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="text-yellow-400 fill-yellow-400" />)}
                                    </div>
                                 </div>
                              </div>
                              <span className="text-[9px] font-bold text-gray-400">12:30 Hôm nay</span>
                           </div>
                           <p className="text-xs font-medium text-gray-600 leading-relaxed mb-4 italic">
                              "Sản phẩm rất đẹp, vải xịn, giao hàng nhanh hơn mong đợi. Shop tư vấn nhiệt tình."
                           </p>
                           <div className="bg-gray-50 rounded-xl p-4 border border-black/5">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Phản hồi của bạn</p>
                              <textarea placeholder="Nhập phản hồi..." className="w-full bg-white border-2 border-black rounded-lg p-3 text-xs font-medium focus:outline-none resize-none" rows={2}></textarea>
                              <div className="flex justify-end mt-2">
                                 <button className="px-4 py-1.5 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all">Gửi phản hồi</button>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Favorites column */}
               <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-black uppercase flex items-center gap-3">
                     <Heart className="text-red-500" /> Sản phẩm Yêu thích nhất
                  </h3>
                  <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-sm">
                     <p className="text-xs font-bold text-gray-500 mb-8 italic">Các sản phẩm này đang được nhiều người dùng lưu lại. Hãy tạo khuyến mãi để kích cầu!</p>
                     <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => (
                           <div key={i} className="flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-14 bg-gray-100 rounded-lg overflow-hidden border border-black/5">
                                    <img src={`https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=100`} className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                    <p className="text-xs font-black uppercase">Heritage Jacket V.0{i}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1">
                                       <Heart size={10} className="text-red-500 fill-red-500" /> {250 - (i*30)} lượt lưu
                                    </p>
                                 </div>
                              </div>
                              <button className="p-2 border-2 border-black rounded-lg hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                 <Percent size={14} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: VÍ & DOANH THU (Finance) */}
          {activeTab === "finance" && (
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <h2 className="text-3xl font-serif font-black uppercase">Tài chính & Ví điện tử</h2>
                    <button className="px-8 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-black text-white hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2">
                       <ArrowUpRight size={16} /> RÚT TIỀN VỀ NGÂN HÀNG
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-1 bg-black text-white border-2 border-black rounded-[2.5rem] p-10 shadow-brutal flex flex-col justify-between h-64 relative overflow-hidden group">
                      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/10 rounded-full transition-all group-hover:scale-125"></div>
                      <div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Số dư hiện tại</span>
                         <h4 className="text-5xl font-black tracking-tighter text-primary mt-2">42.85M</h4>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 border-t border-white/10 pt-4 relative z-10 flex items-center gap-2">
                         <CheckCircle2 size={12} className="text-green-500" /> Đã xác thực tài khoản ngân hàng
                      </p>
                   </div>
                   
                   <div className="md:col-span-2 bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-sm overflow-hidden">
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-8 border-b-2 border-black/5 pb-4">Lịch sử giao dịch</h3>
                      <div className="space-y-4">
                         {[1, 2, 3].map(i => (
                           <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 2 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                    {i === 2 ? <ArrowUpRight size={20} /> : <TrendingUp size={20} />}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black uppercase">{i === 2 ? 'Rút tiền về Vietcombank' : 'Thanh toán đơn #UTE99210'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">12/05/2024 - 14:20</p>
                                 </div>
                              </div>
                              <p className={`text-sm font-black ${i === 2 ? 'text-red-500' : 'text-green-500'}`}>
                                 {i === 2 ? '-' : '+'} {(i * 500000).toLocaleString()}₫
                              </p>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* TAB: CHAT (Customer Chat) */}
          {activeTab === "chats" && (
            <div className="h-[calc(100vh-10rem)] bg-white border-2 border-black rounded-[2.5rem] overflow-hidden flex shadow-sm">
               {/* Contact List */}
               <div className="w-96 border-r-2 border-black flex flex-col bg-gray-50/30">
                  <div className="p-6 border-b-2 border-black/5">
                     <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Tin nhắn</h3>
                     <div className="relative">
                        <input type="text" placeholder="Tìm khách hàng..." className="w-full bg-white border-2 border-black rounded-xl px-10 py-2 text-xs font-bold focus:outline-none" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                     </div>
                  </div>
                  <div className="flex-grow overflow-y-auto p-2 space-y-1">
                     {[1, 2, 3, 4, 5].map(i => (
                        <button key={i} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${i === 1 ? 'bg-black text-white shadow-subtle' : 'hover:bg-white hover:shadow-sm'}`}>
                           <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-primary/20 border border-black/5 flex items-center justify-center font-black text-primary">K{i}</div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                           </div>
                           <div className="flex-grow text-left min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                 <span className="text-[10px] font-black uppercase truncate">Khách hàng #{i}</span>
                                 <span className={`text-[8px] font-bold ${i === 1 ? 'text-gray-400' : 'text-gray-400'}`}>12:45</span>
                              </div>
                              <p className={`text-[10px] truncate ${i === 1 ? 'text-gray-400' : 'text-gray-500'} font-medium`}>Chào shop, sản phẩm này còn size L không ạ?</p>
                           </div>
                           {i === 2 && <div className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[8px] font-black">2</div>}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Chat Window */}
               <div className="flex-grow flex flex-col bg-white">
                  {/* Chat Header */}
                  <div className="p-6 border-b-2 border-black/5 flex justify-between items-center bg-white">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xl">K1</div>
                        <div>
                           <h4 className="text-sm font-black uppercase tracking-tight">Khách hàng #1</h4>
                           <p className="text-[10px] font-bold text-green-500 flex items-center gap-1 uppercase tracking-widest"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Đang hoạt động</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button className="p-2 border-2 border-black rounded-lg hover:bg-gray-50 transition-all"><MoreHorizontal size={18} /></button>
                     </div>
                  </div>

                  {/* Message History */}
                  <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/20">
                     <div className="flex justify-center">
                        <span className="bg-white border-2 border-black px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Hôm nay, 12:30</span>
                     </div>
                     
                     {/* Incoming Message */}
                     <div className="flex gap-4 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[8px] font-black shrink-0">K1</div>
                        <div className="space-y-2">
                           <div className="bg-white border-2 border-black p-4 rounded-2xl rounded-tl-none shadow-subtle">
                              <p className="text-xs font-medium leading-relaxed">Chào shop, mình muốn hỏi về sản phẩm Heritage Jacket V.01 ạ.</p>
                           </div>
                           <div className="bg-white border-2 border-black p-4 rounded-2xl shadow-subtle">
                              <p className="text-xs font-medium leading-relaxed">Sản phẩm này còn size L màu xanh không ạ? Mình cao 1m75 nặng 70kg mang size nào vừa?</p>
                           </div>
                           <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-1">12:35</span>
                        </div>
                     </div>

                     {/* Outgoing Message */}
                     <div className="flex flex-row-reverse gap-4 max-w-[80%] ml-auto">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[8px] font-black shrink-0">VS</div>
                        <div className="space-y-2 text-right">
                           <div className="bg-black text-white border-2 border-black p-4 rounded-2xl rounded-tr-none shadow-subtle">
                              <p className="text-xs font-medium leading-relaxed">Chào bạn! Dạ sản phẩm này bên mình vẫn còn size L màu xanh ạ.</p>
                           </div>
                           <div className="bg-black text-white border-2 border-black p-4 rounded-2xl shadow-subtle">
                              <p className="text-xs font-medium leading-relaxed">Với chiều cao và cân nặng của bạn thì size L là hoàn toàn vừa vặn và thoải mái nhé!</p>
                           </div>
                           <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mr-1">12:40</span>
                        </div>
                     </div>

                     {/* Product Reference Card */}
                     <div className="flex gap-4 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[8px] font-black shrink-0">K1</div>
                        <div className="bg-white border-2 border-black p-3 rounded-2xl shadow-subtle flex gap-4 w-72">
                           <div className="w-16 h-20 bg-gray-100 rounded-lg border border-black/5 overflow-hidden">
                              <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=100" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex flex-col justify-between py-1">
                              <div>
                                 <h5 className="text-[10px] font-black uppercase">Heritage Jacket V.01</h5>
                                 <p className="text-[10px] font-black text-primary mt-1">1.250.000₫</p>
                              </div>
                              <button className="text-[8px] font-black underline uppercase text-left">Gửi link sản phẩm</button>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-6 border-t-2 border-black bg-white">
                     <div className="flex items-center gap-4 bg-gray-50 border-2 border-black rounded-2xl p-2 pl-4 shadow-inner focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                        <button className="p-2 hover:bg-gray-200 rounded-xl transition-all text-gray-500"><Paperclip size={20} /></button>
                        <input 
                           type="text" 
                           placeholder="Nhập tin nhắn của bạn..." 
                           className="flex-grow bg-transparent border-none focus:outline-none font-bold text-sm py-2"
                        />
                        <button className="p-2 hover:bg-gray-200 rounded-xl transition-all text-gray-500"><Smile size={20} /></button>
                        <button className="bg-black text-white p-3 rounded-xl hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                           <Send size={20} />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Pagination Common - Only for list tabs */}
          {['products', 'orders', 'promos'].includes(activeTab) && (
            <div className="flex justify-center items-center gap-2 pt-12">
               <button className="w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-1">
                  <ChevronLeft size={18} />
               </button>
               {[1, 2, 3, '...', 8].map((p, i) => (
                  <button key={i} className={`w-10 h-10 border-2 border-black rounded-xl font-black text-xs transition-all ${p === 1 ? 'bg-black text-white' : 'hover:bg-primary/10 active:translate-y-1'}`}>
                     {p}
                  </button>
               ))}
               <button className="w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-1">
                  <ChevronRight size={18} />
               </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
