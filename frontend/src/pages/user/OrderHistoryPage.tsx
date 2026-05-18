import { Package, Truck, CheckCircle, XCircle, Search, RefreshCcw, Star, ChevronRight, Calendar, Hash } from 'lucide-react';
import { useState } from 'react';

const OrderHistoryPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "Tất cả", icon: <Package size={16} /> },
    { id: "pending", label: "Chờ xác nhận", icon: <Calendar size={16} /> },
    { id: "shipping", label: "Đang giao", icon: <Truck size={16} /> },
    { id: "completed", label: "Hoàn thành", icon: <CheckCircle size={16} /> },
    { id: "returns", label: "Trả hàng", icon: <RefreshCcw size={16} /> },
    { id: "cancelled", label: "Đã hủy", icon: <XCircle size={16} /> }
  ];

  const orders = [
    {
      id: "UTE-99210",
      date: "12/05/2024",
      status: "completed",
      statusLabel: "Hoàn thành",
      total: 2130000,
      items: [
        { name: "Heritage Jacket", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=200" },
        { name: "Slim Fit Jeans", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=200" }
      ]
    },
    {
      id: "UTE-88124",
      date: "08/05/2024",
      status: "shipping",
      statusLabel: "Đang giao hàng",
      total: 850000,
      items: [
        { name: "Basic White Tee", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F0] pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-serif font-black tracking-tighter uppercase mb-2">Lịch sử mua hàng</h1>
            <p className="text-gray-500 font-medium">Theo dõi và quản lý các đơn hàng của bạn</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn hàng..." 
              className="w-full bg-white border-2 border-black rounded-2xl px-6 py-4 pl-12 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {/* Tabs Bento Wrapper */}
        <div className="bg-white border-2 border-black rounded-[2rem] p-3 mb-10 shadow-sm inline-flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-primary/5 text-gray-400 hover:text-black'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-subtle transition-all group">
              {/* Card Header */}
              <div className="bg-gray-50/50 border-b-2 border-black/5 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Hash size={12} /> Mã đơn hàng
                    </span>
                    <span className="font-mono font-black text-lg text-black">{order.id}</span>
                  </div>
                  <div className="w-[2px] h-10 bg-gray-200 hidden md:block"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Calendar size={12} /> Ngày đặt
                    </span>
                    <span className="font-bold text-sm text-black">{order.date}</span>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-full border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-subtle ${
                  order.status === 'completed' ? 'bg-green-50 text-green-600' : 
                  order.status === 'shipping' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {order.statusLabel}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-4 flex-wrap">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden border-2 border-black/5 hover:border-black transition-all cursor-pointer relative group/item">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-all">
                           <ChevronRight className="text-white" size={20} />
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="w-20 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-black/10 flex items-center justify-center text-xs font-black text-gray-400">
                        +{order.items.length - 2}
                      </div>
                    )}
                  </div>

                  <div className="text-center md:text-right">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Tổng thanh toán</p>
                    <p className="text-3xl font-black text-black tracking-tighter">{order.total.toLocaleString()}₫</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-8 py-6 bg-gray-50/30 flex flex-col sm:flex-row justify-end items-center gap-4 border-t-2 border-black/5">
                <button className="flex items-center gap-2 px-6 py-3 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all active:translate-y-1">
                  <RefreshCcw size={14} /> Mua lại
                </button>
                {order.status === 'completed' && (
                  <button className="flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all active:translate-y-1">
                    Trả hàng / Hoàn tiền
                  </button>
                )}
                {order.status === 'completed' ? (
                  <button className="flex items-center gap-2 px-6 py-3 bg-black text-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all active:translate-y-1 shadow-subtle hover:shadow-none">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> Đánh giá sản phẩm
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-6 py-3 bg-white text-black border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all active:translate-y-1">
                    Xem hành trình đơn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;
