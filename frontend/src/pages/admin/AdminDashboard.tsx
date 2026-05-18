import { 
  ShieldAlert, 
  Users, 
  Store, 
  Box, 
  ShoppingCart, 
  BarChart, 
  Settings, 
  Search, 
  Bell, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Eye, 
  Lock,
  ArrowUpRight,
  UserPlus,
  ShoppingBag,
  TrendingUp,
  Activity,
  UserCheck,
  AlertTriangle,
  User,
  FileDown
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const sidebarItems = [
    { id: "overview", label: "Tổng quan Admin", icon: <ShieldAlert size={20} /> },
    { id: "users", label: "Quản lý Người dùng", icon: <Users size={20} /> },
    { id: "vendors", label: "Quản lý Vendor", icon: <Store size={20} /> },
    { id: "products", label: "Quản lý Sản phẩm", icon: <Box size={20} /> },
    { id: "orders", label: "Quản lý Đơn hàng", icon: <ShoppingCart size={20} /> },
    { id: "revenue", label: "Doanh thu hệ thống", icon: <BarChart size={20} /> },
    { id: "permissions", label: "Cấu hình quyền", icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F0] flex overflow-hidden">
      
      {/* Sidebar - Neo-Brutalist standard */}
      <aside className="w-64 bg-white border-r-2 border-black flex flex-col h-screen sticky top-0 z-50 shrink-0">
        <div className="p-8 border-b-2 border-black/5">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-red-600 text-white border-2 border-black rounded-xl flex items-center justify-center group-hover:bg-black transition-all shadow-subtle group-hover:shadow-none">
               <ShieldAlert size={24} />
             </div>
             <div className="flex flex-col">
               <span className="font-serif text-lg font-black tracking-tighter uppercase leading-none text-red-600">UTEShop</span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-black">ADMIN</span>
             </div>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-black text-white shadow-brutal translate-x-1' : 'hover:bg-red-50 text-gray-400 hover:text-black'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto">
        
        {/* Topbar refined */}
        <header className="bg-white/80 backdrop-blur-md border-b border-black/5 h-20 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
           <div className="relative w-96 my-4">
              <input 
                type="text" 
                placeholder="Tìm kiếm mọi thứ trên hệ thống..." 
                className="w-full bg-gray-50 border-2 border-black rounded-xl px-12 py-3 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all shadow-inner"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           </div>

           <div className="flex items-center gap-6">
              <button className="relative w-11 h-11 border-2 border-black rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all active:translate-y-1">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 border-2 border-black rounded-full"></span>
              </button>
              
              <div className="w-[2px] h-8 bg-gray-100"></div>

              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-11 h-11 bg-red-100 border-2 border-black rounded-xl flex items-center justify-center text-red-600 hover:bg-red-200 transition-all active:translate-y-1 overflow-hidden"
                >
                  <User size={24} />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-4 w-64 bg-white border-2 border-black rounded-2xl shadow-brutal z-50 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black">AD</div>
                      <div>
                        <p className="text-xs font-black uppercase">Admin</p>
                        <p className="text-[10px] text-red-500 font-bold">admin@uteshop.vn</p>
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
                 Website <ExternalLink size={14} />
               </Link>
           </div>
        </header>

        {/* Content Area */}
        <div className="p-10 max-w-7xl w-full mx-auto">
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="flex justify-between items-end">
                 <div>
                   <h1 className="text-4xl font-serif font-black tracking-tighter uppercase mb-2">Bảng điều khiển hệ thống</h1>
                   <p className="text-gray-500 font-medium italic">Toàn bộ chỉ số hoạt động của UTEShop Platform.</p>
                 </div>
              </div>

              {/* Big Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: "Tổng người dùng", value: "24.5k", icon: <Users className="text-blue-500" /> },
                   { label: "Tổng doanh thu", value: "2.4B", icon: <TrendingUp className="text-green-500" /> },
                   { label: "Gian hàng", value: "1.2k", icon: <Store className="text-primary" /> },
                   { label: "Đơn hàng/tháng", value: "45.8k", icon: <Activity className="text-purple-500" /> }
                 ].map((s, i) => (
                   <div key={i} className="bg-white border-2 border-black rounded-3xl p-8 shadow-sm flex items-center gap-6 group hover:shadow-brutal transition-all cursor-default">
                      <div className="w-14 h-14 bg-gray-50 border-2 border-black/5 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">{s.icon}</div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                         <p className="text-3xl font-black tracking-tighter">{s.value}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Traffic Chart Mockup */}
                 <div className="bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-sm h-96 relative overflow-hidden">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-10">Lưu lượng truy cập hệ thống</h3>
                    <div className="flex items-end justify-between h-48 gap-3">
                       {[20, 50, 40, 80, 60, 95, 70, 85, 30, 55, 45, 90].map((h, i) => (
                         <div key={i} className="flex-grow bg-red-600 rounded-t-xl hover:bg-black transition-all relative group" style={{ height: `${h}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">{h}k users</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* System Alerts */}
                 <div className="bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-sm h-96">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                       <AlertTriangle className="text-red-500" /> Cảnh báo hệ thống
                    </h3>
                    <div className="space-y-6 overflow-y-auto h-64 pr-4">
                       {[
                         { msg: "Yêu cầu rút tiền 500M từ Vendor #02", type: "critical" },
                         { msg: "Phát hiện đăng nhập lạ từ admin 'K'", type: "warning" },
                         { msg: "Hệ thống sắp bảo trì vào lúc 00:00", type: "info" }
                       ].map((m, i) => (
                         <div key={i} className={`p-5 rounded-2xl border-2 border-black flex items-center justify-between ${m.type === 'critical' ? 'bg-red-50' : 'bg-gray-50'}`}>
                            <span className="text-xs font-black uppercase">{m.msg}</span>
                            <button className="text-[10px] font-black underline uppercase">XỬ LÝ</button>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === "users" && (
            <div className="space-y-8">
               <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-serif font-black uppercase">Quản lý Người dùng</h2>
                  <button className="px-8 py-4 border-2 border-black rounded-2xl font-black text-xs uppercase tracking-widest bg-black text-white hover:bg-red-600 transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2">
                     <UserPlus size={16} /> THÊM USER MỚI
                  </button>
               </div>

               <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b-2 border-black/5 bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                           <th className="px-8 py-6">Thành viên</th>
                           <th className="px-8 py-6">ID Hệ thống</th>
                           <th className="px-8 py-6">Vai trò</th>
                           <th className="px-8 py-6">Trạng thái</th>
                           <th className="px-8 py-6 text-right">Thao tác</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-black/5">
                        {[1, 2, 3, 4, 5].map(i => (
                           <tr key={i} className="hover:bg-red-50/10 transition-colors">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black">U{i}</div>
                                    <div>
                                       <p className="text-sm font-black uppercase">User Name {i}</p>
                                       <p className="text-[10px] font-bold text-gray-400">user_{i}@mail.com</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-xs font-mono font-bold">UID-00{i*123}</td>
                              <td className="px-8 py-6">
                                 <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 border-black ${i === 1 ? 'bg-red-600 text-white' : 'bg-white'}`}>
                                    {i === 1 ? 'MANAGER' : 'CUSTOMER'}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-[10px] font-black uppercase">Active</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-3">
                                     <button className="p-2 border-2 border-black rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Lock size={14}/></button>
                                     <button className="p-2 border-2 border-black rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><X size={14}/></button>
                                  </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* TAB: PERMISSIONS */}
          {activeTab === "permissions" && (
            <div className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {['MANAGER', 'VENDOR'].map((role, idx) => (
                    <div key={idx} className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm flex flex-col gap-6">
                       <h3 className="text-xl font-black uppercase tracking-tighter border-b-2 border-black pb-4">{role}</h3>
                       <div className="space-y-4">
                          {['Quản lý đơn', 'Duyệt Vendor', 'Xem báo cáo', 'Thay đổi cấu hình', 'Xóa dữ liệu'].map((p, i) => (
                             <div key={i} className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase">{p}</span>
                                <input type="checkbox" defaultChecked={i < 3} className="w-5 h-5 rounded border-2 border-black text-red-600 focus:ring-red-500" />
                             </div>
                          ))}
                       </div>
                       <button className="w-full mt-4 py-4 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-red-600 transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">CẬP NHẬT QUYỀN</button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Pagination Common - Only for list tabs */}
          {['users', 'vendors', 'products', 'orders'].includes(activeTab) && (
            <div className="mt-12 flex justify-center items-center gap-3">
                <button className="w-12 h-12 border-2 border-black rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-1">
                   <ChevronLeft size={20} />
                </button>
                {[1, 2, 3, '...', 40].map((p, i) => (
                   <button key={i} className={`w-12 h-12 border-2 border-black rounded-2xl font-black text-sm transition-all ${p === 1 ? 'bg-black text-white' : 'hover:bg-red-50 active:translate-y-1'}`}>
                      {p}
                   </button>
                ))}
                <button className="w-12 h-12 border-2 border-black rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-1">
                   <ChevronRight size={20} />
                </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
