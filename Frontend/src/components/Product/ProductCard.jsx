import { Link } from "react-router-dom";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import useCartStore from "../../store/cartStore";
import { sanitizeHTML } from "../../utils/security";

const ProductCard = ({ product }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product, 1);
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="card group">
      <div className="relative overflow-hidden aspect-square">
        {discount > 0 && <div className="badge-discount">{discount}% OFF</div>}
        <img
          src={product.image || "https://via.placeholder.com/400"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className="bg-white p-2 rounded-full shadow-md hover:bg-primary-600 hover:text-white transition-colors"
            title="Add to Cart"
          >
            <FiShoppingCart size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              // Wishlist functionality
            }}
            className="bg-white p-2 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
            title="Add to Wishlist"
          >
            <FiHeart size={18} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-primary-600">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full btn-primary text-sm py-2"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
