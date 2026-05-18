import { 
  ShieldCheck, 
  Users, 
  Box, 
  BarChart3, 
  Search, 
  Filter, 
  Check, 
  X, 
  ExternalLink,
  Bell,
  Store,
  Eye,
  UserCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  FileDown
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock data for Vendors
  const allVendors = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: `UTEShop Partner ${i + 1}`,
    email: `uteshop_p${i + 1}@mail.com`,
    code: `VEN-2024-${(i + 1).toString().padStart(3, '0')}`,
    representative: "Nguyễn Văn A",
    productsCount: 120 * (i + 1),
    status: i % 7 === 3 ? "BỊ KHÓA" : "HOẠT ĐỘNG",
  }));

  // Mock data for Products
  const allProducts = Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    name: `Heritage Jacket - Edition 2024 V.0${i + 1}`,
    sku: `H-JKT-00${i + 1}`,
    category: "Thời trang Nam",
    price: 1250000,
    stock: 100 + i * 5,
    vendor: `UTEShop Partner ${(i % 5) + 1}`,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=200"
  }));

  const paginatedVendors = allVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedProducts = allProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = activeTab === "vendors" 
    ? Math.ceil(allVendors.length / itemsPerPage) 
    : Math.ceil(allProducts.length / itemsPerPage);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset page when switching tabs
  };

  const sidebarItems = [
    { id: "overview", label: "Tổng quan Manager", icon: <ShieldCheck size={20} /> },
    { id: "vendors", label: "Quản lý Vendor", icon: <Users size={20} /> },
    { id: "products", label: "Quản lý Sản phẩm", icon: <Box size={20} /> },
    { id: "stats", label: "Báo cáo hệ thống", icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F0] flex overflow-hidden">
      
      {/* Sidebar - Follows admin-dashboard layout style */}
      <aside className="w-64 bg-white border-r-2 border-black flex flex-col h-screen sticky top-0 z-50 shrink-0">
        <div className="p-8 border-b-2 border-black/5">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-primary text-white border-2 border-black rounded-xl flex items-center justify-center group-hover:bg-black transition-all shadow-subtle group-hover:shadow-none">
               <ShieldCheck size={24} />
             </div>
             <div className="flex flex-col">
               <span className="font-serif text-lg font-black tracking-tighter uppercase leading-none">UTEShop</span>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">MANAGER</span>
             </div>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-black text-white shadow-brutal translate-x-1' : 'hover:bg-primary/10 text-gray-400 hover:text-black'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto">
        
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-black/5 h-20 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
           <div className="relative w-96 my-4">
              <input 
                type="text" 
                placeholder="Tìm kiếm vendor, sản phẩm, mã đơn..." 
                className="w-full bg-gray-50 border-2 border-black rounded-xl px-12 py-3 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           </div>

           <div className="flex items-center gap-6">
              <button className="relative w-11 h-11 border-2 border-black rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all active:translate-y-1">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-primary border-2 border-black rounded-full"></span>
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
                      <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black">MN</div>
                      <div>
                        <p className="text-xs font-black uppercase">Manager</p>
                        <p className="text-[10px] text-primary font-bold">manager@uteshop.vn</p>
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

        {/* Content Body */}
        <div className="p-10 max-w-7xl w-full mx-auto">
          
          {/* TAB: TỔNG QUAN (Manager Overview) */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="flex justify-between items-end">
                 <div>
                   <h1 className="text-4xl font-serif font-black tracking-tighter uppercase mb-2">Hệ thống Manager</h1>
                   <p className="text-gray-500 font-medium italic">Giám sát hoạt động của các Vendor và Sản phẩm trên sàn.</p>
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: "Tổng số Vendor", value: "840", sub: "+12 mới", icon: <Store className="text-primary" /> },
                   { label: "Sản phẩm duyệt", value: "12,450", sub: "Hoạt động", icon: <Box className="text-blue-500" /> },
                   { label: "Yêu cầu mở Shop", value: "15", sub: "Chờ duyệt", icon: <UserCheck className="text-green-500" /> },
                   { label: "Vi phạm / Khiếu nại", value: "03", sub: "Cần xử lý", icon: <AlertCircle className="text-red-500" /> }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white border-2 border-black rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                         <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-black/5">{stat.icon}</div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{stat.sub}</span>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                         <p className="text-3xl font-black tracking-tighter mt-1">{stat.value}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                       <BarChart3 className="text-primary" /> Tăng trưởng hệ thống
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                       {[30, 50, 70, 45, 90, 100, 80, 60, 85, 40, 75, 95].map((h, i) => (
                         <div key={i} className="flex-grow bg-black rounded-t-lg hover:bg-primary transition-all group cursor-pointer relative" style={{ height: `${h}%` }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all">Th{i+1}</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Vendor mới chờ duyệt</h3>
                    <div className="space-y-6">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">V{i}</div>
                            <div className="flex-grow min-w-0">
                               <p className="text-xs font-black uppercase truncate">Shop Thời Trang {i}</p>
                               <p className="text-[9px] font-bold text-gray-400 mt-0.5">Yêu cầu: 2 giờ trước</p>
                            </div>
                            <button className="p-2 border-2 border-black rounded-lg hover:bg-green-500 hover:text-white transition-all"><Check size={14}/></button>
                         </div>
                       ))}
                    </div>
                    <button className="w-full mt-6 py-4 bg-black text-white border-2 border-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">XEM TẤT CẢ YÊU CẦU</button>
                 </div>
              </div>
            </div>
          )}

          {/* TAB: QUẢN LÝ VENDOR */}
          {activeTab === "vendors" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-serif font-black uppercase">Quản lý Vendor</h2>
                 <div className="flex gap-4">
                    <button className="px-6 py-3 border-2 border-black rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-black hover:text-white transition-all">
                       <Filter size={16} /> Lọc trạng thái
                    </button>
                 </div>
              </div>

              <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b-2 border-black/5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                          <th className="px-8 py-6">Gian hàng</th>
                          <th className="px-8 py-6">Mã Vendor</th>
                          <th className="px-8 py-6">Người đại diện</th>
                          <th className="px-8 py-6">Sản phẩm</th>
                          <th className="px-8 py-6">Trạng thái</th>
                          <th className="px-8 py-6 text-right">Thao tác</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-black/5">
                       {paginatedVendors.map(vendor => (
                          <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors group">
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-gray-100 rounded-xl border border-black/5 flex items-center justify-center font-black text-primary">V{vendor.id}</div>
                                   <div>
                                      <p className="text-sm font-black uppercase">{vendor.name}</p>
                                      <p className="text-[10px] font-bold text-gray-400">{vendor.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-xs font-mono font-bold">{vendor.code}</td>
                             <td className="px-8 py-6 text-xs font-bold text-gray-600">{vendor.representative}</td>
                             <td className="px-8 py-6 text-xs font-black">{vendor.productsCount}</td>
                             <td className="px-8 py-6">
                                <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${vendor.status === 'BỊ KHÓA' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                   {vendor.status}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button className="p-2 border-2 border-black rounded-lg text-primary hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                                       <Eye size={14}/>
                                    </button>
                                    <button className={`p-2 border-2 border-black rounded-lg transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${vendor.status === 'BỊ KHÓA' ? 'text-green-600 hover:bg-green-600' : 'text-red-600 hover:bg-red-600'} hover:text-white`}>
                                       {vendor.status === 'BỊ KHÓA' ? <Check size={14}/> : <X size={14}/>}
                                    </button>
                                 </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* TAB: QUẢN LÝ SẢN PHẨM (Global Product Management) */}
          {activeTab === "products" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-serif font-black uppercase">Quản lý Sản phẩm hệ thống</h2>
                 <div className="flex gap-4">
                    <div className="relative">
                       <input type="text" placeholder="Tìm tên SP, Vendor..." className="bg-white border-2 border-black rounded-xl px-10 py-2.5 text-xs font-bold w-64" />
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 {paginatedProducts.map(product => (
                    <div key={product.id} className="bg-white border-2 border-black rounded-[1.5rem] p-6 shadow-sm hover:shadow-subtle transition-all group">
                       <div className="flex items-center gap-8">
                          <div className="w-16 h-20 bg-gray-50 rounded-xl overflow-hidden border border-black/5 shrink-0">
                             <img src={product.image} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-grow grid grid-cols-5 gap-8 items-center">
                             <div className="col-span-2">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                   <Store size={12} /> Vendor: {product.vendor}
                                </p>
                                <h4 className="text-lg font-black uppercase tracking-tight truncate">{product.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">SKU: {product.sku} | Loại: {product.category}</p>
                             </div>
                             
                             <div className="col-span-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá bán</p>
                                <p className="text-base font-black">{product.price.toLocaleString()}₫</p>
                             </div>

                             <div className="col-span-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tồn kho</p>
                                <div className="flex items-center gap-2">
                                   <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, (product.stock / 200) * 100)}%` }}></div>
                                   </div>
                                   <span className="text-xs font-black">{product.stock}</span>
                                </div>
                             </div>

                              <div className="flex items-center gap-3">
                                 <button className="p-3 border-2 border-black rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Eye size={18}/></button>
                                 <button className="p-3 border-2 border-black rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><X size={18}/></button>
                                 <button className="p-3 border-2 border-black rounded-xl text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Check size={18}/></button>
                              </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* Shared Pagination Component */}
          {['vendors', 'products'].includes(activeTab) && (
            <div className="flex justify-center items-center gap-2 pt-12">
               <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed bg-white"
               >
                  <ChevronLeft size={20} />
               </button>
               
               <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center gap-2">
                        {i > 0 && arr[i-1] !== p - 1 && <span className="font-black text-gray-400">...</span>}
                        <button 
                          onClick={() => setCurrentPage(p)}
                          className={`w-12 h-12 border-2 border-black rounded-xl font-black text-sm transition-all ${currentPage === p ? 'bg-black text-white shadow-subtle' : 'bg-white hover:bg-primary/10 active:translate-y-1'}`}
                        >
                           {p}
                        </button>
                      </div>
                    ))
                  }
               </div>

               <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 border-2 border-black rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed bg-white"
               >
                  <ChevronRight size={20} />
               </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
