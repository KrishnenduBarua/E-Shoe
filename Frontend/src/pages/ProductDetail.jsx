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
  FiShoppingBag,
} from "react-icons/fi";
import useCartStore from "../store/cartStore";
import Loading from "../components/Common/Loading";
import { getImageUrl } from "../utils/imageHelper";
import DirectOrderModal from "../components/Product/DirectOrderModal";
import { api } from "../utils/api";
import { transformProduct } from "../utils/transformers";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.products.getById(id);
        const transformedProduct = transformProduct(response.data.data);
        setProduct(transformedProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
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

  const handleOrderNow = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    setShowOrderModal(true);
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
        <title>{product.name} - Flick</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="bg-white py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                <img
                  src={getImageUrl(product.images[selectedImage])}
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
                        ? "border-black"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
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
                <span className="text-3xl font-bold text-black">
                  ${product.price}
                </span>
                {product.originalPrice && discount > 0 && (
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
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black"
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

              {/* Bkash Payment Info */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://cdn.icon-icons.com/icons2/2699/PNG/512/bkash_logo_icon_211914.png" 
                    alt="Bkash Logo"
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <div className="text-sm text-gray-600">
                      For Bkash Payment
                    </div>
                    <div className="text-lg font-bold text-pink-600">
                      01841-793410
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 mb-8">
                <div className="flex gap-3">
                  <button
                    onClick={handleOrderNow}
                    className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    disabled={!product.inStock}
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    {product.inStock ? "Order Now" : "Out of Stock"}
                  </button>
                  <button className="px-6 border-2 border-black text-black hover:bg-black hover:text-white rounded-lg transition-colors flex items-center justify-center">
                    <FiHeart size={20} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full border-2 border-black text-black py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  disabled={!product.inStock}
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-gray-200"></div>

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
                        <span className="text-black">✓</span>
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

      {/* Direct Order Modal */}
      <DirectOrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        product={product}
        quantity={quantity}
        selectedSize={selectedSize}
        selectedColor={product.colors?.[0]}
      />
    </>
  );
};

export default ProductDetail;
