import { Star, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  sales: number;
  badge?: "Mới" | "Hot" | "Sale";
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  category,
  rating,
  sales,
  badge,
}: ProductCardProps) => {
  return (
    <div className="group relative flex flex-col bg-white border-2 border-black shadow-subtle rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px]">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 border-b-2 border-black">
        <Link to={`/products/${id}`}>
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        {badge && (
          <div className="absolute top-4 left-4">
            <span className={`badge-brutal ${
              badge === "Hot" ? "bg-red-500 text-white" : badge === "Sale" ? "bg-orange-500 text-white" : "bg-white text-black"
            }`}>
              {badge}
            </span>
          </div>
        )}

        {/* Quick Add Button */}
        <button className="absolute bottom-4 right-4 w-11 h-11 bg-white text-black border-2 border-black rounded-xl flex items-center justify-center opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-primary hover:text-white hover:shadow-subtle active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Info Container */}
      <div className="p-5 flex flex-col space-y-2">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          {category}
        </p>
        
        <Link to={`/products/${id}`} className="text-sm font-bold text-black line-clamp-1 hover:text-primary transition-colors">
          {name}
        </Link>

        {/* Rating & Sales */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-bold border-l border-gray-200 pl-3">
            Đã bán {sales > 1000 ? `${(sales / 1000).toFixed(1)}k` : sales}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-base font-black text-primary">
            {price.toLocaleString()}₫
          </span>
          {originalPrice && (
            <span className="text-xs text-gray-300 line-through decoration-black/10">
              {originalPrice.toLocaleString()}₫
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
