import ProductCard from "@/components/ui/ProductCard";
import { ChevronDown, LayoutGrid, List, SlidersHorizontal, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const ProductListPage = () => {
  const [priceRange, setPriceRange] = useState({ min: 200000, max: 2000000 });
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const products = Array(12).fill(null).map((_, i) => ({
    id: `${i + 1}`,
    name: i % 2 === 0 ? "Áo Thun Oversize 'Modern Retro' Cotton" : "Quần Jeans Slim-fit Denim Indigo",
    price: i % 2 === 0 ? 450000 : 890000,
    originalPrice: i % 3 === 0 ? (i % 2 === 0 ? 550000 : 1100000) : undefined,
    image: i % 2 === 0 
      ? "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800"
      : "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800",
    category: i % 2 === 0 ? "Áo" : "Quần",
    rating: 4.5 + (Math.random() * 0.5),
    sales: 100 + Math.floor(Math.random() * 900),
    badge: i % 4 === 0 ? "Mới" : i % 5 === 0 ? "Sale" : undefined as any,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-gray-400">
        <Link to="/" className="hover:text-primary transition-colors">TRANG CHỦ</Link>
        <span className="text-black">/</span>
        <span className="text-black">SẢN PHẨM</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters - KHÔI PHỤC THEO THIẾT KẾ */}
        <aside className="lg:w-80 shrink-0 space-y-12">
          <div className="bg-white border-2 border-black p-8 rounded-3xl shadow-brutal space-y-12">
            <h2 className="font-serif font-black text-2xl uppercase tracking-tighter flex items-center gap-3">
              <SlidersHorizontal size={24} /> BỘ LỌC
            </h2>

            {/* Giới tính */}
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Giới tính</h3>
              <div className="space-y-4">
                {["Nam", "Nữ", "Unisex"].map((g) => (
                  <label key={g} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="hidden" />
                    <div className="w-5 h-5 rounded-md border-2 border-black flex items-center justify-center transition-all bg-white group-hover:border-primary">
                      <div className="w-2.5 h-2.5 bg-primary rounded-sm opacity-0 group-hover:opacity-10"></div>
                    </div>
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Danh mục */}
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Danh mục</h3>
              <div className="space-y-4">
                {["Áo", "Quần", "Váy", "Phụ kiện"].map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center transition-all ${cat === "Áo" ? "bg-black shadow-subtle" : "bg-white group-hover:border-primary"}`}>
                      {cat === "Áo" && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Khoảng giá */}
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Khoảng giá</h3>
              <div className="space-y-8">
                <div className="relative h-2 bg-gray-100 border-2 border-black rounded-full overflow-hidden">
                   <div className="absolute left-[10%] right-[30%] top-0 bottom-0 bg-primary"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input type="number" value={priceRange.min} className="input-brutal text-xs py-2 h-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">₫</span>
                  </div>
                  <span className="font-black text-gray-300">—</span>
                  <div className="flex-1 relative">
                    <input type="number" value={priceRange.max} className="input-brutal text-xs py-2 h-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">₫</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kích cỡ */}
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Kích cỡ</h3>
              <div className="grid grid-cols-4 gap-3">
                {["S", "M", "L", "XL"].map((size) => (
                  <button key={size} className={`h-11 border-2 border-black rounded-2xl text-xs font-black transition-all active:scale-95 ${size === "M" ? "bg-black text-white shadow-subtle" : "bg-white hover:border-primary hover:text-primary hover:bg-primary/5 active:shadow-none"}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-brutal w-full mt-4 text-xs uppercase tracking-widest h-14 shadow-subtle">
                ÁP DỤNG
            </button>
          </div>

          {/* Promo Card in Sidebar - KHÔI PHỤC THEO THIẾT KẾ */}
          <div className="bg-primary text-white p-8 rounded-3xl shadow-brutal border-2 border-black relative overflow-hidden group">
             <div className="relative z-10">
                <Tag className="mb-4" />
                <h4 className="text-2xl font-serif font-black uppercase tracking-tighter mb-4 leading-tight">Ưu đãi đặc biệt khi mua combo</h4>
                <p className="text-sm font-bold opacity-80 mb-8 leading-relaxed">Giảm thêm 10% khi mua từ 3 sản phẩm bất kỳ.</p>
                <button className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-subtle active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">Mua ngay</button>
             </div>
             <div className="absolute -right-8 -bottom-8 text-[12rem] font-black opacity-10 rotate-12 group-hover:rotate-0 transition-all duration-700 select-none">%</div>
          </div>
        </aside>

        {/* Product Listing Area */}
        <main className="flex-1">
          {/* Top Bar Banner - KHÔI PHỤC THEO THIẾT KẾ */}
          <div className="bg-white border-2 border-black rounded-2xl p-10 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-brutal relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-5xl font-serif font-black mb-3 tracking-tighter uppercase">Sản phẩm <span className="text-primary underline italic">Tất cả</span></h1>
              <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Tìm thấy <span className="text-black">128</span> thiết kế độc bản</p>
            </div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border-2 border-black shadow-subtle">
                <button 
                  onClick={() => setViewType("grid")}
                  className={`p-3 rounded-2xl transition-all active:scale-95 ${viewType === "grid" ? "bg-black text-white shadow-subtle" : "text-gray-400 hover:text-primary hover:bg-primary/5"}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button 
                   onClick={() => setViewType("list")}
                   className={`p-3 rounded-2xl transition-all active:scale-95 ${viewType === "list" ? "bg-black text-white shadow-subtle" : "text-gray-400 hover:text-primary hover:bg-primary/5"}`}
                >
                  <List size={20} />
                </button>
              </div>
              
              <button className="btn-brutal-secondary h-16 px-8 text-xs uppercase tracking-widest flex items-center gap-2 shadow-subtle hover:shadow-none">
                SẮP XẾP <ChevronDown size={14} />
              </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-primary/5 -skew-x-12 translate-x-20"></div>
          </div>

          {/* Product Grid */}
          <div className={`grid gap-12 ${viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-20 flex items-center justify-center gap-6">
            <button className="w-14 h-14 rounded-2xl border-2 border-black flex items-center justify-center bg-white shadow-subtle hover:bg-primary hover:text-white transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
               <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            
            <div className="flex gap-3">
               {[1, 2, 3, "...", 12].map((p, i) => (
                  <button key={i} className={`w-14 h-14 rounded-2xl border-2 border-black font-black text-lg transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${p === 1 ? "bg-black text-white shadow-subtle" : "bg-white hover:bg-primary hover:text-white shadow-subtle"}`}>
                    {p}
                  </button>
               ))}
            </div>

            <button className="w-14 h-14 rounded-2xl border-2 border-black flex items-center justify-center bg-white shadow-subtle hover:bg-primary hover:text-white transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
               <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductListPage;
