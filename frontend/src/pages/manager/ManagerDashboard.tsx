import {
  ShieldCheck,
  Users,
  Box,
  BarChart3,
  Search,
  ExternalLink,
  AlertCircle,
  User,
  ShieldAlert,
  MessageSquare,
  BookOpen,
  Landmark,
  Check,
  X,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { useManagerStats } from "@/hooks/useManager";
import { getAvatarUrl } from "@/utils/format";

// Modular Tab Components
import { OverviewTab } from "./components/OverviewTab";
import { ProductTab } from "./components/ProductTab";
import { DisputeTab } from "./components/DisputeTab";
import { ReportTab } from "./components/ReportTab";
import { VendorTab } from "./components/VendorTab";
import { ManagerChatTab } from "./ManagerChatTab";
import { BlogTab } from "./components/BlogTab";
import { ReconciliationTab } from "./components/ReconciliationTab";

const ManagerDashboard = () => {
  const { user: authUser, handleLogout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Audit Log State
  const [notifications, setNotifications] = useState<string[]>([]);
  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev].slice(0, 8));
  };

  // Queries
  const { data: stats, isLoading: isStatsLoading } = useManagerStats();

  const sidebarItems = [
    {
      id: "overview",
      label: "Tổng quan Manager",
      icon: <ShieldCheck size={20} />,
    },
    { id: "moderation", label: "Quản lý Sản phẩm", icon: <Box size={20} /> },
    {
      id: "disputes",
      label: "Giải quyết khiếu nại",
      icon: <AlertCircle size={20} />,
    },
    {
      id: "reports",
      label: "Báo cáo thống kê",
      icon: <BarChart3 size={20} />,
    },
    { id: "vendors", label: "Hỗ trợ & Khóa Shop", icon: <Users size={20} /> },
    {
      id: "reconciliation",
      label: "Đối soát thanh toán Shipper",
      icon: <Landmark size={20} />,
    },
    { id: "chat", label: "Hộp thư Hỗ trợ", icon: <MessageSquare size={20} /> },
    { id: "blog", label: "Quản lý Blog", icon: <BookOpen size={20} /> },
  ];

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
              <span className="font-serif text-lg font-black tracking-tighter uppercase leading-none">
                UTEShop
              </span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                MANAGER
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id
                  ? "bg-black text-white shadow-brutal translate-x-1"
                  : "hover:bg-primary/10 text-gray-400 hover:text-black"
                }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          {(authUser?.role === "admin" || (typeof authUser?.role === 'object' && authUser?.role?.role_name === "Admin")) && (
            <Link
              to="/admin"
              className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-primary hover:bg-primary/10 transition-all mt-4 border-2 border-dashed border-primary/20"
            >
              <ExternalLink size={20} />
              Admin Dashboard
            </Link>
          )}
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
        <header className="bg-white/80 backdrop-blur-md border-b border-black/5 h-20 px-4 md:px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2 flex-grow max-w-xs md:max-w-md lg:max-w-lg">
            <div className="relative w-full my-4 hidden sm:block">
              <input
                type="text"
                placeholder="Tìm kiếm thông tin nhanh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-2 border-black rounded-xl px-12 py-3 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
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
                {authUser?.avatarUrl || authUser?.profile?.avatar_url ? (
                  <img src={getAvatarUrl(authUser.avatarUrl || authUser.profile.avatar_url)} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-4 w-64 bg-white border-2 border-black rounded-2xl shadow-brutal z-50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black overflow-hidden shrink-0 border border-black/10">
                      {authUser?.avatarUrl || authUser?.profile?.avatar_url ? (
                        <img src={getAvatarUrl(authUser.avatarUrl || authUser.profile.avatar_url)} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        authUser?.fullName?.[0]?.toUpperCase() || authUser?.profile?.full_name?.[0]?.toUpperCase() || "MN"
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-black line-clamp-1">
                        {authUser?.fullName || authUser?.profile?.full_name || "Quản trị viên"}
                      </p>
                      <p className="text-[10px] text-primary font-bold line-clamp-1">
                        {authUser?.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-black transition-all"
                    >
                      Thông tin cá nhân
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleLogout();
                      }}
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
          </div>
        </header>

        {/* Content Body */}
        <div className="p-10 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewTab
              stats={stats}
              isStatsLoading={isStatsLoading}
              notifications={notifications}
            />
          )}

          {activeTab === "moderation" && (
            <ProductTab addNotification={addNotification} />
          )}

          {activeTab === "disputes" && (
            <DisputeTab addNotification={addNotification} />
          )}

          {activeTab === "reports" && (
            <ReportTab />
          )}

          {activeTab === "vendors" && (
            <VendorTab addNotification={addNotification} />
          )}

          {activeTab === "chat" && (
            <ManagerChatTab />
          )}

          {activeTab === "blog" && (
            <BlogTab addNotification={addNotification} />
          )}

          {activeTab === "reconciliation" && (
            <ReconciliationTab
              showToast={showToast}
              showConfirm={showConfirm}
            />
          )}
        </div>
      </main>

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
