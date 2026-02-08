import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FiShoppingCart,
  FiHeart,
  FiMinus,
  FiPlus,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import useCartStore from "../store/cartStore";
import Loading from "../components/Common/Loading";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { addItem } = useCartStore();

  useEffect(() => {
    // Simulate API call - Replace with actual API
    setTimeout(() => {
      const mockProduct = {
        id: parseInt(id),
        name: "Premium Running Shoes",
        description:
          "Experience ultimate comfort and style with our premium running shoes. Designed with advanced cushioning technology and breathable materials for maximum performance.",
        price: 89.99,
        originalPrice: 129.99,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
        ],
        sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"],
        colors: ["Black", "White", "Blue", "Red"],
        inStock: true,
        features: [
          "Breathable mesh upper",
          "Advanced cushioning technology",
          "Durable rubber outsole",
          "Lightweight design",
          "Enhanced arch support",
        ],
      };
      setProduct(mockProduct);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addItem({ ...product, selectedSize }, quantity);
    // Show success message or redirect to cart
    navigate("/cart");
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product not found
        </h2>
        <button onClick={() => navigate("/products")} className="btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  return (
    <>
      <Helmet>
        <title>{product.name} - E-Shoe</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="bg-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 ${
                      selectedImage === index
                        ? "border-primary-600"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-primary-600">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Size
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-4 border rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary-600 bg-primary-600 text-white"
                          : "border-gray-300 hover:border-primary-600"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <FiMinus />
                  </button>
                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                  disabled={!product.inStock}
                >
                  <FiShoppingCart />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
                <button className="px-6 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg transition-colors flex items-center justify-center">
                  <FiHeart size={20} />
                </button>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                
              </div>

              {/* Product Features */}
              {product.features && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <span className="text-primary-600">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
