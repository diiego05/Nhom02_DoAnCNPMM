import ProductCard from "@/components/ui/ProductCard";
import { Star, Heart, Share2, ShieldCheck, Truck, RefreshCw, Minus, Plus, ChevronRight, ChevronLeft, Shield, Store, MessageCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const ProductDetailPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("L");
  const [activeTab, setActiveTab] = useState("description");

  const product = {
    id: "detail-1",
    name: "Áo Khoác Heritage Jacket - Phiên Bản Giới Hạn",
    price: 1450000,
    originalPrice: 2100000,
    discount: "-35%",
    rating: 4.5,
    reviews: 128,
    sales: 1250,
    category: "Thời trang Nam",
    description: "Được lấy cảm hứng từ những chiếc áo khoác quân đội cổ điển, Heritage Jacket là sự kết hợp hoàn hảo giữa độ bền bỉ và phong cách hiện đại. Sử dụng chất liệu Canvas 100% Cotton được xử lý chống thấm nhẹ, sản phẩm mang lại cảm giác thoải mái nhưng vẫn giữ form cực tốt.",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800",
      "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=800",
      "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800"
    ],
    colors: [
      { name: "Đen Carbon", hex: "#2D2D2D" },
      { name: "Xanh Olive", hex: "#4B5320" },
      { name: "Nâu Cinnamon", hex: "#7B3F00" }
    ],
    sizes: ["S", "M", "L", "XL", "2XL"]
  };

  const relatedProducts = [
    { id: "r1", name: "Quần Jean Workwear Loose", price: 890000, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800", category: "Nam", rating: 4.7, sales: 432 },
    { id: "r2", name: "Áo Sơ Mi Flanel Kẻ Caro", price: 550000, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800", category: "Nam", rating: 4.8, sales: 654 },
    { id: "r3", name: "Mũ Beanie Dệt Kim", price: 220000, image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800", category: "Phụ kiện", rating: 4.9, sales: 876 },
    { id: "r4", name: "Túi Tote Canvas Bền Bỉ", price: 350000, image: "https://images.unsplash.com/photo-1544816153-0973055ce7ef?q=80&w=800", category: "Phụ kiện", rating: 4.6, sales: 1205 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-gray-400">
        <Link to="/" className="hover:text-primary transition-colors">TRANG CHỦ</Link>
        <span className="text-black">/</span>
        <span className="text-black">{product.name.toUpperCase()}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-32 items-start">
        {/* Gallery Section - KHÔI PHỤC MŨI TÊN ĐIỀU HƯỚNG */}
        <div className="lg:w-1/2 space-y-8">
          <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden border-2 border-black shadow-brutal bg-gray-50 group">
             <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
             
             {/* Navigation Arrows */}
             <button className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 border-2 border-black rounded-2xl flex items-center justify-center shadow-subtle opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                <ChevronLeft size={32} />
             </button>
             <button className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/90 border-2 border-black rounded-2xl flex items-center justify-center shadow-subtle opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white">
                <ChevronRight size={32} />
             </button>

             {/* Discount Badge */}
             <div className="absolute top-10 right-10 w-20 h-20 bg-orange-500 text-white rounded-full border-2 border-black flex items-center justify-center font-black text-xl shadow-brutal -rotate-12">
                {product.discount}
             </div>
          </div>
          <div className="grid grid-cols-4 gap-6">
             {product.images.map((img, i) => (
                <div key={i} className={`aspect-[4/5] rounded-[1.5rem] overflow-hidden cursor-pointer border-2 shadow-subtle transition-all border-black ${i === 0 ? "shadow-none translate-x-1 translate-y-1 border-primary border-[3px]" : "hover:border-primary hover:shadow-none hover:translate-x-1 hover:translate-y-1"}`}>
                   <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                </div>
             ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:w-1/2 flex flex-col pt-0">
          <div className="space-y-10">
            <div className="flex items-center justify-between">
               <span className="badge-brutal bg-primary text-white border-black px-4 py-2">BÁN CHẠY NHẤT</span>
               <div className="flex gap-4">
                 <button className="w-14 h-14 bg-white border-2 border-black rounded-2xl shadow-subtle flex items-center justify-center hover:bg-primary hover:text-white hover:shadow-none transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"><Heart size={24} /></button>
                 <button className="w-14 h-14 bg-white border-2 border-black rounded-2xl shadow-subtle flex items-center justify-center hover:bg-primary hover:text-white hover:shadow-none transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"><Share2 size={24} /></button>
               </div>
            </div>

            <h1 className="text-3xl lg:text-5xl font-serif font-black leading-tight tracking-tighter uppercase text-black">
               {product.name}
            </h1>

            <div className="flex items-center gap-10">
              <div className="flex items-center gap-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <span className="text-sm font-black text-black underline tracking-tighter">{product.reviews} ĐÁNH GIÁ</span>
              </div>
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest border-l-2 border-black pl-10">
                ĐÃ BÁN: <span className="text-black">{product.sales}</span>
              </span>
            </div>

            <div className="flex items-center gap-6 pt-2">
               <span className="text-3xl lg:text-4xl font-black text-primary">
                 {product.price.toLocaleString()}₫
               </span>
               <span className="text-xl text-gray-300 line-through decoration-black/10 font-bold">
                 {product.originalPrice.toLocaleString()}₫
               </span>
            </div>

            {/* Selection Box - KHUNG CHIA RÕ RÀNG THEO THIẾT KẾ */}
            <div className="border-2 border-black rounded-[2.5rem] p-8 space-y-10 shadow-sm">
              {/* Colors */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black">MÀU SẮC: <span className="text-gray-400 ml-2 font-bold uppercase">{product.colors[0].name}</span></h4>
                </div>
                <div className="flex gap-4">
                  {product.colors.map((color) => (
                    <button 
                      key={color.name}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${color.name === "Đen Carbon" ? "border-black p-1" : "border-transparent hover:border-gray-200"}`}
                    >
                      <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: color.hex }}></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black">KÍCH THƯỚC:</h4>
                  <button className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary hover:text-black hover:border-black transition-colors">Bảng size</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 w-16 rounded-xl font-black text-sm transition-all border-2 border-black active:scale-95 ${selectedSize === size ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-8 pt-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-white border-2 border-black rounded-lg h-12 overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center hover:bg-gray-100 transition-all font-bold text-lg border-r-2 border-black">—</button>
                    <span className="w-14 text-center font-black text-base">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center hover:bg-gray-100 transition-all font-bold text-lg border-l-2 border-black">+</button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> CÒN HÀNG (24 SẢN PHẨM)
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 italic">Miễn phí giao hàng cho đơn từ 500k</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link
                    to="/cart"
                    className="flex-1 h-16 border-2 border-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center"
                  >
                    Thêm vào giỏ
                  </Link>
                  <Link
                    to="/cart"
                    className="flex-1 h-16 bg-black text-white border-2 border-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center"
                  >
                    Mua ngay
                  </Link>
                </div>
              </div>
            </div>

            {/* Service Commitments - KHÔI PHỤC THEO THIẾT KẾ */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t-2 border-black/5">
               <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 bg-orange-50 text-primary rounded-2xl flex items-center justify-center border-2 border-primary/20">
                     <ShieldCheck size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Chính hãng 100%</span>
               </div>
               <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border-2 border-blue-200">
                     <Truck size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Giao 2-4 ngày</span>
               </div>
               <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center border-2 border-green-200">
                     <RefreshCw size={28} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Đổi trả 15 ngày</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Information Section (Shopee/Lazada style) */}
      <section className="mb-24 mt-12 bg-white border-2 border-black rounded-[2.5rem] p-8 shadow-brutal flex flex-col md:flex-row gap-8 items-center">
         <div className="flex items-center gap-6 pr-8 md:border-r-2 md:border-black/5 shrink-0">
            <div className="w-20 h-20 bg-primary rounded-full border-2 border-black overflow-hidden shadow-subtle relative group">
               <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <div>
               <h4 className="text-xl font-serif font-black uppercase tracking-tighter mb-1">UTEShop Official</h4>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase tracking-widest flex items-center gap-1">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Online
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TP. Hồ Chí Minh</span>
               </div>
               <div className="flex gap-2 mt-4">
                  <Link to="/shop/uteshop-official" className="px-5 py-2 bg-black text-white border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2">
                     <Store size={14} /> Xem Shop
                  </Link>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('openChat'))}
                    className="px-5 py-2 border-2 border-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2"
                  >
                     <MessageCircle size={14} /> Chat ngay
                  </button>
               </div>
            </div>
         </div>

         <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {[
              { label: "Đánh giá", value: "4.9/5" },
              { label: "Sản phẩm", value: "128" },
              { label: "Tỉ lệ phản hồi", value: "98%" },
              { label: "Tham gia", value: "4 năm" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center">
                 <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.label}</p>
                 <p className="text-lg font-black tracking-tighter text-black uppercase">{stat.value}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Tabs & Description Container */}
      <section className="mb-32 mt-32 space-y-12">
        {/* Tabs - KHUNG CHIA RÕ RÀNG */}
        <div className="bg-white border-2 border-black rounded-[2rem] p-3 flex gap-4 overflow-x-auto no-scrollbar shadow-subtle">
           {[
             { id: "description", label: "Mô tả sản phẩm" },
             { id: "specs", label: "Thông số kỹ thuật" },
             { id: "returns", label: "Chính sách đổi trả" }
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-black text-white shadow-brutal" : "hover:bg-primary/10 text-gray-500"}`}
             >
               {tab.label}
             </button>
           ))}
        </div>

        {/* Description Box Content */}
        <div className="bg-white border-2 border-black rounded-[3rem] p-12 md:p-20 shadow-brutal relative overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-10">
              <h3 className="text-4xl md:text-5xl font-serif font-black leading-tight tracking-tighter uppercase">Chất liệu cao cấp & <br/> Thiết kế vượt thời gian</h3>
              <p className="text-gray-500 leading-relaxed font-bold text-lg">{product.description}</p>
              <ul className="space-y-6 pt-6">
                 {[
                   "Khả năng giữ ấm tối ưu với lớp lót bông mỏng",
                   "Đường may thủ công tỉ mỉ, độ bền lên đến 5 năm",
                   "Khóa kéo YKK kim loại không gỉ sang trọng",
                   "Hệ thống túi đa năng tiện dụng"
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-6 text-base font-black">
                     <div className="w-4 h-4 bg-primary border-2 border-black rotate-45 shadow-subtle"></div>
                     {item}
                   </li>
                 ))}
              </ul>
            </div>
            <div className="rounded-[3rem] overflow-hidden border-2 border-black shadow-subtle h-[500px] group-hover:shadow-brutal transition-all duration-500">
               <img src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1200" alt="Detail" className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Subtle Background decoration */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-primary/5 -skew-x-12 translate-x-20 pointer-events-none"></div>
        </div>
      </section>

      {/* Related Products */}
      <section className="relative">
        <div className="flex justify-between items-end mb-16">
           <div>
              <span className="badge-brutal bg-primary text-white border-black mb-4 inline-block">CÓ THỂ BẠN THÍCH</span>
              <h2 className="text-5xl font-serif font-black tracking-tighter uppercase">SẢN PHẨM TƯƠNG TỰ</h2>
           </div>
           <div className="flex items-center gap-6">
               <div className="flex gap-3">
                 <button className="w-14 h-14 rounded-2xl border-2 border-black flex items-center justify-center bg-white shadow-subtle hover:bg-primary hover:text-white transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"><ChevronLeft size={24}/></button>
                 <button className="w-14 h-14 rounded-2xl border-2 border-black flex items-center justify-center bg-white shadow-subtle hover:bg-primary hover:text-white transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"><ChevronRight size={24}/></button>
               </div>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
           {relatedProducts.map((p) => (
             <ProductCard key={p.id} {...p} />
           ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
