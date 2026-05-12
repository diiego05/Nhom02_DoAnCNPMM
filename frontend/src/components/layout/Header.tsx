import { Link } from "react-router-dom";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useAppSelector } from "@/stores/hooks";
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";
const Header = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <header className="w-full bg-white border-b-2 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center space-x-2 text-primary">
            <ShoppingBag className="w-8 h-8" />
            <span className="font-serif text-3xl font-bold">UTEShop</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="#"
              className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors"
            >
              BỘ SƯU TẬP
            </Link>
            <Link
              to="#"
              className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors"
            >
              NAM
            </Link>
            <Link
              to="#"
              className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors"
            >
              NỮ
            </Link>
            <Link
              to="#"
              className="text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors text-red-600"
            >
              GIẢM GIÁ
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-6">
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ShoppingCart size={24} />
            <span className="absolute top-0 right-0 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
              0
            </span>
          </button>

          <Link
            to="/profile"
            className="w-10 h-10 rounded-full border-2 border-black overflow-hidden hover:shadow-brutal transition-all"
          >
            <img
              src={
                user?.avatarUrl
                  ? user.avatarUrl.startsWith("http")
                    ? user.avatarUrl
                    : `${API_URL}${user.avatarUrl}`
                  : "https://i.pravatar.cc/150?img=47"
              }
              alt={user?.fullName || "User"}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
