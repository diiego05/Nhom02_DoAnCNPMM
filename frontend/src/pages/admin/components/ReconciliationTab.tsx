import { useState, useEffect, useCallback } from 'react';
import {
   RefreshCw,
   Store,
   Loader2,
   CheckCircle2,
   Clock,
   ArrowUpRight,
   X,
   QrCode,
   Landmark,
   Wallet,
   AlertTriangle,
   Eye,
   EyeOff,
} from 'lucide-react';
import { adminService } from '@/services/adminService';

// Mapping BIN ngân hàng Việt Nam cho VietQR
const BANK_BINS: Record<string, string> = {
   "Vietcombank": "970436",
   "Techcombank": "970407",
   "MB Bank": "970422",
   "VPBank": "970432",
   "ACB": "970416",
   "BIDV": "970418",
   "VietinBank": "970415",
   "Sacombank": "970403",
   "TPBank": "970423",
   "Agribank": "970405",
   "HDBank": "970437",
   "SHB": "970443",
   "SeABank": "970448",
   "OCB": "970448",
   "MSB": "970426",
   "Eximbank": "970431",
   "LienVietPostBank": "970449",
   "VIB": "970441",
   "Nam A Bank": "970428",
   "BaoViet Bank": "970438",
};

interface ReconciliationTabProps {
   showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
   showConfirm: (message: string, onConfirm: () => void) => void;
}

