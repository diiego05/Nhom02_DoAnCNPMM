import Banner from "@/components/ui/Banner";
import ProductCard from "@/components/ui/ProductCard";
import { ArrowRight, Truck, RefreshCw, ShieldCheck, ChevronLeft, ChevronRight, Ticket, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000",
      title: "Bản Sắc Thời Thượng Mùa Thu 2024",
      description: "Khám phá bộ sưu tập mới nhất mang đậm hơi thở đương đại và tối giản từ UTEShop.",
    },
    {
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000",
      title: "Phong Cách Tối Giản Hiện Đại",
      description: "Sự kết hợp hoàn hảo giữa chất liệu cao cấp và thiết kế vượt thời gian.",
    },
    {
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000",
      title: "Bộ Sưu Tập Giới Hạn",
      description: "Nâng tầm phong cách cá nhân với những thiết kế độc bản chỉ có tại UTEShop.",
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered]);

  const newArrivals = [
    { id: "1", name: "Áo Blazer Oversize Linen", price: 850000, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800", category: "Nam", rating: 4.8, sales: 124, badge: "Mới" as const },
    { id: "2", name: "Quần Tây Pleated Classic", price: 590000, image: "https://images.unsplash.com/photo-1624373686452-377243c48521?q=80&w=800", category: "Nam", rating: 4.5, sales: 89, badge: "Mới" as const },
    { id: "3", name: "Váy Lụa Slip Dress Satin", price: 720000, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800", category: "Nữ", rating: 4.9, sales: 215, badge: "Mới" as const },
    { id: "4", name: "Áo Polo Knit Texture", price: 450000, image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=800", category: "Nam", rating: 4.7, sales: 156, badge: "Mới" as const },
    { id: "5", name: "Áo Sơ Mi Denim Raw", price: 680000, image: "https://images.unsplash.com/photo-15162579848b1-39c5042771d8?q=80&w=800", category: "Nam", rating: 4.6, sales: 78, badge: "Mới" as const },
    { id: "6", name: "Chân Váy Xếp Ly Midi", price: 520000, image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800", category: "Nữ", rating: 4.8, sales: 142, badge: "Mới" as const },
    { id: "7", name: "Áo Cardigan Len Mỏng", price: 550000, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800", category: "Unisex", rating: 4.7, sales: 95, badge: "Mới" as const },
    { id: "8", name: "Quần Jean Straight Fit", price: 790000, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800", category: "Nam", rating: 4.5, sales: 210, badge: "Mới" as const },
  ];

  const bestSellers = [
    { id: "b1", name: "Áo Hoodie Essentials Gray", price: 450000, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800", category: "Nam", rating: 5.0, sales: 2450, badge: "Hot" as const },
    { id: "b2", name: "Quần Cargo Pants Multi-pocket", price: 650000, image: "https://images.unsplash.com/photo-1565084888279-aff996976423?q=80&w=800", category: "Nam", rating: 4.9, sales: 1820, badge: "Hot" as const },
    { id: "b3", name: "Áo Thun Cotton Basic White", price: 290000, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800", category: "Unisex", rating: 4.8, sales: 3200, badge: "Hot" as const },
    { id: "b4", name: "Giày Loafer Da Ý Classic", price: 1250000, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800", category: "Nam", rating: 4.9, sales: 950, badge: "Hot" as const },
    { id: "b5", name: "Túi Tote Canvas Minimalist", price: 320000, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800", category: "Nữ", rating: 4.7, sales: 1580, badge: "Hot" as const },
    { id: "b6", name: "Mũ Beanie Len Merino", price: 250000, image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800", category: "Unisex", rating: 4.8, sales: 1120, badge: "Hot" as const },
    { id: "b7", name: "Áo Khoác Gió Bomber Navy", price: 890000, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800", category: "Nam", rating: 4.8, sales: 740, badge: "Hot" as const },
    { id: "b8", name: "Quần Short Kaki Casual", price: 350000, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800", category: "Nam", rating: 4.6, sales: 1350, badge: "Hot" as const },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div 
          className="lg:col-span-2 relative aspect-[16/9] lg:aspect-auto rounded-3xl overflow-hidden group border-2 border-black shadow-subtle"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-all duration-1000 transform ${index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"}`}
            >
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-10 md:p-16 text-white">
                <h1 className="text-5xl md:text-6xl font-serif font-black mb-6 max-w-2xl leading-tight uppercase">
                  {slide.title}
                </h1>
                <p className="text-lg opacity-90 mb-10 max-w-md font-medium">
                  {slide.description}
                </p>
                <div className="flex items-center gap-6">
                  <Link
                    to="/products"
                    className="btn-brutal px-10 text-sm uppercase tracking-[0.2em]"
                  >
                    Khám phá ngay
                    <ArrowRight size={20} className="ml-3" />
                  </Link>
                  <div className="flex gap-3">
                    <button onClick={prevSlide} className="w-12 h-12 bg-white/10 hover:bg-primary hover:border-black border-2 border-white/50 rounded-2xl flex items-center justify-center transition-all active:scale-95">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="w-12 h-12 bg-white/10 hover:bg-primary hover:border-black border-2 border-white/50 rounded-2xl flex items-center justify-center transition-all active:scale-95">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="absolute bottom-10 right-10 flex gap-2">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-10 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-[#FFE4D6] border-2 border-black rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group hover:shadow-subtle transition-all">
            <div className="relative z-10">
              <span className="badge-brutal">Giới hạn</span>
              <h3 className="text-5xl font-serif font-black mt-8 text-[#D97736]">Giảm 50%</h3>
              <p className="text-sm font-bold text-[#D97736]/60 mt-3 uppercase tracking-widest">Bộ sưu tập mùa hè</p>
            </div>
            <Link to="/products" className="relative z-10 w-fit p-4 bg-white border-2 border-black rounded-xl hover:bg-primary hover:text-white transition-all shadow-subtle hover:shadow-none">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="absolute -right-6 -bottom-6 text-[16rem] font-black text-[#D97736]/5 rotate-12 group-hover:rotate-0 transition-all duration-700 select-none">%</div>
          </div>

          <div className="bg-[#E2E8E4] border-2 border-black rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group hover:shadow-subtle transition-all">
            <div className="relative z-10">
              <span className="badge-brutal">Flash Sale</span>
              <h3 className="text-5xl font-serif font-black mt-8 text-[#4A5D50]">Giá Sốc</h3>
              <p className="text-sm font-bold text-[#4A5D50]/60 mt-3 uppercase tracking-widest">Duy nhất hôm nay</p>
            </div>
            <Link to="/products" className="relative z-10 w-fit p-4 bg-white border-2 border-black rounded-xl hover:bg-primary hover:text-white transition-all shadow-subtle hover:shadow-none">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="absolute -right-6 -bottom-6 text-[16rem] font-black text-[#4A5D50]/5 rotate-12 group-hover:rotate-0 transition-all duration-700 select-none">⚡</div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-5xl font-serif font-black mb-4 tracking-tighter uppercase">Hàng Mới Về</h2>
            <div className="h-1.5 w-24 bg-primary border-2 border-black rounded-full shadow-subtle"></div>
          </div>
          <Link to="/products" className="btn-brutal-secondary h-14 px-10 text-xs uppercase tracking-widest shadow-subtle hover:shadow-none">
            Xem tất cả
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* CTA Community Banner */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-black text-white rounded-[3rem] p-16 md:p-24 relative overflow-hidden border-2 border-black group shadow-brutal">
          <div className="relative z-10 max-w-2xl">
            <span className="text-primary font-black uppercase tracking-[0.3em] mb-6 block">CỘNG ĐỒNG UTESHOP</span>
            <h2 className="text-5xl md:text-7xl font-serif font-black mb-10 leading-tight">
              Đăng ký ngay & nhận ưu đãi -20%
            </h2>
            <p className="text-lg opacity-80 mb-12 font-medium leading-relaxed">
              Trở thành hội viên để nhận những đặc quyền sớm nhất về các bộ sưu tập giới hạn và sự kiện độc quyền.
            </p>
            <Link to="/auth/register" className="btn-brutal-secondary h-16 px-12 text-sm uppercase tracking-[0.2em] shadow-subtle hover:shadow-none">
               Tham gia ngay
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none overflow-hidden">
             <div className="text-[40rem] font-black absolute -right-20 top-1/2 -translate-y-1/2 rotate-12 select-none">UTE</div>
          </div>
        </div>
      </section>

      {/* Best Sellers & Voucher Section - KHÔI PHỤC THEO THIẾT KẾ */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-9">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-5xl font-serif font-black mb-4 tracking-tighter uppercase">Bán Chạy Nhất</h2>
              <div className="h-1.5 w-24 bg-primary border-2 border-black rounded-full shadow-subtle"></div>
            </div>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center bg-white shadow-subtle hover:bg-primary hover:text-white transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"><ChevronLeft size={20}/></button>
              <button className="w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center bg-white shadow-subtle hover:bg-primary hover:text-white transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>

        {/* Voucher Sidebar - KHÔI PHỤC THEO THIẾT KẾ */}
        <div className="lg:col-span-3">
           <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-brutal flex flex-col h-full min-w-0">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Ticket className="text-primary" /> Ưu đãi độc quyền
              </h3>
              <div className="space-y-6 flex-1">
                 {[
                   { code: "UTE20", desc: "Giảm 20% cho đơn hàng đầu tiên", color: "bg-orange-50 text-orange-600" },
                   { code: "FREESHIP", desc: "Miễn phí vận chuyển toàn quốc", color: "bg-green-50 text-green-600" },
                   { code: "SUMMER30", desc: "Giảm 30k cho BST Mùa Hè", color: "bg-blue-50 text-blue-600" }
                 ].map((v, i) => (
                    <div key={i} className={`p-6 rounded-2xl border-2 border-dashed border-black/30 ${v.color} transition-all hover:scale-[1.02] cursor-pointer`}>
                       <div className="font-black text-xl mb-1 tracking-wider">{v.code}</div>
                       <div className="text-[11px] font-black opacity-80 leading-tight">{v.desc}</div>
                    </div>
                 ))}
              </div>
              <button className="btn-brutal w-full mt-10 py-5 px-2 leading-tight flex flex-col items-center justify-center active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
                <span className="text-[10px] uppercase tracking-widest opacity-80 mb-1">Xem tất cả</span>
                <span className="text-base font-black uppercase tracking-tighter">Voucher</span>
              </button>
           </div>
        </div>
      </section>

      {/* "Còn rất nhiều thiết kế khác" - KHÔI PHỤC THEO THIẾT KẾ */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-primary/10 border-2 border-dashed border-black p-16 rounded-[3rem] text-center space-y-8">
           <h3 className="text-4xl font-serif font-black uppercase tracking-tighter italic">"Còn rất nhiều thiết kế khác đang chờ bạn khám phá"</h3>
           <p className="text-gray-500 font-bold max-w-xl mx-auto text-lg">Đừng bỏ lỡ cơ hội sở hữu những món đồ thời trang độc bản và phong cách nhất mùa này.</p>
           <Link to="/products" className="btn-brutal h-16 px-12 text-sm uppercase tracking-widest shadow-brutal">
             Đến cửa hàng ngay
           </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { icon: <Truck size={36} />, title: "Giao hàng", desc: "Nhanh chóng & An toàn" },
          { icon: <RefreshCw size={36} />, title: "Đổi trả", desc: "Linh hoạt trong 30 ngày" },
          { icon: <ShieldCheck size={36} />, title: "Chất lượng", desc: "Cam kết chính hãng 100%" }
        ].map((f, i) => (
          <div key={i} className="bg-white border-2 border-black p-10 rounded-3xl flex flex-col items-center text-center space-y-6 shadow-subtle hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <div className="w-20 h-20 bg-primary/10 border-2 border-black rounded-2xl flex items-center justify-center text-primary shadow-subtle">
              {f.icon}
            </div>
            <h4 className="text-2xl font-serif font-black uppercase tracking-tight">{f.title}</h4>
            <p className="text-sm font-bold text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
