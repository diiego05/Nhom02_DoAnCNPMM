import { 
  ShieldCheck, 
  Users, 
  Box, 
  BarChart3, 
  Search, 
  Check, 
  X, 
  ExternalLink,
  Bell,
  Store,
  AlertCircle,
  User,
  Ticket,
  Megaphone,
  Lock,
  Unlock,
  RefreshCw,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Landmark
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ReconciliationTab } from '@/pages/admin/components/ReconciliationTab';
import { Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import {
  useManagerStats,
  usePendingProducts,
  useActiveProducts,
  useUpdateProductStatus,
  useDisputes,
  useResolveDispute,
  useVouchers,
  useCreateVoucher,
  useDeleteVoucher,
  useCampaigns,
  useCreateCampaign,
  useVendors,
  useUpdateVendorStatus
} from '@/hooks/useManager';

const ManagerDashboard = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [productSubTab, setProductSubTab] = useState("pending"); // "pending" | "active" | "blocked"
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Audit Log State
  const [notifications, setNotifications] = useState<string[]>([]);
  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 8));
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
     isOpen: boolean;
     message: string;
     onConfirm: () => void;
  } | null>(null);

  const showConfirm = (message: string, onConfirm: () => void) => {
     setConfirmDialog({
        isOpen: true,
        message,
        onConfirm: () => {
           onConfirm();
           setConfirmDialog(null);
        }
     });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
     setToast({ message, type });
  };

  useEffect(() => {
     if (toast) {
        const timer = setTimeout(() => {
           setToast(null);
        }, 4000);
        return () => clearTimeout(timer);
     }
  }, [toast]);

  // Lock Vendor Modal state
  const [lockModal, setLockModal] = useState<{
    show: boolean;
    vendorId: number | null;
    vendorName: string;
    reason: string;
  }>({
    show: false,
    vendorId: null,
    vendorName: "",
    reason: ""
  });

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useManagerStats();
  const { data: pendingProducts, isLoading: isPendingProductsLoading } = usePendingProducts();
  const { data: activeProducts, isLoading: isActiveProductsLoading } = useActiveProducts();
  const { data: disputes, isLoading: isDisputesLoading } = useDisputes();
  const { data: vouchers, isLoading: isVouchersLoading } = useVouchers();
  const { data: campaigns, isLoading: isCampaignsLoading } = useCampaigns();
  const { data: vendors, isLoading: isVendorsLoading } = useVendors();

  // Mutations
  const updateProductMutation = useUpdateProductStatus();
  const resolveDisputeMutation = useResolveDispute();
  const createVoucherMutation = useCreateVoucher();
  const deleteVoucherMutation = useDeleteVoucher();
  const createCampaignMutation = useCreateCampaign();
  const updateVendorMutation = useUpdateVendorStatus();

  // Form states
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discount_type: "PERCENT" as "PERCENT" | "FIXED",
    discount_value: "",
    max_discount: "",
    min_order_amount: "",
    usage_limit: "",
    start_date: "",
    end_date: ""
  });
  const [newCampaign, setNewCampaign] = useState({ title: "", type: "Flash sale", date: "" });

  // Product Actions
  const handleApproveProduct = (id: number, name: string) => {
    updateProductMutation.mutate({ id, status: "APPROVED" }, {
      onSuccess: () => addNotification(`Đã phê duyệt sản phẩm "${name}" thành công.`)
    });
  };

  const handleRejectProduct = (id: number, name: string) => {
    updateProductMutation.mutate({ id, status: "REJECTED" }, {
      onSuccess: () => addNotification(`Đã từ chối kiểm duyệt sản phẩm "${name}".`)
    });
  };

  const handleLockProduct = (id: number, name: string) => {
    updateProductMutation.mutate({ id, status: "HIDDEN" }, {
      onSuccess: () => addNotification(`Đã KHÓA/GỠ sản phẩm "${name}" khỏi sàn bán lẻ.`)
    });
  };

  const handleUnlockProduct = (id: number, name: string) => {
    updateProductMutation.mutate({ id, status: "APPROVED" }, {
      onSuccess: () => addNotification(`Đã MỞ KHÓA/KÍCH HOẠT lại sản phẩm "${name}".`)
    });
  };

  // Dispute actions
  const handleResolveDispute = (id: number, orderCode: string, action: "REFUNDED" | "REJECTED") => {
    resolveDisputeMutation.mutate({ id, status: action }, {
      onSuccess: () => {
        addNotification(action === "REFUNDED" 
          ? `Đồng ý hoàn tiền cho đơn khiếu nại ${orderCode}.`
          : `Đã bác bỏ khiếu nại của đơn ${orderCode}.`
        );
      }
    });
  };

  // Voucher / Marketing actions
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucher.code.trim()) {
      alert("Vui lòng nhập mã Voucher!");
      return;
    }
    if (!/^[A-Z0-9_-]+$/i.test(newVoucher.code)) {
      alert("Mã voucher chỉ được bao gồm chữ cái, số, gạch ngang và gạch dưới!");
      return;
    }
    if (!newVoucher.discount_value) {
      alert("Vui lòng nhập mức giảm giá!");
      return;
    }

    const dVal = Number(newVoucher.discount_value);
    if (isNaN(dVal) || dVal <= 0) {
      alert("Mức giảm giá phải lớn hơn 0!");
      return;
    }

    if (newVoucher.discount_type === "PERCENT" && dVal > 100) {
      alert("Mức giảm phần trăm không được vượt quá 100%!");
      return;
    }

    const minOrder = Number(newVoucher.min_order_amount || 0);
    if (isNaN(minOrder) || minOrder < 0) {
      alert("Đơn tối thiểu không hợp lệ!");
      return;
    }

    if (newVoucher.discount_type === "FIXED" && dVal > minOrder) {
      alert("Mức giảm tiền mặt không được lớn hơn đơn tối thiểu!");
      return;
    }

    let limit: number | null = null;
    if (newVoucher.usage_limit) {
      limit = Number(newVoucher.usage_limit);
      if (isNaN(limit) || limit <= 0) {
        alert("Giới hạn lượt dùng phải lớn hơn 0!");
        return;
      }
    }

    let maxDisc: number | null = null;
    if (newVoucher.discount_type === "PERCENT" && newVoucher.max_discount) {
      maxDisc = Number(newVoucher.max_discount);
      if (isNaN(maxDisc) || maxDisc < 0) {
        alert("Mức giảm tối đa không hợp lệ!");
        return;
      }
    }

    if (!newVoucher.start_date || !newVoucher.end_date) {
      alert("Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc!");
      return;
    }

    const sDate = new Date(newVoucher.start_date);
    const eDate = new Date(newVoucher.end_date);

    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      alert("Ngày bắt đầu hoặc kết thúc không đúng định dạng!");
      return;
    }

    if (sDate >= eDate) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }

    // Check code duplication client-side (against existing loaded vouchers)
    const existsLocally = vouchers?.some((v: any) => v.code.toUpperCase() === newVoucher.code.toUpperCase().trim());
    if (existsLocally) {
      alert("Mã giảm giá này đã tồn tại trên danh sách active của hệ thống!");
      return;
    }

    createVoucherMutation.mutate({
      code: newVoucher.code.toUpperCase().trim(),
      discount_type: newVoucher.discount_type,
      discount_value: dVal,
      max_discount: maxDisc,
      min_order_amount: minOrder,
      usage_limit: limit,
      start_date: newVoucher.start_date,
      end_date: newVoucher.end_date,
    }, {
      onSuccess: (data) => {
        addNotification(`Tạo thành công voucher sàn: ${data.code}`);
        setNewVoucher({
          code: "",
          discount_type: "PERCENT",
          discount_value: "",
          max_discount: "",
          min_order_amount: "",
          usage_limit: "",
          start_date: "",
          end_date: ""
        });
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Tạo voucher thất bại");
      }
    });
  };

  const handleDeleteVoucher = (id: number, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy/tắt voucher sàn ${code}? Hành động này sẽ dừng hiệu lực của voucher ngay lập tức.`)) {
      return;
    }
    deleteVoucherMutation.mutate(id, {
      onSuccess: () => {
        addNotification(`Đã hủy/xóa thành công voucher sàn: ${code}`);
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Hủy voucher thất bại");
      }
    });
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title) return;
    createCampaignMutation.mutate({
      title: newCampaign.title,
      type: newCampaign.type,
      date: newCampaign.date || new Date().toLocaleDateString(),
    }, {
      onSuccess: (data) => {
        addNotification(`Đã lên lịch sự kiện: ${data.name}`);
        setNewCampaign({ title: "", type: "Flash sale", date: "" });
      }
    });
  };

  // Vendor Actions with Audit Reason
  const openLockVendorModal = (id: number, name: string) => {
    setLockModal({
      show: true,
      vendorId: id,
      vendorName: name,
      reason: ""
    });
  };

  const handleConfirmLockVendor = () => {
    if (!lockModal.vendorId || !lockModal.reason.trim()) {
      alert("Vui lòng nhập lý do khóa Shop!");
      return;
    }

    updateVendorMutation.mutate({
      id: lockModal.vendorId,
      status: "BANNED",
      reason: lockModal.reason
    }, {
      onSuccess: () => {
        addNotification(`Đã KHÓA Shop "${lockModal.vendorName}" - Lý do: ${lockModal.reason}`);
        setLockModal({ show: false, vendorId: null, vendorName: "", reason: "" });
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Khóa Shop thất bại");
      }
    });
  };

  const handleUnlockVendor = (id: number, name: string) => {
    updateVendorMutation.mutate({
      id,
      status: "APPROVED",
      reason: "Manager kích hoạt lại hoạt động"
    }, {
      onSuccess: () => {
        addNotification(`Đã MỞ KHÓA quyền hoạt động cho Shop "${name}".`);
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Kích hoạt Shop thất bại");
      }
    });
  };

  const sidebarItems = [
    { id: "overview", label: "Tổng quan Manager", icon: <ShieldCheck size={20} /> },
    { id: "moderation", label: "Quản lý Sản phẩm", icon: <Box size={20} /> },
    { id: "disputes", label: "Giải quyết khiếu nại", icon: <AlertCircle size={20} /> },
    { id: "marketing", label: "Chiến dịch Marketing", icon: <Ticket size={20} /> },
    { id: "vendors", label: "Hỗ trợ & Khóa Shop", icon: <Users size={20} /> },
    { id: "reconciliation", label: "Đối soát thanh toán", icon: <Landmark size={20} /> },
  ];

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

  return (
    <div className="min-h-screen bg-[#F4F4F0] flex overflow-hidden">
      
      {/* Sidebar */}
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
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-black text-white shadow-brutal translate-x-1' : 'hover:bg-primary/10 text-gray-400 hover:text-black'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3 flex gap-2">
            <ShieldAlert size={20} className="text-amber-500 shrink-0" />
            <div className="text-[10px] font-bold text-amber-800">
              Chế độ quản lý hệ thống. Mọi thao tác phê duyệt hoặc khóa tài khoản sẽ có hiệu lực trực tiếp trong cơ sở dữ liệu.
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto">
        
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-black/5 h-20 px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
           <div className="relative w-96 my-4">
              <input 
                type="text" 
                placeholder="Tìm kiếm thông tin nhanh..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-2 border-black rounded-xl px-12 py-3 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           </div>

           <div className="flex items-center gap-6">
              {/* Notification logs dropdown */}
              <NotificationDropdown />
              
              <div className="w-[2px] h-8 bg-gray-100"></div>

              {/* User profile dropdown */}
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
                        <p className="text-xs font-black uppercase">{authUser?.fullName || "Quản trị viên"}</p>
                        <p className="text-[10px] text-primary font-bold">{authUser?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link to="/profile" className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Thông tin cá nhân</Link>
                    </div>
                  </div>
                )}
              </div>

               <Link to="/" className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                 Website <ExternalLink size={14} />
               </Link>
           </div>
        </header>

        {/* Content Body */}
        <div className="p-10 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-serif font-black tracking-tighter uppercase mb-2">Hệ thống Manager</h1>
                    <p className="text-gray-500 font-medium italic">Giám sát hoạt động của các Vendor và Sản phẩm từ Database thực tế.</p>
                  </div>
              </div>

              {/* Stats Grid */}
              {isStatsLoading ? (
                <div className="flex items-center justify-center h-32 bg-white border-2 border-black rounded-2xl">
                  <Loader2 className="animate-spin text-primary mr-2" />
                  <span className="text-sm font-bold uppercase tracking-wider">Đang tải thống kê...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {[
                     { label: "Sản phẩm chờ duyệt", value: stats?.pendingProducts ?? 0, sub: "Cần kiểm duyệt", icon: <Box className="text-primary" /> },
                     { label: "Tranh chấp & Khiếu nại", value: stats?.pendingDisputes ?? 0, sub: "Cần hòa giải", icon: <AlertCircle className="text-amber-500" /> },
                     { label: "Voucher toàn sàn", value: stats?.platformVouchers ?? 0, sub: "Đang hoạt động", icon: <Ticket className="text-green-500" /> },
                     { label: "Gian hàng bị khóa", value: stats?.bannedShops ?? 0, sub: "Vi phạm chính sách", icon: <ShieldAlert className="text-red-500" /> }
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
              )}

              {/* Live Activity Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
                       <BarChart3 className="text-primary" /> Thống kê hoạt động
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                       {[30, 55, 75, 40, 95, 80, 60, 45, 85, 30, 70, 90].map((h, i) => (
                         <div key={i} className="flex-grow bg-black rounded-t-lg hover:bg-primary transition-all group cursor-pointer relative" style={{ height: `${h}%` }}>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all">Tuần {i+1}</div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Nhật ký xử lý nhanh</h3>
                    <div className="space-y-4 flex-grow overflow-y-auto max-h-72">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                          <RefreshCw size={24} className="animate-spin mb-2" />
                          <p className="text-xs font-bold">Chờ các hành động vận hành...</p>
                        </div>
                      ) : (
                        notifications.map((msg, i) => (
                          <div key={i} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                            <p className="text-xs font-bold text-gray-700 leading-tight">{msg}</p>
                          </div>
                        ))
                      )}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === "moderation" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                 <div>
                   <h2 className="text-3xl font-serif font-black uppercase">Quản lý & Kiểm duyệt sản phẩm</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Duyệt sản phẩm mới hoặc quản lý / gỡ bỏ các sản phẩm vi phạm chính sách</p>
                 </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-2">
                {[
                  { id: "pending", label: `Chờ phê duyệt (${pendingProducts?.length || 0})` },
                  { id: "active", label: `Đang hoạt động (${activeProducts?.filter((p: any) => p.approval_status === "APPROVED").length || 0})` },
                  { id: "blocked", label: `Đang bị khóa (${activeProducts?.filter((p: any) => p.approval_status === "HIDDEN" || p.approval_status === "REJECTED").length || 0})` }
                ].map(subTab => (
                  <button
                    key={subTab.id}
                    onClick={() => setProductSubTab(subTab.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-black transition-all ${productSubTab === subTab.id ? 'bg-black text-white shadow-subtle' : 'bg-white text-black hover:bg-gray-100'}`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* Loader */}
              {(isPendingProductsLoading || isActiveProductsLoading) ? (
                <div className="flex justify-center py-20 bg-white border-2 border-black rounded-[2.5rem]">
                  <Loader2 className="animate-spin text-primary" size={36} />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  
                  {/* SUBTAB 1: PENDING FOR APPROVAL */}
                  {productSubTab === "pending" && (
                    <>
                      {!pendingProducts || pendingProducts.length === 0 ? (
                        <div className="bg-white border-2 border-black rounded-[2.5rem] p-20 flex flex-col items-center text-center">
                          <CheckCircle2 className="text-green-500 mb-4" size={48} />
                          <h3 className="text-xl font-black uppercase">Hoàn tất kiểm duyệt</h3>
                          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Hiện tại không còn sản phẩm nào đang chờ phê duyệt.</p>
                        </div>
                      ) : (
                        pendingProducts
                          .filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.shop?.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((product: any) => {
                            const primaryImg = product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url || "/placeholder.jpg";
                            return (
                              <div key={product.id} className="bg-white border-2 border-black rounded-[1.5rem] p-6 shadow-sm hover:shadow-subtle transition-all">
                                <div className="flex items-center gap-8">
                                  <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden border border-black/5 shrink-0">
                                     <img src={primaryImg.startsWith("http") ? primaryImg : `${API_URL}${primaryImg}`} className="w-full h-full object-cover" alt={product.name}/>
                                  </div>
                                  
                                  <div className="flex-grow grid grid-cols-5 gap-8 items-center">
                                     <div className="col-span-2">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                           <Store size={12} /> Gian hàng: {product.shop?.shop_name}
                                        </p>
                                        <h4 className="text-lg font-black uppercase tracking-tight truncate">{product.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">SKU: {product.slug || product.id} | Danh mục ID: {product.category_id}</p>
                                     </div>
                                     
                                     <div className="col-span-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá dự kiến</p>
                                        <p className="text-base font-black">{Number(product.price).toLocaleString()}₫</p>
                                     </div>

                                     <div className="col-span-2 flex items-center justify-end gap-3">
                                        <button 
                                          onClick={() => handleRejectProduct(product.id, product.name)}
                                          disabled={updateProductMutation.isPending}
                                          className="px-4 py-2.5 border-2 border-black rounded-xl text-red-600 bg-white font-black text-[10px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 shadow-subtle active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                                        >
                                          <X size={14}/> Từ chối
                                        </button>
                                        <button 
                                          onClick={() => handleApproveProduct(product.id, product.name)}
                                          disabled={updateProductMutation.isPending}
                                          className="px-4 py-2.5 border-2 border-black rounded-xl text-white bg-black font-black text-[10px] uppercase tracking-wider hover:bg-green-500 hover:text-white transition-all flex items-center gap-1.5 shadow-subtle active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                                        >
                                          <Check size={14}/> Phê duyệt
                                        </button>
                                     </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </>
                  )}

                  {/* SUBTAB 2: ACTIVE PRODUCTS (Allows delisting/locking) */}
                  {productSubTab === "active" && (
                    <>
                      {activeProducts?.filter((p: any) => p.approval_status === "APPROVED").length === 0 ? (
                        <div className="bg-white border-2 border-black rounded-[2.5rem] p-16 flex flex-col items-center text-center">
                          <AlertTriangle className="text-amber-500 mb-4" size={48} />
                          <h3 className="text-xl font-black uppercase">Không có sản phẩm nào</h3>
                          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Hiện tại không có sản phẩm nào đang hoạt động trên sàn.</p>
                        </div>
                      ) : (
                        activeProducts
                          ?.filter((p: any) => p.approval_status === "APPROVED")
                          .filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.shop?.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((product: any) => {
                            const primaryImg = product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url || "/placeholder.jpg";
                            return (
                              <div key={product.id} className="bg-white border-2 border-black rounded-[1.5rem] p-6 shadow-sm hover:shadow-subtle transition-all">
                                <div className="flex items-center gap-8">
                                  <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden border border-black/5 shrink-0">
                                     <img src={primaryImg.startsWith("http") ? primaryImg : `${API_URL}${primaryImg}`} className="w-full h-full object-cover" alt={product.name}/>
                                  </div>
                                  
                                  <div className="flex-grow grid grid-cols-5 gap-8 items-center">
                                     <div className="col-span-2">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                           <Store size={12} /> Gian hàng: {product.shop?.shop_name}
                                        </p>
                                        <h4 className="text-lg font-black uppercase tracking-tight truncate">{product.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">SKU: {product.slug || product.id} | Trạng thái: Đang bán</p>
                                     </div>
                                     
                                     <div className="col-span-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá bán</p>
                                        <p className="text-base font-black">{Number(product.price).toLocaleString()}₫</p>
                                     </div>

                                     <div className="col-span-2 flex items-center justify-end">
                                        <button 
                                          onClick={() => handleLockProduct(product.id, product.name)}
                                          disabled={updateProductMutation.isPending}
                                          className="px-5 py-2.5 border-2 border-black rounded-xl text-red-600 bg-white font-black text-[10px] uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5 shadow-subtle active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                                        >
                                          <Lock size={14}/> Khóa / Gỡ sản phẩm
                                        </button>
                                     </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </>
                  )}

                  {/* SUBTAB 3: BLOCKED PRODUCTS */}
                  {productSubTab === "blocked" && (
                    <>
                      {activeProducts?.filter((p: any) => p.approval_status === "HIDDEN" || p.approval_status === "REJECTED").length === 0 ? (
                        <div className="bg-white border-2 border-black rounded-[2.5rem] p-16 flex flex-col items-center text-center">
                          <CheckCircle2 className="text-green-500 mb-4" size={48} />
                          <h3 className="text-xl font-black uppercase">Không có sản phẩm bị khóa</h3>
                          <p className="text-xs text-gray-500 font-bold mt-1 uppercase">Hệ thống hiện tại không có sản phẩm bị khóa hoặc bị từ chối.</p>
                        </div>
                      ) : (
                        activeProducts
                          ?.filter((p: any) => p.approval_status === "HIDDEN" || p.approval_status === "REJECTED")
                          .filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.shop?.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((product: any) => {
                            const primaryImg = product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url || "/placeholder.jpg";
                            return (
                              <div key={product.id} className="bg-white border-2 border-black rounded-[1.5rem] p-6 shadow-sm hover:shadow-subtle transition-all">
                                <div className="flex items-center gap-8">
                                  <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden border border-black/5 shrink-0">
                                     <img src={primaryImg.startsWith("http") ? primaryImg : `${API_URL}${primaryImg}`} className="w-full h-full object-cover" alt={product.name}/>
                                  </div>
                                  
                                  <div className="flex-grow grid grid-cols-5 gap-8 items-center">
                                     <div className="col-span-2">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                           <Store size={12} /> Gian hàng: {product.shop?.shop_name}
                                        </p>
                                        <h4 className="text-lg font-black uppercase tracking-tight truncate text-gray-400">{product.name}</h4>
                                        <p className="text-[10px] font-bold text-red-500 mt-1 uppercase">Trạng thái: BỊ KHÓA ({product.approval_status})</p>
                                     </div>
                                     
                                     <div className="col-span-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá cũ</p>
                                        <p className="text-base font-bold text-gray-400">{Number(product.price).toLocaleString()}₫</p>
                                     </div>

                                     <div className="col-span-2 flex items-center justify-end">
                                        <button 
                                          onClick={() => handleUnlockProduct(product.id, product.name)}
                                          disabled={updateProductMutation.isPending}
                                          className="px-5 py-2.5 border-2 border-black rounded-xl text-green-600 bg-white font-black text-[10px] uppercase tracking-wider hover:bg-green-600 hover:text-white transition-all flex items-center gap-1.5 shadow-subtle active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                                        >
                                          <Unlock size={14}/> Mở khóa sản phẩm
                                        </button>
                                     </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISPUTE RESOLUTION */}
          {activeTab === "disputes" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <div>
                   <h2 className="text-3xl font-serif font-black uppercase">Xử lý tranh chấp & khiếu nại</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Giải quyết yêu cầu hoàn tiền hoặc trả hàng từ Database</p>
                 </div>
              </div>

              {isDisputesLoading ? (
                <div className="flex justify-center py-20 bg-white border-2 border-black rounded-[2.5rem]">
                  <Loader2 className="animate-spin text-primary" size={36} />
                </div>
              ) : (
                <div className="bg-white border-2 border-black rounded-[2rem] overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b-2 border-black/5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                            <th className="px-8 py-6">Mã đơn</th>
                            <th className="px-8 py-6">Khách hàng</th>
                            <th className="px-8 py-6">Vendor</th>
                            <th className="px-8 py-6">Lý do khiếu nại</th>
                            <th className="px-8 py-6">Số tiền</th>
                            <th className="px-8 py-6 text-right">Quyết định giải quyết</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black/5">
                         {!disputes || disputes.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-8 py-10 text-center text-xs font-bold text-gray-400 italic">Không có yêu cầu tranh chấp khiếu nại nào.</td>
                            </tr>
                         ) : (
                            disputes
                              .filter((d: any) => d.shopOrder?.shop_order_code.toLowerCase().includes(searchTerm.toLowerCase()) || d.reason.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map((dispute: any) => (
                                <tr key={dispute.id} className="hover:bg-gray-50/50 transition-colors">
                                   <td className="px-8 py-6">
                                      <span className="text-xs font-mono font-black block">{dispute.shopOrder?.shop_order_code || dispute.shop_order_id}</span>
                                      <span className="text-[10px] text-gray-400 block mt-0.5">{dispute.created_at ? new Date(dispute.created_at).toLocaleDateString() : ""}</span>
                                   </td>
                                   <td className="px-8 py-6 text-xs font-bold text-gray-600">
                                      {dispute.user?.profile?.full_name || dispute.user?.email}
                                   </td>
                                   <td className="px-8 py-6 text-xs font-black">{dispute.shopOrder?.shop?.shop_name}</td>
                                   <td className="px-8 py-6 text-xs font-medium text-red-600 max-w-xs">{dispute.reason}</td>
                                   <td className="px-8 py-6 text-xs font-black">{Number(dispute.shopOrder?.final_amount || 0).toLocaleString()}₫</td>
                                   <td className="px-8 py-6 text-right">
                                      {dispute.status === "PENDING" ? (
                                        <div className="flex justify-end gap-2">
                                           <button 
                                             onClick={() => handleResolveDispute(dispute.id, dispute.shopOrder?.shop_order_code, "REJECTED")}
                                             disabled={resolveDisputeMutation.isPending}
                                             className="px-3 py-1.5 border-2 border-black rounded-lg text-xs font-black text-gray-500 hover:bg-gray-100 hover:text-black transition-all disabled:opacity-50"
                                           >
                                             Bác bỏ
                                           </button>
                                           <button 
                                             onClick={() => handleResolveDispute(dispute.id, dispute.shopOrder?.shop_order_code, "REFUNDED")}
                                             disabled={resolveDisputeMutation.isPending}
                                             className="px-3 py-1.5 border-2 border-black rounded-lg text-xs font-black bg-primary text-white hover:bg-black hover:text-white transition-all shadow-subtle active:translate-y-0.5 disabled:opacity-50"
                                           >
                                             Hoàn tiền
                                           </button>
                                        </div>
                                      ) : (
                                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${dispute.status === 'RESOLVED_BY_ADMIN' || dispute.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                           {dispute.status === 'RESOLVED_BY_ADMIN' || dispute.status === 'COMPLETED' ? 'Đã hoàn tiền' : 'Đã bác bỏ'}
                                        </span>
                                      )}
                                   </td>
                                </tr>
                              ))
                         )}
                      </tbody>
                   </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MARKETING CAMPAIGNS & VOUCHERS */}
          {activeTab === "marketing" && (
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                 <div>
                   <h2 className="text-3xl font-serif font-black uppercase">Chiến dịch Marketing toàn sàn</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Thiết lập vouchers toàn sàn và theo dõi chiến dịch hoạt động</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 
                 {/* Voucher Form & List */}
                 <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm flex flex-col gap-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 border-b border-gray-100 pb-4">
                      <Ticket className="text-primary" /> Tạo mã giảm giá sàn
                    </h3>
                    
                    <form onSubmit={handleCreateVoucher} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Mã Voucher</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: VOUCHER100K" 
                            value={newVoucher.code}
                            onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Loại giảm giá</label>
                          <select 
                            value={newVoucher.discount_type}
                            onChange={(e) => setNewVoucher({ ...newVoucher, discount_type: e.target.value as "PERCENT" | "FIXED" })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold focus:outline-none"
                          >
                            <option value="PERCENT">Giảm theo %</option>
                            <option value="FIXED">Số tiền cố định (VNĐ)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">
                            {newVoucher.discount_type === "PERCENT" ? "Mức giảm (%)" : "Mức giảm (VNĐ)"}
                          </label>
                          <input 
                            type="number" 
                            placeholder={newVoucher.discount_type === "PERCENT" ? "Ví dụ: 10" : "Ví dụ: 50000"} 
                            value={newVoucher.discount_value}
                            onChange={(e) => setNewVoucher({ ...newVoucher, discount_value: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Giảm tối đa (VNĐ)</label>
                          <input 
                            type="number" 
                            placeholder="Chỉ dùng cho % (Ví dụ: 50000)" 
                            disabled={newVoucher.discount_type !== "PERCENT"}
                            value={newVoucher.max_discount}
                            onChange={(e) => setNewVoucher({ ...newVoucher, max_discount: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold disabled:opacity-50 disabled:bg-gray-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Đơn tối thiểu (VNĐ)</label>
                          <input 
                            type="number" 
                            placeholder="Ví dụ: 100000" 
                            value={newVoucher.min_order_amount}
                            onChange={(e) => setNewVoucher({ ...newVoucher, min_order_amount: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Lượt dùng tối đa</label>
                          <input 
                            type="number" 
                            placeholder="Ví dụ: 100 (Để trống = ∞)" 
                            value={newVoucher.usage_limit}
                            onChange={(e) => setNewVoucher({ ...newVoucher, usage_limit: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Ngày bắt đầu</label>
                          <input 
                            type="datetime-local" 
                            value={newVoucher.start_date}
                            onChange={(e) => setNewVoucher({ ...newVoucher, start_date: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Ngày kết thúc</label>
                          <input 
                            type="datetime-local" 
                            value={newVoucher.end_date}
                            onChange={(e) => setNewVoucher({ ...newVoucher, end_date: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={createVoucherMutation.isPending}
                        className="w-full py-4 bg-black text-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-subtle active:translate-y-1 disabled:opacity-50"
                      >
                        {createVoucherMutation.isPending ? "ĐANG PHÁT HÀNH..." : "PHÁT HÀNH VOUCHER TOÀN SÀN"}
                      </button>
                    </form>

                    <div className="pt-6 border-t border-dashed border-gray-200 flex-grow">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Vouchers toàn sàn từ Database</h4>
                      {isVouchersLoading ? (
                        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" size={20} /></div>
                      ) : (
                        <div className="space-y-3 max-h-[30rem] overflow-y-auto pr-1">
                           {!vouchers || vouchers.length === 0 ? (
                             <p className="text-xs text-gray-400 italic font-bold">Chưa có voucher toàn sàn nào được tạo.</p>
                           ) : (
                             vouchers.map((v: any) => {
                               // Evaluate status dynamically
                               const now = new Date();
                               const start = new Date(v.start_date);
                               const end = new Date(v.end_date);
                               const isLimitReached = v.usage_limit && v.used_count >= v.usage_limit;
                               
                               let statusLabel = "ĐANG HOẠT ĐỘNG";
                               let statusClass = "bg-green-50 text-green-600 border-green-100";
                               
                               if (now < start) {
                                 statusLabel = "CHƯA DIỄN RA";
                                 statusClass = "bg-blue-50 text-blue-600 border-blue-100";
                               } else if (now > end) {
                                 statusLabel = "HẾT HẠN";
                                 statusClass = "bg-red-50 text-red-500 border-red-100";
                               } else if (isLimitReached) {
                                 statusLabel = "HẾT LƯỢT";
                                 statusClass = "bg-amber-50 text-amber-600 border-amber-100";
                               }

                               return (
                                 <div key={v.id} className="flex justify-between items-center bg-gray-50 border-2 border-black/5 rounded-xl p-4 gap-4">
                                   <div className="flex-grow">
                                     <div className="flex items-center gap-2">
                                       <span className="text-xs font-black uppercase">{v.code}</span>
                                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${statusClass}`}>
                                         {statusLabel}
                                       </span>
                                     </div>
                                     <div className="text-[10px] font-bold text-gray-400 mt-1 space-y-0.5">
                                       <p>
                                         Giảm: <span className="text-black font-extrabold">{v.discount_type === "PERCENT" ? `${v.discount_value}%` : `${Number(v.discount_value).toLocaleString()}₫`}</span>
                                         {v.discount_type === "PERCENT" && v.max_discount && ` (Tối đa ${Number(v.max_discount).toLocaleString()}₫)`}
                                         {" | "} Đơn tối thiểu: <span className="text-black font-extrabold">{Number(v.min_order_amount).toLocaleString()}₫</span>
                                       </p>
                                       <p>
                                         Lượt dùng: <span className="text-black font-extrabold">{v.used_count} / {v.usage_limit || "∞"}</span>
                                       </p>
                                       <p className="text-[9px] italic text-gray-400">
                                         Hạn dùng: {start.toLocaleString()} - {end.toLocaleString()}
                                       </p>
                                     </div>
                                   </div>
                                   <button
                                     onClick={() => handleDeleteVoucher(v.id, v.code)}
                                     disabled={deleteVoucherMutation.isPending}
                                     className="p-2 border-2 border-black rounded-xl text-red-600 bg-white hover:bg-red-500 hover:text-white transition-all shadow-subtle active:translate-y-0.5 disabled:opacity-50"
                                     title="Hủy/Xóa Voucher"
                                   >
                                     <X size={14} />
                                   </button>
                                 </div>
                               );
                             })
                           )}
                        </div>
                      )}
                    </div>
                 </div>

                 {/* Campaign Form & List */}
                 <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-sm flex flex-col gap-6">
                    <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 border-b border-gray-100 pb-4">
                      <Megaphone className="text-primary" /> Thiết lập chiến dịch Flash Sale
                    </h3>
                    <form onSubmit={handleCreateCampaign} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Tên chiến dịch / Sự kiện</label>
                        <input 
                          type="text" 
                          placeholder="Ví dụ: Siêu Flash Sale 7/7" 
                          value={newCampaign.title}
                          onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Phân loại</label>
                          <select 
                            value={newCampaign.type}
                            onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold focus:outline-none"
                          >
                            <option value="Flash sale">Flash Sale</option>
                            <option value="Banner Marketing">Banner Marketing</option>
                            <option value="Sự kiện toàn sàn">Sự kiện toàn sàn</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider block mb-2">Thời gian diễn ra</label>
                          <input 
                            type="text" 
                            placeholder="Ví dụ: 07/07/2026" 
                            value={newCampaign.date}
                            onChange={(e) => setNewCampaign({ ...newCampaign, date: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={createCampaignMutation.isPending}
                        className="w-full py-4 bg-black text-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-subtle active:translate-y-1 disabled:opacity-50"
                      >
                        {createCampaignMutation.isPending ? "ĐANG THIẾT LẬP..." : "KÍCH HOẠT CHIẾN DỊCH HỆ THỐNG"}
                      </button>
                    </form>

                    <div className="pt-6 border-t border-dashed border-gray-200 flex-grow">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Danh sách chiến dịch</h4>
                      {isCampaignsLoading ? (
                        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-primary" size={20} /></div>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                           {!campaigns || campaigns.length === 0 ? (
                             <p className="text-xs text-gray-400 italic font-bold">Chưa có chiến dịch nào được tạo.</p>
                           ) : (
                             campaigns.map((c: any) => (
                               <div key={c.id} className="flex justify-between items-center bg-gray-50 border-2 border-black/5 rounded-xl p-4">
                                 <div>
                                   <p className="text-xs font-black uppercase">{c.name}</p>
                                   <p className="text-[10px] font-bold text-gray-400 mt-0.5">{c.description} | Trạng thái: {c.status}</p>
                                 </div>
                                 <span className="text-[9px] font-black uppercase px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg">ĐANG LÊN LỊCH</span>
                               </div>
                             ))
                           )}
                        </div>
                      )}
                    </div>
                 </div>

              </div>
            </div>
          )}

          {/* TAB 5: VENDORS SECURITY (Lock/Unlock) */}
          {activeTab === "vendors" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                 <div>
                   <h2 className="text-3xl font-serif font-black uppercase">Quản lý & Hỗ trợ (Khóa Shop)</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Giám sát trạng thái của các gian hàng bán trên sàn</p>
                 </div>
              </div>

              {isVendorsLoading ? (
                <div className="flex justify-center py-20 bg-white border-2 border-black rounded-[2.5rem]">
                  <Loader2 className="animate-spin text-primary" size={36} />
                </div>
              ) : (
                <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="border-b-2 border-black/5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                            <th className="px-8 py-6">Tên gian hàng (Shop Name)</th>
                            <th className="px-8 py-6">Người đại diện (Email/Phone)</th>
                            <th className="px-8 py-6">Độ uy tín</th>
                            <th className="px-8 py-6">Trạng thái hoạt động</th>
                            <th className="px-8 py-6 text-right">Khóa / Kích hoạt</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-black/5">
                         {!vendors || vendors.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-8 py-10 text-center text-xs font-bold text-gray-400 italic">Không tìm thấy gian hàng nào.</td>
                            </tr>
                         ) : (
                            vendors
                              .filter((v: any) => v.shop_name.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map((vendor: any) => (
                                <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="w-12 h-12 bg-gray-100 rounded-xl border border-black/5 flex items-center justify-center font-black text-primary">V{vendor.id}</div>
                                         <div>
                                            <p className="text-sm font-black uppercase">{vendor.shop_name}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6 text-xs font-bold text-gray-600">
                                      <p>{vendor.vendor?.profile?.full_name || "N/A"}</p>
                                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{vendor.vendor?.email} | {vendor.vendor?.phone}</p>
                                   </td>
                                   <td className="px-8 py-6 text-xs font-bold text-amber-500">{vendor.rating} ★</td>
                                   <td className="px-8 py-6">
                                      <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${vendor.status === 'BANNED' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                         {vendor.status === 'BANNED' ? 'Bị khóa' : 'Đang hoạt động'}
                                      </span>
                                   </td>
                                   <td className="px-8 py-6 text-right">
                                      {vendor.status === 'BANNED' ? (
                                        <button 
                                          onClick={() => handleUnlockVendor(vendor.id, vendor.shop_name)}
                                          disabled={updateVendorMutation.isPending}
                                          className="px-4 py-2 border-2 border-black rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto shadow-subtle active:translate-y-0.5 disabled:opacity-50 text-green-600 bg-white hover:bg-green-600 hover:text-white"
                                        >
                                          <Unlock size={14}/> Mở khóa
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => openLockVendorModal(vendor.id, vendor.shop_name)}
                                          disabled={updateVendorMutation.isPending}
                                          className="px-4 py-2 border-2 border-black rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto shadow-subtle active:translate-y-0.5 disabled:opacity-50 text-red-600 bg-white hover:bg-red-600 hover:text-white"
                                        >
                                          <Lock size={14}/> Khóa Shop
                                        </button>
                                      )}
                                   </td>
                                </tr>
                              ))
                         )}
                      </tbody>
                   </table>
                </div>
              )}
            </div>
           )}

          {activeTab === "reconciliation" && (
            <ReconciliationTab showToast={showToast} showConfirm={showConfirm} />
          )}
        </div>
      </main>

      {/* Lock Vendor Audit Reason Modal */}
      {lockModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-black rounded-[2rem] p-8 max-w-md w-full shadow-brutal flex flex-col gap-6 transform animate-in slide-in-from-bottom-8 duration-300">
             <div className="flex items-center gap-3 text-red-600">
               <AlertTriangle size={32} />
               <h3 className="text-xl font-serif font-black uppercase tracking-tight">Yêu cầu khóa gian hàng</h3>
             </div>
             
             <div className="text-sm font-bold text-gray-600 leading-relaxed">
               Bạn đang chuẩn bị khóa gian hàng <strong className="text-black uppercase">"{lockModal.vendorName}"</strong>. Hành động này sẽ tạm ngừng quyền bán lẻ và ẩn mọi sản phẩm thuộc gian hàng này.
             </div>

             <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lý do khóa Shop (Bắt buộc để lưu vết Audit Log)</label>
               <textarea 
                 rows={3}
                 placeholder="Ví dụ: Bán hàng giả nhãn hiệu, lừa đảo giao dịch khách hàng..."
                 value={lockModal.reason}
                 onChange={(e) => setLockModal({ ...lockModal, reason: e.target.value })}
                 className="bg-gray-50 border-2 border-black rounded-xl p-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
               />
             </div>

             <div className="flex gap-3 justify-end pt-2">
               <button 
                 onClick={() => setLockModal({ show: false, vendorId: null, vendorName: "", reason: "" })}
                 className="px-5 py-3 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
               >
                 Hủy bỏ
               </button>
               <button 
                 onClick={handleConfirmLockVendor}
                 className="px-5 py-3 bg-red-600 text-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors shadow-subtle active:translate-y-0.5"
               >
                 Xác nhận khóa
               </button>
             </div>
          </div>
        </div>
      )}

      {toast && (
         <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 font-black text-sm ${toast.type === 'success' ? 'bg-[#A3E635]' : toast.type === 'error' ? 'bg-[#F87171]' : 'bg-[#60A5FA]'
               }`}>
               {toast.type === 'success' && <Check className="w-5 h-5 stroke-[3]" />}
               {toast.type === 'error' && <X className="w-5 h-5 stroke-[3]" />}
               {toast.type === 'info' && <Bell className="w-5 h-5 stroke-[3]" />}
               <span className="text-black uppercase tracking-wider">{toast.message}</span>
               <button onClick={() => setToast(null)} className="ml-2 hover:bg-black/10 p-1 rounded transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
               </button>
            </div>
         </div>
      )}
      {confirmDialog && (
         <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setConfirmDialog(null)}>
            <div className="bg-white border-[3px] border-black rounded-[2rem] p-8 max-w-sm w-full shadow-brutal text-center" onClick={e => e.stopPropagation()}>
               <h3 className="text-lg font-black uppercase tracking-tighter mb-4 text-black">Xác nhận</h3>
               <p className="text-sm font-bold text-gray-700 mb-6">{confirmDialog.message}</p>
               <div className="flex gap-4 justify-center">
                  <button
                     onClick={confirmDialog.onConfirm}
                     className="px-6 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-all shadow-subtle active:translate-y-[2px]"
                  >
                     Đồng ý
                  </button>
                  <button
                     onClick={() => setConfirmDialog(null)}
                     className="px-6 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-white hover:bg-gray-50 transition-all text-black"
                  >
                     Hủy
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default ManagerDashboard;
