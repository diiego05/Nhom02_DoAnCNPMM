import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Star,
  ChevronRight,
  Calendar,
  Hash,
  Loader2,
  Store,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMyOrders,
  useCancelOrder,
  useRetryPayment,
} from "@/hooks/useOrders";
import { OrderStatus } from "@/types/order.types";

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update time every minute to refresh cancel button state
  useState(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  });

  // Ánh xạ tab sang order_status của BE
  const getStatusQuery = () => {
    switch (activeTab) {
      case "pending":
        return "PENDING";
      case "confirmed":
        return "CONFIRMED";
      case "preparing":
        return "PREPARING";
      case "shipping":
        return "DELIVERING";
      case "completed":
        return "DELIVERED";
      case "cancelled":
        return "CANCELLED";
      default:
        return "all";
    }
  };

  const { data: orderResponse, isLoading } = useMyOrders(getStatusQuery());
  const cancelOrderMutation = useCancelOrder();
  const retryPaymentMutation = useRetryPayment();

  const handleCancelOrder = (id: number, status: string) => {
    const isRequest = status === "PREPARING";
    const message = isRequest
      ? "Bạn có chắc chắn muốn gửi yêu cầu hủy đơn hàng này cho shop không?"
      : "Bạn có chắc chắn muốn hủy đơn hàng này không?";

    if (window.confirm(message)) {
      cancelOrderMutation.mutate({ id, reason: "Người dùng hủy đơn" });
    }
  };

  const handleRetryPayment = (parentOrderId: number) => {
    retryPaymentMutation.mutate(parentOrderId, {
      onSuccess: (data) => {
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      },
      onError: (error: any) => {
        alert(
          error.response?.data?.message || "Không thể tạo lại thanh toán VNPay",
        );
      },
    });
  };

  const orderStatuses = [
    { key: "PENDING", label: "Đơn mới" },
    { key: "CONFIRMED", label: "Đã xác nhận" },
    { key: "PREPARING", label: "Chuẩn bị hàng" },
    { key: "DELIVERING", label: "Đang giao" },
    { key: "DELIVERED", label: "Thành công" },
  ];

  const renderTimeline = (currentStatus: string) => {
    if (currentStatus === "CANCELLED" || currentStatus === "CANCEL_REQUESTED")
      return null;
      
    const normalizedStatus = currentStatus === "READY_FOR_PICKUP" ? "PREPARING" : currentStatus;
    const currentIndex = orderStatuses.findIndex(
      (s) => s.key === normalizedStatus,
    );

    return (
      <div className="flex flex-row w-full mt-8 px-4 relative">
        {orderStatuses.map((s, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx <= currentIndex;
          
          return (
          <div
            key={s.key}
            className="flex-1 flex flex-col items-center relative group"
          >
            {idx < orderStatuses.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-[3px] ${isActive ? "bg-primary" : "bg-gray-200"} -z-10 transition-all`}
              ></div>
            )}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] text-sm transition-all duration-300 ${isActive ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(var(--color-primary),0.3)] scale-110" : "bg-white border-gray-300 text-gray-400 font-bold"}`}
            >
              {isCompleted ? <CheckCircle size={20} /> : idx + 1}
            </div>
            <p
              className={`text-[11px] mt-4 font-black uppercase tracking-wider text-center transition-all ${isActive ? "text-black translate-y-1" : "text-gray-400"}`}
            >
              {s.label}
            </p>
          </div>
        )})}
      </div>
    );
  };

  const tabs = [
    { id: "all", label: "Tất cả", icon: <Package size={16} /> },
    { id: "pending", label: "Chờ xác nhận", icon: <Calendar size={16} /> },
    { id: "confirmed", label: "Đã xác nhận", icon: <CheckCircle size={16} /> },
    { id: "preparing", label: "Đang chuẩn bị", icon: <Package size={16} /> },
    { id: "shipping", label: "Đang giao", icon: <Truck size={16} /> },
    { id: "completed", label: "Hoàn thành", icon: <CheckCircle size={16} /> },
    { id: "cancelled", label: "Đã hủy", icon: <XCircle size={16} /> },
  ];

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<string, string> = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      PREPARING: "Đang chuẩn bị",
      READY_FOR_PICKUP: "Sẵn sàng giao",
      DELIVERING: "Đang giao hàng",
      SHIPPING: "Đang giao hàng",
      DELIVERED: "Giao thành công",
      CANCEL_REQUESTED: "Yêu cầu hủy",
      CANCELLED: "Đã hủy",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: OrderStatus) => {
    if (["DELIVERED"].includes(status))
      return "bg-green-50 text-green-600 border-green-200";
    if (["DELIVERING", "SHIPPING"].includes(status))
      return "bg-blue-50 text-blue-600 border-blue-200";
    if (["CANCELLED", "CANCEL_REQUESTED"].includes(status))
      return "bg-red-50 text-red-600 border-red-200";
    return "bg-orange-50 text-orange-600 border-orange-200";
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0] pt-24 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-serif font-black tracking-tighter uppercase mb-2">
              Lịch sử mua hàng
            </h1>
            <p className="text-gray-500 font-medium">
              Theo dõi và quản lý các đơn hàng của bạn
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Tìm theo mã đơn hàng..."
              className="w-full bg-white border-2 border-black rounded-2xl px-6 py-4 pl-12 font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        {/* Tabs Bento Wrapper */}
        <div className="bg-white border-2 border-black rounded-[2rem] p-3 mb-10 shadow-sm inline-flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-black text-white" : "hover:bg-primary/5 text-gray-400 hover:text-black"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : orderResponse?.orders.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
              <Package size={40} />
            </div>
            <h2 className="text-2xl font-black uppercase mb-2">
              Không có đơn hàng nào
            </h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              Bạn chưa có đơn hàng nào trong trạng thái này.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {orderResponse?.orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-subtle transition-all group"
              >
                {/* Card Header */}
                <div className="bg-gray-50/50 border-b-2 border-black/5 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 border-r-2 border-gray-200 pr-6">
                      <Store size={24} className="text-primary" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                          Shop
                        </span>
                        <span className="font-black text-sm text-black uppercase">
                          {order.shop?.name || "UTEShop Official"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col hidden md:flex">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <Hash size={12} /> Mã đơn hàng
                      </span>
                      <span className="font-mono font-black text-sm text-black">
                        {order.shop_order_code || order.order_code}
                      </span>
                    </div>
                    <div className="w-[2px] h-10 bg-gray-200 hidden md:block"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                        <Calendar size={12} /> Ngày đặt
                      </span>
                      <span className="font-bold text-sm text-black">
                        {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-full border-2 font-black text-[10px] uppercase tracking-widest shadow-subtle ${getStatusColor(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-4 flex-grow max-w-xl">
                      {order.items?.slice(0, 2).map((item, idx) => {
                        const product = item.variant?.product || item.product;
                        const imageUrl =
                          item.product_image_url ||
                          product?.images?.find((img: any) => img.is_primary)
                            ?.image_url ||
                          product?.images?.[0]?.image_url ||
                          "/placeholder.jpg";

                        return (
                          <div
                            key={idx}
                            onClick={() =>
                              navigate(
                                `/products/${product?.slug || product?.id || item.product_id}`,
                              )
                            }
                            className="flex items-center gap-4 cursor-pointer group/item"
                          >
                            <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden border-2 border-black/5 group-hover/item:border-primary transition-all relative shrink-0">
                              <img
                                src={
                                  imageUrl.startsWith("http") ||
                                  imageUrl.startsWith("data:")
                                    ? imageUrl
                                    : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8088"}${imageUrl}`
                                }
                                alt={item.product_name || product?.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-all">
                                <ChevronRight
                                  className="text-white"
                                  size={20}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-sm font-black uppercase tracking-tight group-hover/item:text-primary transition-colors line-clamp-2">
                                {item.product_name || product?.name}
                              </p>
                              {item.size || item.color ? (
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                                  Phân loại: {item.size || "Mặc định"}{" "}
                                  {item.color ? `/ ${item.color}` : ""}
                                </p>
                              ) : null}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-sm font-black text-primary">
                                  {Number(item.unit_price).toLocaleString()}₫
                                </span>
                                <span className="text-[10px] font-black text-gray-400">
                                  x{item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {(order.items?.length || 0) > 2 && (
                        <div
                          className="flex items-center gap-4 pl-2 cursor-pointer"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <div className="w-10 h-10 bg-gray-50 rounded-full border-2 border-dashed border-black/20 flex items-center justify-center text-xs font-black text-gray-500">
                            +{(order.items?.length || 0) - 2}
                          </div>
                          <span className="text-xs font-black text-gray-500 uppercase hover:text-primary transition-colors hover:underline">
                            Xem thêm sản phẩm
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                        Tổng thanh toán
                      </p>
                      <p className="text-3xl font-black text-black tracking-tighter">
                        {Number(
                          order.final_amount || order.total_amount || 0,
                        ).toLocaleString()}
                        ₫
                      </p>
                      {Number(order.points_earned) > 0 && (
                        <p className="text-[10px] font-bold text-green-500 mt-1 uppercase tracking-widest">
                          +{order.points_earned} điểm
                        </p>
                      )}
                      {Number(order.points_used) > 0 && (
                        <p className="text-[10px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                          Đã dùng: {order.points_used} điểm
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Status Timeline */}
                  {renderTimeline(order.status)}
                </div>

                {/* Card Footer */}
                <div className="px-8 py-6 bg-gray-50/30 flex flex-col sm:flex-row justify-end items-center gap-4 border-t-2 border-black/5">
                  {(() => {
                    const isUnpaidVNPay =
                      order.parentOrder?.payment_method === "VNPAY" &&
                      order.parentOrder?.payment_status === "UNPAID";
                    if (isUnpaidVNPay) {
                      return (
                        <button
                          onClick={() =>
                            handleRetryPayment(order.parentOrder!.id)
                          }
                          className="flex items-center gap-2 px-6 py-3 border-2 border-primary text-white bg-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-y-1"
                        >
                          Thanh toán lại
                        </button>
                      );
                    }
                  })()}
                  {(() => {
                    const diffMins =
                      (currentTime - new Date(order.created_at).getTime()) /
                      1000 /
                      60;
                    const canCancel =
                      diffMins <= 30 &&
                      ["PENDING", "CONFIRMED", "PREPARING"].includes(
                        order.status,
                      );

                    if (canCancel) {
                      const isRequest = order.status === "PREPARING";
                      return (
                        <button
                          onClick={() =>
                            handleCancelOrder(order.id, order.status)
                          }
                          disabled={cancelOrderMutation.isPending}
                          className="flex items-center gap-2 px-6 py-3 border-2 border-red-200 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all active:translate-y-1 disabled:opacity-50"
                        >
                          <XCircle size={14} />{" "}
                          {isRequest ? "Gửi yêu cầu hủy" : "Hủy đơn hàng"}
                        </button>
                      );
                    }
                    return null;
                  })()}
                  {order.status === "DELIVERED" ? (
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="flex items-center gap-2 px-6 py-3 bg-black text-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all active:translate-y-1 shadow-subtle hover:shadow-none"
                    >
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />{" "}
                      Đánh giá sản phẩm
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-black border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all active:translate-y-1"
                    >
                      Xem chi tiết đơn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
