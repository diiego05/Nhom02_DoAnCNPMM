import React, { useState } from 'react';
import { 
  Store, 
  Star, 
  Users, 
  MessageCircle, 
  Plus, 
  ChevronRight, 
  Search, 
  Filter, 
  ArrowUpRight,
  ShoppingBag,
  Heart,
  Share2,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorShopPage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isFollowed, setIsFollowed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans pb-20">
      {/* 1. KHỐI THÔNG TIN SHOP (Shop Hero Section) */}
      <section className="pt-10 px-6 max-w-7xl mx-auto">
        <div className="bg-white border-[3px] border-black rounded-[2.5rem] p-8 shadow-brutal flex flex-col md:flex-row gap-8 items-stretch">
          {/* Left: Profile Information */}
          <div className="flex-grow flex items-center gap-6 pr-8 md:border-r-2 md:border-black/5">
            <div className="relative shrink-0">
               <div className="w-28 h-28 bg-primary rounded-full border-[3px] border-black overflow-hidden shadow-subtle">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-black text-white px-3 py-1 rounded-full border-2 border-white text-[8px] font-black uppercase tracking-widest shadow-sm">
                  Official
               </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-serif font-black tracking-tighter uppercase">UTEShop Official</h1>
                <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-lg border-2 border-black shadow-subtle uppercase tracking-widest">
                   Yêu Thích
                </span>
              </div>
              <p className="text-gray-500 font-medium text-sm italic">"Phong cách tối giản cho tâm hồn hiện đại."</p>
              
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => setIsFollowed(!isFollowed)}
                  className={`px-8 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${isFollowed ? 'bg-gray-100' : 'bg-black text-white hover:bg-primary'}`}
                >
                  {isFollowed ? <span className="flex items-center gap-2"><Check size={14} /> ĐÃ THEO DÕI</span> : '+ THEO DÕI'}
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('openChat'))}
                  className="px-6 py-3 border-2 border-black rounded-xl font-black text-xs uppercase tracking-widest bg-white hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2"
                >
                  <MessageCircle size={16} /> Chat ngay
                </button>
                <button className="p-3 border-2 border-black rounded-xl hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Statistics Bento Grid */}
          <div className="grid grid-cols-2 gap-4 shrink-0 md:w-80">
            {[
              { label: "Đánh giá", value: "4.9/5", icon: <Star size={12} className="fill-primary text-primary" />, sub: "(12.4k đánh giá)" },
              { label: "Người theo dõi", value: "85.2k", icon: <Users size={12} />, sub: "+1.2k tháng này" },
              { label: "Tỉ lệ phản hồi", value: "98%", icon: <MessageCircle size={12} />, sub: "(Trong vài giờ)" },
              { label: "Tham gia", value: "4 năm", icon: <Clock size={12} />, sub: "Từ T5/2020" }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 border-2 border-black/5 rounded-2xl p-4 flex flex-col justify-between group hover:border-black/20 transition-all">
                <div className="flex justify-between items-start">
                   <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{stat.label}</span>
                   <div className="text-gray-400 group-hover:text-primary transition-colors">{stat.icon}</div>
                </div>
                <div>
                   <p className="text-lg font-black tracking-tighter">{stat.value}</p>
                   <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. KHỐI MÃ GIẢM GIÁ (Shop Vouchers) */}
      <section className="pt-12 px-6 max-w-7xl mx-auto relative z-10">
         <div className="flex gap-6 overflow-x-auto pt-4 pb-4 scrollbar-hide">
            {[
              { amount: "20K", min: "200K", color: "bg-orange-50", borderColor: "border-orange-200" },
              { amount: "50K", min: "500K", color: "bg-blue-50", borderColor: "border-blue-200" },
              { amount: "100K", min: "1.5M", color: "bg-purple-50", borderColor: "border-purple-200" },
              { amount: "15%", min: "0", color: "bg-green-50", borderColor: "border-green-200" }
            ].map((v, i) => (
              <div key={i} className={`min-w-[280px] ${v.color} border-2 border-black rounded-2xl p-5 flex items-center gap-4 relative shadow-subtle hover:-translate-y-1 transition-all cursor-pointer group`}>
                 {/* Răng cưa xé rách giả lập bằng Mask hoặc bo góc đặc biệt */}
                 <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-[#F4F4F0] border-2 border-black rounded-full"></div>
                 <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-[#F4F4F0] border-2 border-black rounded-full"></div>
                 
                 <div className="flex flex-col flex-grow pl-2">
                    <span className="text-2xl font-black tracking-tighter uppercase">Giảm {v.amount}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Đơn tối thiểu ₫{v.min}</span>
                 </div>
                 <button className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all group-hover:bg-primary">Lưu mã</button>
              </div>
            ))}
         </div>
      </section>

      {/* 3. THANH ĐIỀU HƯỚNG SHOP (Shop Navigation Tabs) */}
      <section className="sticky top-20 z-40 bg-[#F4F4F0]/80 backdrop-blur-md pt-4 border-b-2 border-black/5 mb-8">
         <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex gap-2">
               {[
                 { id: "home", label: "Trang chủ Shop" },
                 { id: "all", label: "Tất cả sản phẩm" },
                 { id: "tops", label: "Áo Nam" },
                 { id: "dresses", label: "Váy Nữ" },
                 { id: "new", label: "Hàng mới về" }
               ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-black' : 'text-gray-400 hover:text-black'}`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>
            <div className="relative w-64 pb-2">
               <input type="text" placeholder="Tìm tại shop này..." className="w-full bg-white border-2 border-black rounded-xl px-10 py-2.5 text-xs font-bold focus:outline-none shadow-inner" />
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 -mt-1 text-gray-400" size={16} />
            </div>
         </div>
      </section>

      {/* 4. TRANG CHỦ SHOP Content (Lookbook & Featured) */}
      <main className="px-6 max-w-7xl mx-auto space-y-16">
         {activeTab === "home" && (
           <>
             {/* Bento Grid Featured */}
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                {/* Lookbook Big Card */}
                <div className="lg:col-span-8 bg-white border-[3px] border-black rounded-[3rem] overflow-hidden relative group shadow-brutal min-h-[400px]">
                   <img 
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt="Featured Lookbook"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   <div className="absolute bottom-12 left-12 text-white">
                      <span className="bg-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block">Mùa Hè 2024</span>
                      <h2 className="text-7xl font-serif font-black tracking-tighter uppercase leading-none mb-6">Mùa Hè <br/> Vẫy Gọi</h2>
                      <button className="px-10 py-4 bg-white text-black border-2 border-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all active:translate-x-1 active:translate-y-1">Khám phá bộ sưu tập</button>
                   </div>
                </div>

                {/* Hot Products Column */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                   {[1, 2].map(i => (
                     <div key={i} className="flex-grow bg-white border-[3px] border-black rounded-[2.5rem] p-6 shadow-brutal flex flex-col group relative">
                        <div className="absolute top-6 left-6 z-10">
                           <span className="bg-black text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest">TOP {i} BÁN CHẠY</span>
                        </div>
                        <div className="flex-grow bg-gray-50 rounded-2xl overflow-hidden mb-4 border border-black/5">
                           <img 
                            src={i === 1 ? "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400" : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400"} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                           />
                        </div>
                        <div>
                           <h4 className="text-sm font-black uppercase tracking-tight mb-1 truncate">{i === 1 ? 'Heritage Jacket V.01' : 'Minimalist Linen Shirt'}</h4>
                           <div className="flex items-center justify-between">
                              <span className="text-lg font-black text-primary">₫1.250.000</span>
                              <button className="w-10 h-10 border-2 border-black rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"><Plus size={20}/></button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* 5. LƯỚI SẢN PHẨM CỦA SHOP (Shop Products Grid) */}
             <div className="space-y-8 pt-10">
                <div className="flex justify-between items-end">
                   <div className="space-y-2">
                      <h3 className="text-3xl font-serif font-black uppercase tracking-tighter">Gợi ý cho bạn</h3>
                      <div className="w-20 h-2 bg-black"></div>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex bg-white border-2 border-black rounded-xl p-1 shadow-subtle">
                         {["Mới nhất", "Bán chạy", "Giá thấp", "Giá cao"].map((sort, i) => (
                           <button key={i} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${i === 0 ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>{sort}</button>
                         ))}
                      </div>
                      <button className="px-6 py-2 border-2 border-black rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-subtle active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                         <Filter size={16} /> Bộ lọc
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                      <div key={i} className="bg-white border-2 border-black rounded-[2rem] p-4 shadow-subtle hover:shadow-brutal transition-all group flex flex-col relative overflow-hidden">
                        {/* Tags */}
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                           <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded border-2 border-black uppercase tracking-widest shadow-sm">-{i*5}%</span>
                           {i % 3 === 0 && <span className="bg-green-500 text-white text-[8px] font-black px-2 py-1 rounded border-2 border-black uppercase tracking-widest shadow-sm">Mới</span>}
                        </div>
                        <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur-md border-2 border-black rounded-lg flex items-center justify-center hover:bg-primary transition-all active:scale-90">
                           <Heart size={14} />
                        </button>

                        {/* Image */}
                        <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden mb-4 border border-black/5">
                           <img 
                            src={`https://images.unsplash.com/photo-${1515886657613 + i*1000}-9f3515b0c78f?q=80&w=400`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                           />
                        </div>

                        {/* Info */}
                        <div className="flex-grow flex flex-col gap-2 relative z-0">
                           <h4 className="text-[11px] font-black uppercase tracking-tight leading-tight line-clamp-2 min-h-[2rem]">Vintage Aesthetic Overcoat Collection - Ver.0{i}</h4>
                           <div className="flex items-baseline gap-2">
                              <span className="text-sm font-black text-primary">₫{(850000 - i*20000).toLocaleString()}</span>
                              <span className="text-[10px] font-bold text-gray-300 line-through">₫1.200.000</span>
                           </div>
                           <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5">
                              <div className="flex items-center gap-1">
                                 <div className="flex">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={8} className="fill-yellow-400 text-yellow-400" />)}
                                 </div>
                                 <span className="text-[8px] font-bold text-gray-400">(240)</span>
                              </div>
                              <span className="text-[8px] font-black uppercase text-gray-400">Đã bán {i*120}</span>
                           </div>
                        </div>

                        {/* Add to cart hover button */}
                        <button className="absolute bottom-4 right-4 bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black shadow-subtle translate-y-16 group-hover:translate-y-0 transition-all hover:bg-primary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                           <Plus size={20} />
                        </button>
                      </div>
                   ))}
                </div>

                <div className="flex justify-center pt-10">
                   <button className="px-12 py-5 border-4 border-black rounded-[2rem] font-black text-sm uppercase tracking-widest bg-white hover:bg-primary hover:text-white transition-all shadow-brutal active:shadow-none active:translate-x-1 active:translate-y-1">
                      Xem thêm sản phẩm
                   </button>
                </div>
             </div>
           </>
         )}
      </main>

      {/* 6. FOOTER MINI (Shop Info) */}
      <footer className="mt-20 border-t-2 border-black/5 pt-20 pb-10 bg-white">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-10">
            <div className="col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-black">UT</div>
                  <h3 className="text-2xl font-serif font-black uppercase tracking-tighter">UTEShop Official</h3>
               </div>
               <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                  Chúng tôi mang đến những giải pháp thời trang tối giản nhưng đầy cá tính. Mỗi sản phẩm đều được chăm chút kỹ lưỡng từ chất liệu đến đường may để mang lại trải nghiệm tốt nhất cho bạn.
               </p>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase">
                     <ShieldCheck size={18} className="text-primary" /> 100% Chính hãng
                  </div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase">
                     <ShieldCheck size={18} className="text-primary" /> 15 ngày đổi trả
                  </div>
               </div>
            </div>
            <div className="space-y-4">
               <h5 className="font-black uppercase text-xs tracking-widest">Danh mục phổ biến</h5>
               <ul className="space-y-2 text-sm font-medium text-gray-500">
                  <li className="hover:text-black transition-colors cursor-pointer underline underline-offset-4">Áo khoác Heritage</li>
                  <li className="hover:text-black transition-colors cursor-pointer underline underline-offset-4">Sơ mi Linen</li>
                  <li className="hover:text-black transition-colors cursor-pointer underline underline-offset-4">Quần Tây Minimal</li>
                  <li className="hover:text-black transition-colors cursor-pointer underline underline-offset-4">Phụ kiện Da thật</li>
               </ul>
            </div>
            <div className="space-y-4 text-right">
               <h5 className="font-black uppercase text-xs tracking-widest">Địa chỉ cửa hàng</h5>
               <p className="text-sm font-medium text-gray-500">
                  Số 1, Võ Văn Ngân, TP. Thủ Đức <br/>
                  Thành phố Hồ Chí Minh, Việt Nam
               </p>
               <div className="flex justify-end gap-3 pt-4">
                  <div className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-all"><Users size={18}/></div>
                  <div className="w-10 h-10 border-2 border-black rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-all"><Store size={18}/></div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default VendorShopPage;
