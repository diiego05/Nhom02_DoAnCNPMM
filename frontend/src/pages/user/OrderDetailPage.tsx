import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  ChevronLeft, Package, MapPin, CreditCard, 
  CheckCircle, Calendar, Hash, Truck, Loader2, DollarSign,
  Star, X
} from 'lucide-react';
import { useOrderDetail } from '@/hooks/useOrders';
import { useCreateReview } from '@/hooks/useReviews';
import { OrderStatus } from '@/types/order.types';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrderDetail(Number(id));

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductToReview, setSelectedProductToReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const createReviewMutation = useCreateReview();

  const handleOpenReviewModal = (item: any) => {
    setSelectedProductToReview(item);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductToReview) return;
    createReviewMutation.mutate(
      {
        productId: selectedProductToReview.product_id,
        payload: {
          order_id: order?.id,
          variant_id: selectedProductToReview.product_variant_id,
          rating,
          comment
        }
      },
      {
        onSuccess: () => {
          setReviewModalOpen(false);
          setComment('');
          setRating(5);
          alert('Đánh giá thành công! Bạn đã được tặng 100 điểm thưởng.');
        },
        onError: (error: any) => {
          const errMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá';
          alert(errMsg);
        }
      }
    );
  };

  const orderStatuses = [
    { key: 'PENDING', label: 'Đơn mới' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'PREPARING', label: 'Chuẩn bị hàng' },
    { key: 'SHIPPING', label: 'Đang giao' },
    { key: 'DELIVERED', label: 'Thành công' },
  ];

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<string, string> = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'PREPARING': 'Đang chuẩn bị',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Giao thành công',
      'CANCEL_REQUESTED': 'Yêu cầu hủy',
      'CANCELLED': 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: OrderStatus) => {
    if (['DELIVERED'].includes(status)) return 'bg-green-50 text-green-600 border-green-200';
    if (['SHIPPING'].includes(status)) return 'bg-blue-50 text-blue-600 border-blue-200';
    if (['CANCELLED', 'CANCEL_REQUESTED'].includes(status)) return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-orange-50 text-orange-600 border-orange-200';
  };

  const renderTimeline = (currentStatus: string) => {
    if (currentStatus === 'CANCELLED' || currentStatus === 'CANCEL_REQUESTED') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl border-2 border-red-200">
          <div className="w-16 h-16 bg-white rounded-full border-4 border-red-500 flex items-center justify-center mb-4">
            <span className="text-red-500 font-black text-2xl">!</span>
          </div>
          <h3 className="text-xl font-black text-red-600 uppercase mb-2">Đơn hàng đã hủy</h3>
          <p className="text-sm font-bold text-red-400">Đơn hàng này đã bị hủy và không thể tiếp tục giao.</p>
        </div>
      );
    }

    const currentIndex = orderStatuses.findIndex(s => s.key === currentStatus);
    
    return (
      <div className="flex flex-row w-full mt-8 px-4 relative">
        {orderStatuses.map((s, idx) => (
          <div key={s.key} className="flex-1 flex flex-col items-center relative group">
            {idx < orderStatuses.length - 1 && (
               <div className={`absolute top-5 left-1/2 w-full h-[3px] ${idx < currentIndex ? 'bg-primary' : 'bg-gray-200'} -z-10 transition-all`}></div>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] bg-white text-sm transition-all duration-300 ${idx <= currentIndex ? 'border-primary text-primary font-black shadow-[0_0_15px_rgba(var(--color-primary),0.3)] scale-110' : 'border-gray-300 text-gray-400 font-bold'}`}>
              {idx < currentIndex ? <CheckCircle size={20} /> : idx + 1}
            </div>
            <p className={`text-[11px] mt-4 font-black uppercase tracking-wider text-center transition-all ${idx <= currentIndex ? 'text-black translate-y-1' : 'text-gray-400'}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] pt-24 pb-32 px-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black uppercase mb-4">Không tìm thấy đơn hàng</h1>
        <Link to="/orders" className="text-primary hover:underline font-bold uppercase text-sm">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F0] pt-24 pb-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/orders" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-primary transition-all bg-white px-5 py-3 rounded-xl border-2 border-black/10 hover:border-black shadow-sm group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Quay lại lịch sử
          </Link>
        </div>

        <div className="bg-white border-2 border-black rounded-[2.5rem] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-gray-50 border-b-2 border-black/5 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-serif font-black tracking-tighter uppercase mb-4 flex items-center gap-3">
                <Package className="text-primary" size={32} /> Chi tiết đơn hàng
              </h1>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Hash size={12} /> Mã đơn hàng
                  </span>
                  <span className="font-mono font-black text-lg text-black">{order.order_code}</span>
                </div>
                <div className="w-[2px] h-8 bg-gray-200 hidden md:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <Calendar size={12} /> Ngày đặt
                  </span>
                  <span className="font-bold text-sm text-black">{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            </div>

            <div className={`px-6 py-3 rounded-full border-2 font-black text-xs uppercase tracking-widest shadow-subtle ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </div>
          </div>

          <div className="p-8 border-b-2 border-black/5">
            {renderTimeline(order.status)}
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/30 border-b-2 border-black/5">
            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 border-b-2 border-black/10 pb-3">
                <MapPin className="text-primary" /> Thông tin nhận hàng
              </h3>
              <div className="bg-white p-6 rounded-2xl border-2 border-black/5 shadow-sm">
                <p className="font-black text-sm uppercase mb-1">{order.recipient_name}</p>
                <p className="font-bold text-gray-500 text-sm mb-4">{order.recipient_phone}</p>
                <p className="text-sm font-medium text-gray-600 leading-relaxed">{order.shipping_address}</p>
                {order.note && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Ghi chú</p>
                    <p className="text-sm font-medium italic text-gray-600">{order.note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 border-b-2 border-black/10 pb-3">
                <CreditCard className="text-primary" /> Thanh toán
              </h3>
              <div className="bg-white p-6 rounded-2xl border-2 border-black/5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                  <span className="text-xs font-black uppercase text-gray-500">Phương thức</span>
                  <span className="text-sm font-black uppercase">{order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : order.payment_method}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-gray-500">Trạng thái</span>
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${order.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {order.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 mb-6">
              <Package className="text-primary" /> Danh sách sản phẩm
            </h3>
            
            <div className="space-y-4">
              {order.items?.map((item, idx) => {
                const product = item.product;
                const imageUrl = item.product_image_url || product?.images?.find(img => img.is_primary)?.image_url || product?.images?.[0]?.image_url || '/placeholder.jpg';
                
                return (
                <div key={idx} className="flex gap-6 items-center p-4 bg-gray-50 rounded-2xl border-2 border-black/5 hover:border-black/20 transition-colors">
                  <div className="w-20 h-24 bg-white rounded-xl overflow-hidden border border-black/10 flex-shrink-0">
                    <img src={imageUrl.startsWith('http') || imageUrl.startsWith('data:') ? imageUrl : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8088"}${imageUrl}`} alt={item.product_name || product?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-black uppercase">{item.product_name || product?.name}</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">
                      {item.variant_color || item.variant_size ? `Phân loại: ${item.variant_size || ''} ${item.variant_color ? `/ ${item.variant_color}` : ''}` : 'Mặc định'}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-black text-primary">{(Number(item.unit_price)).toLocaleString()}₫</p>
                        <p className="text-xs font-black text-gray-500 bg-white px-3 py-1 rounded-full border border-black/10 shadow-sm">x{item.quantity}</p>
                      </div>
                      
                      {order.status === 'DELIVERED' && (
                        <button 
                          onClick={() => handleOpenReviewModal(item)}
                          className="px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-primary transition-colors flex items-center gap-1"
                        >
                          <Star size={14} className="fill-yellow-400 text-yellow-400" /> Đánh giá
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="bg-black text-white p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-8 shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)]">
             <div className="flex items-center gap-3 w-full sm:w-auto border-b border-white/20 sm:border-none pb-6 sm:pb-0 justify-center sm:justify-start">
               <DollarSign size={32} className="text-primary" />
               <div className="text-left">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cảm ơn bạn đã mua hàng</p>
                 <p className="text-sm font-bold">Hy vọng bạn thích sản phẩm!</p>
               </div>
             </div>
             
             <div className="w-full sm:w-80 space-y-4">
                <div className="flex justify-between text-sm font-bold text-gray-400">
                  <span>Tạm tính</span>
                  <span className="text-white">{(Number(order.subtotal || 0)).toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span className="text-white">{(Number(order.shipping_fee)).toLocaleString()}₫</span>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm font-bold text-gray-400">
                    <span>Giảm giá</span>
                    <span className="text-red-400">-{(Number(order.discount_amount)).toLocaleString()}₫</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4 border-t border-white/20">
                  <span className="text-sm font-black uppercase tracking-widest">Tổng cộng</span>
                  <span className="text-4xl font-black text-primary tracking-tighter">{(Number(order.total_amount)).toLocaleString()}₫</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedProductToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-black rounded-[2rem] w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black hover:rotate-90 transition-all"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Đánh giá sản phẩm</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Chia sẻ trải nghiệm của bạn và nhận 100 điểm thưởng!</p>
            
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border-2 border-black/5">
              <img 
                src={(selectedProductToReview.product_image_url || selectedProductToReview.product?.images?.find((img: any) => img.is_primary)?.image_url || selectedProductToReview.product?.images?.[0]?.image_url)?.startsWith('http') ? (selectedProductToReview.product_image_url || selectedProductToReview.product?.images?.find((img: any) => img.is_primary)?.image_url || selectedProductToReview.product?.images?.[0]?.image_url) : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8088"}${selectedProductToReview.product_image_url || selectedProductToReview.product?.images?.find((img: any) => img.is_primary)?.image_url || selectedProductToReview.product?.images?.[0]?.image_url}`} 
                alt="Product" 
                className="w-16 h-16 rounded-xl object-cover border border-black/10 bg-white"
              />
              <div>
                <p className="font-black text-sm uppercase leading-tight line-clamp-2 mb-1">{selectedProductToReview.product_name || selectedProductToReview.product?.name}</p>
                <p className="text-xs text-gray-500 font-bold">{selectedProductToReview.variant_color || selectedProductToReview.variant_size ? `Phân loại: ${selectedProductToReview.variant_size || ''} ${selectedProductToReview.variant_color ? `/ ${selectedProductToReview.variant_color}` : ''}` : 'Mặc định'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-3 text-center">Chất lượng sản phẩm</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transform hover:scale-110 transition-transform"
                    >
                      <Star 
                        size={32} 
                        className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Đánh giá chi tiết</label>
                <textarea
                  className="w-full h-32 border-2 border-black/20 focus:border-black rounded-xl p-4 font-medium outline-none transition-all resize-none"
                  placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm nhé..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={createReviewMutation.isPending}
                className="w-full py-4 bg-primary text-white border-2 border-black rounded-xl font-black uppercase tracking-widest hover:bg-black transition-colors active:translate-y-1 shadow-subtle hover:shadow-none disabled:opacity-50"
              >
                {createReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
