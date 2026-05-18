import { Link } from "react-router-dom";
import { ShoppingBag, ShoppingCart, Search, ChevronDown, User } from "lucide-react";
import { useAppSelector } from "@/stores/hooks";
import useAuth from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

const Header = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { isAuthenticated } = useAuth();

  const categories = [
    { name: "Áo", items: ["Áo thun", "Áo sơ mi", "Áo khoác", "Áo len", "Áo hoodie"] },
    { name: "Quần", items: ["Quần jeans", "Quần tây", "Quần short", "Quần kaki"] },
    { name: "Phụ kiện", items: ["Túi xách", "Thắt lưng", "Mũ", "Vớ", "Trang sức"] },
    { name: "Bộ sưu tập", items: ["Mùa hè rực rỡ", "Thu đông 2024", "Tối giản", "Cổ điển"] },
  ];

  return (
    <header className="w-full bg-white border-b-2 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-10">
        {/* Logo - Sửa lại màu Cam cho cả Icon và Chữ */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary text-white border-2 border-black rounded-2xl flex items-center justify-center group-hover:bg-black transition-all shadow-subtle group-hover:shadow-none">
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <span className="font-serif text-2xl font-black tracking-tighter text-primary uppercase group-hover:text-black transition-colors">UTEShop</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/products" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">NAM</Link>
          <Link to="/products" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">NỮ</Link>
          
          <div className="relative group py-8">
            <button className="flex items-center gap-1 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
              DANH MỤC <ChevronDown size={14} />
            </button>
            <div className="mega-menu left-[-250px] w-[900px]">
              <div className="grid grid-cols-4 gap-12 p-10 max-w-6xl mx-auto">
                {categories.map((cat) => (
                  <div key={cat.name}>
                    <h4 className="font-black text-black mb-6 pb-2 border-b-2 border-black uppercase text-[10px] tracking-widest">
                      {cat.name}
                    </h4>
                    <ul className="space-y-4">
                      {cat.items.map((item) => (
                        <li key={item}>
                          <Link to="/products" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-300 rounded-full group-hover:bg-primary transition-all"></div>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link to="#" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">BỘ SƯU TẬP</Link>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative hidden md:block group/search">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="input-brutal h-11 pl-12"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-primary transition-colors" size={18} strokeWidth={2.5} />
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4 shrink-0">
          <Link
            to="/cart"
            className="relative w-11 h-11 bg-white border-2 border-black rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-subtle hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <ShoppingCart size={22} strokeWidth={2.5} />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-lg border-2 border-black shadow-subtle">
              3
            </span>
          </Link>
          
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
              className="w-11 h-11 bg-white border-2 border-black rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-subtle hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
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
