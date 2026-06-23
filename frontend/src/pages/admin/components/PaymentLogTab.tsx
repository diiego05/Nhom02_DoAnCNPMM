import React, { useState, useEffect, useCallback } from 'react';
import {
   RefreshCw,
   Loader2,
   Database,
   CheckCircle2,
   XCircle,
   Clock,
   Search,
   CreditCard,
   RotateCcw,
} from 'lucide-react';
import { adminService } from '@/services/adminService';

interface PaymentLogTabProps {
   showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
   showConfirm: (message: string, onConfirm: () => void) => void;
}

export const PaymentLogTab = ({ showToast, showConfirm }: PaymentLogTabProps) => {
   const [logs, setLogs] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);

   // Filters & Pagination
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [gatewayFilter, setGatewayFilter] = useState("");
   const [statusFilter, setStatusFilter] = useState("");
   const [searchQuery, setSearchQuery] = useState("");
   const [fromDate, setFromDate] = useState("");
   const [toDate, setToDate] = useState("");

   const fetchLogs = useCallback(async () => {
      setLoading(true);
      try {
         const filters = {
            gateway_name: gatewayFilter || undefined,
            status: statusFilter || undefined,
            search: searchQuery || undefined,
            from_date: fromDate || undefined,
            to_date: toDate || undefined,
         };
         const res = await adminService.getPaymentLogs(page, 20, filters);
         setLogs(res.data?.logs || []);
         setTotalPages(res.data?.totalPages || 1);
      } catch (e: any) {
         console.error(e);
         showToast(e.response?.data?.message || "Lỗi tải lịch sử thanh toán", "error");
      } finally {
         setLoading(false);
      }
   }, [page, gatewayFilter, statusFilter, searchQuery, fromDate, toDate]);

   useEffect(() => { fetchLogs(); }, [fetchLogs]);

   const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));

   const getStatusDisplay = (status: string) => {
      switch (status) {
         case "PAID":
            return { label: "Đã thanh toán", color: "bg-green-100 text-green-700", icon: <CheckCircle2 size={12} /> };
         case "UNPAID":
            return { label: "Chưa thanh toán", color: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> };
         case "FAILED":
            return { label: "Thất bại/Hủy", color: "bg-red-100 text-red-600", icon: <XCircle size={12} /> };
         case "REFUNDED":
            return { label: "Hoàn tiền", color: "bg-blue-100 text-blue-700", icon: <RotateCcw size={12} /> };
         default:
            return { label: status, color: "bg-gray-100 text-gray-700", icon: <Clock size={12} /> };
      }
   };

   return (
      <div className="space-y-8">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            <div>
               <h1 className="text-3xl font-serif font-black tracking-tighter uppercase">Lịch sử thanh toán</h1>
               <p className="text-gray-400 font-medium text-sm mt-1 italic">Theo dõi trạng thái giao dịch của khách hàng theo đơn hàng</p>
            </div>
            <button onClick={fetchLogs} className="p-3 border-2 border-black rounded-xl hover:bg-gray-50 transition-all active:translate-y-1">
               <RefreshCw size={18} />
            </button>
         </div>

         {/* Filters */}
         <div className="bg-white border-2 border-black rounded-[2rem] p-6 shadow-sm flex flex-wrap gap-4 items-end">
            <div className="flex-grow min-w-[200px]">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Tìm kiếm (Mã ĐH, Mã GD)</label>
               <div className="relative">
                  <input 
                     type="text" 
                     placeholder="Ví dụ: ORD-100234..." 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && fetchLogs()}
                     className="w-full border-2 border-black rounded-xl pl-10 pr-4 py-2.5 font-bold text-sm text-black"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               </div>
            </div>
            <div className="flex-grow min-w-[150px]">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Phương thức</label>
               <select value={gatewayFilter} onChange={e => { setGatewayFilter(e.target.value); setPage(1); }} className="w-full border-2 border-black rounded-xl px-4 py-2.5 font-bold text-sm text-black">
                  <option value="">Tất cả</option>
                  <option value="VNPAY">VNPAY</option>
                  <option value="MOMO">MoMo</option>
                  <option value="ZALOPAY">ZaloPay</option>
                  <option value="COD">Thanh toán khi nhận hàng (COD)</option>
               </select>
            </div>
            <div className="flex-grow min-w-[150px]">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Trạng thái</label>
               <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="w-full border-2 border-black rounded-xl px-4 py-2.5 font-bold text-sm text-black">
                  <option value="">Tất cả</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="UNPAID">Chưa thanh toán</option>
                  <option value="FAILED">Thất bại / Hủy</option>
                  <option value="REFUNDED">Hoàn tiền</option>
               </select>
            </div>
            <div className="flex-grow min-w-[130px]">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Từ ngày</label>
               <input 
                  type="date" 
                  value={fromDate} 
                  onChange={e => { setFromDate(e.target.value); setPage(1); }} 
                  className="w-full border-2 border-black rounded-xl px-4 py-2.5 font-bold text-sm text-black" 
               />
            </div>
            <div className="flex-grow min-w-[130px]">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Đến ngày</label>
               <input 
                  type="date" 
                  value={toDate} 
                  onChange={e => { setToDate(e.target.value); setPage(1); }} 
                  className="w-full border-2 border-black rounded-xl px-4 py-2.5 font-bold text-sm text-black" 
               />
            </div>
            <button 
               onClick={() => { setGatewayFilter(""); setStatusFilter(""); setSearchQuery(""); setFromDate(""); setToDate(""); setPage(1); }} 
               className="px-6 py-2.5 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all text-black shrink-0 h-[46px]"
            >
               Xóa bộ lọc
            </button>
            <button 
               onClick={fetchLogs} 
               className="px-6 py-2.5 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-red-600 transition-all shadow-subtle active:translate-y-[2px] shrink-0 h-[46px]"
            >
               Tìm kiếm
            </button>
         </div>

         {/* Data Table */}
         <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
            {loading ? (
               <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
               </div>
            ) : logs.length === 0 ? (
               <div className="text-center py-20">
                  <Database size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Không có lịch sử thanh toán nào</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b-2 border-black/5 bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                           <th className="px-6 py-5">Thời gian</th>
                           <th className="px-6 py-5">Mã đơn hàng</th>
                           <th className="px-6 py-5">Phương thức</th>
                           <th className="px-6 py-5 text-right">Số tiền</th>
                           <th className="px-6 py-5">Mã GD đối tác</th>
                           <th className="px-6 py-5 text-center">Trạng thái</th>
                           <th className="px-6 py-5">Lời nhắn</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-black/5">
                        {logs.map((log) => {
                           const statusCfg = getStatusDisplay(log.status);
                           return (
                              <tr key={log.id} className="hover:bg-red-50/30 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                       <span className="text-xs font-bold text-black">{new Date(log.transaction_time).toLocaleDateString('vi-VN')}</span>
                                       <span className="text-[10px] font-bold text-gray-400">{new Date(log.transaction_time).toLocaleTimeString('vi-VN')}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-sm font-black hover:text-red-600 cursor-pointer underline decoration-dashed decoration-gray-300 underline-offset-4">{log.order_code}</span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                       <CreditCard size={14} className="text-gray-400" />
                                       <span className="text-[10px] font-black uppercase tracking-wider">{log.gateway_name}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-black text-red-600">{fmt(log.amount)}₫</span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                                       {log.trans_id || "N/A"}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full border-2 border-black ${statusCfg.color}`}>
                                       {statusCfg.icon} {statusCfg.label}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="max-w-[200px] overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
                                       <span className="text-xs font-bold text-gray-500 whitespace-nowrap block" title={log.message || ""}>
                                          {log.message || "-"}
                                       </span>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
               <div className="p-4 border-t-2 border-black/5 bg-gray-50 flex justify-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border-2 border-black rounded-lg text-xs font-black uppercase disabled:opacity-50">Trước</button>
                  <span className="px-4 py-2 font-bold text-sm">Trang {page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border-2 border-black rounded-lg text-xs font-black uppercase disabled:opacity-50">Sau</button>
               </div>
            )}
         </div>
      </div>
   );
};
