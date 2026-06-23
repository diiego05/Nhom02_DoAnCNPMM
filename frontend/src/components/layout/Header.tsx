import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ShoppingCart, Search, ChevronDown, User, ShieldCheck } from "lucide-react";
import { useAppSelector } from "@/stores/hooks";
import useAuth from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCategories, useProducts } from "@/hooks/useProducts";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

const Header = () => {
  const user = useAppSelector((state) => state.auth.user);
  const itemCount = useAppSelector((state) => state.cart.itemCount);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isManager =
    (typeof user?.role === "string"
      ? user.role.toLowerCase() === "manager"
      : user?.role?.role_name?.toLowerCase() === "manager") || user?.email?.includes("manager");

  const isAdmin =
    (typeof user?.role === "string"
      ? user.role.toLowerCase() === "admin"
      : user?.role?.role_name?.toLowerCase() === "admin") || user?.email?.includes("admin");
  
  // Gọi useCart để fetch data (enabled: isAuthenticated được set trong hook nếu cần)
  useCart();

  // Categories
  const { data: categoryList } = useCategories();
  const parentCategories = categoryList?.filter((c: any) => !c.parent_id) || [];

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults } = useProducts({ keyword: debouncedSearch, limit: 5 });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-black/10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-10">
        {/* Logo - Sửa lại màu Cam cho cả Icon và Chữ */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary text-white border-2 border-black/10 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all shadow-sm">
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <span className="font-serif text-2xl font-black tracking-tighter text-primary uppercase group-hover:text-black transition-colors">UTEShop</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/products?page=1&gender=MALE" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">NAM</Link>
          <Link to="/products?page=1&gender=FEMALE" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">NỮ</Link>
          
          <div className="relative group py-8">
            <button className="flex items-center gap-1 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
              DANH MỤC <ChevronDown size={14} />
            </button>
            <div className="mega-menu left-[-250px] w-[900px]">
              <div className="grid grid-cols-4 gap-12 p-10 max-w-6xl mx-auto">
                {parentCategories.map((parent: any) => {
                  const subCats = categoryList?.filter((c: any) => c.parent_id === parent.id) || [];
                  return (
                  <div key={parent.id}>
                    <h4 className="font-black text-black mb-6 pb-2 border-b border-black/10 uppercase text-[10px] tracking-widest hover:text-primary transition-colors">
                      <Link to={`/products?page=1&category=${parent.slug}`}>{parent.name}</Link>
                    </h4>
                    <ul className="space-y-4">
                      {subCats.map((sub: any) => (
                        <li key={sub.id}>
                          <Link to={`/products?page=1&category=${sub.slug}`} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-300 rounded-full group-hover:bg-primary transition-all"></div>
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )})}
              </div>
            </div>
          </div>

          <Link to="/products" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">BỘ SƯU TẬP</Link>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block group/search">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="input-brutal w-full h-11 pl-12"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-primary transition-colors cursor-pointer" size={18} strokeWidth={2.5} onClick={handleSearchSubmit} />
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchTerm.trim() && searchResults?.products && searchResults.products.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-black rounded-xl shadow-brutal p-2 z-50">
              {searchResults.products.map((product: any) => (
                <Link key={product.id} to={`/products/${product.slug}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                  <img src={product.images?.[0]?.image_url || "/placeholder.jpg"} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">{product.name}</p>
                    <p className="text-[10px] text-primary font-bold">{product.sale_price ? product.sale_price.toLocaleString() : product.price.toLocaleString()}₫</p>
                  </div>
                </Link>
              ))}
              <Link to={`/products?keyword=${encodeURIComponent(searchTerm.trim())}`} className="block w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg mt-2">
                Xem tất cả kết quả
              </Link>
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4 shrink-0">
          <Link
            to="/cart"
            className="relative w-11 h-11 bg-white border border-black/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-transparent transition-all shadow-sm hover:shadow-subtle hover:-translate-y-1 active:scale-95"
          >
            <ShoppingCart size={22} strokeWidth={2.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] px-1 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-lg shadow-sm border border-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated && (isManager || isAdmin) && (
            <Link
              to="/manager"
              title="Manager Dashboard"
              className="w-11 h-11 bg-black text-white border-2 border-black rounded-xl flex items-center justify-center hover:bg-primary transition-all shadow-sm hover:shadow-subtle hover:-translate-y-1 active:scale-95 shrink-0"
            >
              <ShieldCheck size={22} strokeWidth={2.5} />
            </Link>
          )}
          
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="w-11 h-11 rounded-xl border-2 border-black overflow-hidden shadow-subtle hover:border-primary transition-all"
            >
              <img
                src={user?.avatarUrl?.startsWith("http") ? user.avatarUrl : `${API_URL}${user?.avatarUrl}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="w-11 h-11 bg-white border border-black/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white hover:border-transparent transition-all shadow-sm hover:shadow-subtle hover:-translate-y-1 active:scale-95"
            >
              <User size={22} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