export const ReconciliationTab = ({ showToast, showConfirm }: ReconciliationTabProps) => {
   const [data, setData] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [qrModal, setQrModal] = useState<any>(null);
   const [showBalance, setShowBalance] = useState<Record<number, boolean>>({});

   const toggleBalance = (shopId: number) => {
      setShowBalance(prev => ({ ...prev, [shopId]: !prev[shopId] }));
   };

   const fetchData = useCallback(async () => {
      setLoading(true);
      try {
         const res = await adminService.getReconciliation();
         setData(res.data || []);
      } catch (e: any) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => { fetchData(); }, [fetchData]);

   const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(Math.round(n || 0));

   const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
      WAITING: { label: "Chờ đối soát", color: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> },
      WITHDRAWAL_REQUESTED: { label: "Đang yêu cầu rút", color: "bg-blue-100 text-blue-700", icon: <ArrowUpRight size={12} /> },
      COMPLETED: { label: "Đã chuyển khoản", color: "bg-green-100 text-green-700", icon: <CheckCircle2 size={12} /> },
   };

   const handleApprovePayout = (shop: any) => {
      if (!shop.latest_payout) {
         showToast("Shop chưa có yêu cầu rút tiền", "error");
         return;
      }
      if (!shop.bank_name || !shop.bank_account_no) {
         showToast("Shop chưa cập nhật thông tin ngân hàng", "error");
         return;
      }

      // Tính tiền chuyển: trừ chiết khấu, phí, thuế
      const amount = shop.latest_payout.amount;
      const rates = shop.rates;
      const totalDeductionRate = (rates.commissionRate + rates.taxRate) / 100;
      const netAmount = Math.round(amount * (1 - totalDeductionRate));

      const bankBin = BANK_BINS[shop.bank_name] || "970436";
      const transferContent = `UTESHOP ${shop.shop_name} rut tien`.slice(0, 50);
      const qrUrl = `https://img.vietqr.io/image/${bankBin}-${shop.bank_account_no}-qr_only.png?amount=${netAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(shop.bank_account_name || "")}`;

      setQrModal({
         shop,
         qrUrl,
         netAmount,
         transferContent,
      });
   };

   const handleConfirmPayout = async () => {
      if (!qrModal?.shop?.latest_payout) return;
      showConfirm("Xác nhận đã quét QR chuyển tiền cho shop này?", async () => {
         try {
            await adminService.approvePayout(qrModal.shop.latest_payout.id);
            showToast("Duyệt lệnh chuyển tiền thành công!", "success");
            setQrModal(null);
            fetchData();
         } catch (e: any) {
            showToast(e.response?.data?.message || "Lỗi duyệt lệnh", "error");
         }
      });
   };

   return (
      <div className="space-y-8">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            <div>
               <h1 className="text-3xl font-serif font-black tracking-tighter uppercase">Đối soát thanh toán</h1>
               <p className="text-gray-400 font-medium text-sm mt-1 italic">Kiểm soát ví shop, duyệt lệnh rút tiền và chuyển khoản qua QR</p>
            </div>
            <button onClick={fetchData} className="p-3 border-2 border-black rounded-xl hover:bg-gray-50 transition-all active:translate-y-1">
               <RefreshCw size={18} />
            </button>
         </div>

         {/* Summary cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { label: "Tổng shop", value: data.length, icon: <Store className="text-purple-500" />, color: "purple" },
               { label: "Đang yêu cầu rút", value: data.filter(d => d.reconciliation_status === "WITHDRAWAL_REQUESTED").length, icon: <ArrowUpRight className="text-blue-500" />, color: "blue" },
               { label: "Tổng số dư khả dụng", value: `${fmt(data.reduce((s, d) => s + d.available_balance, 0))}₫`, icon: <Wallet className="text-green-500" />, color: "green" },
            ].map((s, i) => (
               <div key={i} className="bg-white border-2 border-black rounded-3xl p-8 shadow-sm flex items-center gap-6 group hover:shadow-brutal transition-all cursor-default">
                  <div className="w-14 h-14 bg-gray-50 border-2 border-black/5 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">{s.icon}</div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                     <p className="text-2xl font-black tracking-tighter">{s.value}</p>
                  </div>
               </div>
            ))}
         </div>

         {/* Bảng đối soát */}
         <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
            {loading ? (
               <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
               </div>
            ) : data.length === 0 ? (
               <div className="text-center py-20">
                  <Store size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Chưa có shop nào được duyệt</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b-2 border-black/5 bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                           <th className="px-6 py-5">Tên shop</th>
                           <th className="px-6 py-5 text-right">Doanh thu tạm giữ</th>
                           <th className="px-6 py-5 text-right">Số dư khả dụng</th>
                           <th className="px-6 py-5 text-center">Trạng thái</th>
                           <th className="px-6 py-5 text-center">Thao tác</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y-2 divide-black/5">
                        {data.map((shop: any) => {
                           const cfg = statusConfig[shop.reconciliation_status] || statusConfig.WAITING;
                           return (
                              <tr key={shop.shop_id} className="hover:bg-red-50/30 transition-colors">
                                 <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                       <div className="w-9 h-9 rounded-xl bg-gray-100 border-2 border-black/10 flex items-center justify-center overflow-hidden shrink-0">
                                          {shop.shop_logo ? <img src={shop.shop_logo} alt="" className="w-full h-full object-cover" /> : <Store size={16} className="text-gray-400" />}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black">{shop.shop_name}</p>
                                          <p className="text-[10px] text-gray-400 font-bold">{shop.vendor_name}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                       <span className="text-sm font-black text-amber-600">
                                          {showBalance[shop.shop_id] ? `${fmt(shop.pending_balance)}₫` : '******₫'}
                                       </span>
                                       <button onClick={() => toggleBalance(shop.shop_id)} className="text-gray-400 hover:text-black transition-colors" title="Ẩn/Hiện số dư">
                                          {showBalance[shop.shop_id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                       </button>
                                    </div>
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    <span className="text-sm font-black text-green-600">
                                       {showBalance[shop.shop_id] ? `${fmt(shop.available_balance)}₫` : '******₫'}
                                    </span>
                                 </td>
                                 <td className="px-6 py-5 text-center">
                                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-3 py-1.5 rounded-full border-2 border-black ${cfg.color}`}>
                                       {cfg.icon} {cfg.label}
                                    </span>
                                 </td>
                                 <td className="px-6 py-5 text-center">
                                    {shop.reconciliation_status === "WITHDRAWAL_REQUESTED" && shop.latest_payout ? (
                                       <button
                                          onClick={() => handleApprovePayout(shop)}
                                          className="px-4 py-2 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest bg-green-500 text-white hover:bg-green-600 transition-all shadow-subtle active:translate-y-[2px] flex items-center gap-2 mx-auto"
                                       >
                                          <QrCode size={14} /> Duyệt chuyển tiền
                                       </button>
                                    ) : shop.reconciliation_status === "COMPLETED" ? (
                                       <span className="text-[10px] font-black text-green-600 uppercase">✓ Đã xong</span>
                                    ) : (
                                       <span className="text-[10px] font-bold text-gray-300 uppercase">Chờ shop rút</span>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         {/* QR Modal */}
         {qrModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setQrModal(null)}>
               <div className="bg-white border-[3px] border-black rounded-[2rem] p-8 max-w-md w-full shadow-brutal relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setQrModal(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors">
                     <X size={20} />
                  </button>

                  <h3 className="text-xl font-serif font-black tracking-tighter uppercase mb-6 border-b-2 border-black pb-4 text-center text-black flex items-center justify-center gap-2">
                     <QrCode size={22} /> Mã QR chuyển tiền
                  </h3>

                  {/* Thông tin chuyển */}
                  <div className="space-y-3 mb-6">
                     <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                        <span className="text-xs font-black uppercase text-gray-400">Shop</span>
                        <span className="text-sm font-black">{qrModal.shop.shop_name}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                        <span className="text-xs font-black uppercase text-gray-400">Ngân hàng</span>
                        <span className="text-sm font-bold">{qrModal.shop.bank_name}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                        <span className="text-xs font-black uppercase text-gray-400">STK</span>
                        <span className="text-sm font-black tracking-wider">{qrModal.shop.bank_account_no}</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                        <span className="text-xs font-black uppercase text-gray-400">Chủ TK</span>
                        <span className="text-sm font-black uppercase">{qrModal.shop.bank_account_name}</span>
                     </div>
                     <div className="flex justify-between items-center py-3 bg-green-50 rounded-xl px-4 border-2 border-green-200">
                        <span className="text-xs font-black text-green-700 uppercase">Số tiền chuyển</span>
                        <span className="text-xl font-black text-green-700">{fmt(qrModal.netAmount)}₫</span>
                     </div>
                     <div className="flex justify-between items-center py-2">
                        <span className="text-xs font-black uppercase text-gray-400">Nội dung CK</span>
                        <span className="text-xs font-bold text-gray-600 italic">{qrModal.transferContent}</span>
                     </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                     <div className="border-4 border-black rounded-2xl p-3 bg-white shadow-brutal">
                        <img
                           src={qrModal.qrUrl}
                           alt="VietQR Code"
                           className="w-52 h-52 object-contain"
                           onError={(e: any) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-52 h-52 flex items-center justify-center text-center"><p class="text-xs font-bold text-gray-400">Không thể tải mã QR.<br/>Kiểm tra lại thông tin ngân hàng.</p></div>';
                           }}
                        />
                     </div>
                  </div>

                  <p className="text-[10px] font-bold text-gray-400 text-center mb-6">Mở app ngân hàng → Quét mã QR → Chuyển tiền → Bấm xác nhận bên dưới</p>

                  {/* Actions */}
                  <div className="flex gap-4">
                     <button
                        onClick={handleConfirmPayout}
                        className="flex-grow py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-green-600 text-white hover:bg-green-700 transition-all shadow-subtle active:translate-y-[2px] flex items-center justify-center gap-2"
                     >
                        <CheckCircle2 size={14} /> Xác nhận đã chuyển
                     </button>
                     <button
                        onClick={() => setQrModal(null)}
                        className="px-6 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-white hover:bg-gray-50 transition-all text-black"
                     >
                        Hủy
                     </button>
                  </div>

                  {/* Cảnh báo */}
                  <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                     <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                     <p className="text-[10px] font-bold text-amber-700">Hãy chắc chắn đã chuyển khoản thành công trước khi bấm xác nhận. Thao tác này không thể hoàn tác.</p>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
