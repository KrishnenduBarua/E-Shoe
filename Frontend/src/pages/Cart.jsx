import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";
import useCartStore from "../store/cartStore";

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, clearCart } =
    useCartStore();

  const subtotal = getTotal();
  const shipping = 120;
  const tax = 0;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - Flick</title>
        </Helmet>
        <div className="container-custom py-16 text-center">
          <FiShoppingBag className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some products to get started!
          </p>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${items.length || 0}) - Flick`}</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize || ""}`}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-600 mb-2">
                          Size: {item.selectedSize}
                        </p>
                      )}
                      <p className="text-lg font-bold text-black">
                        ${item.price}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id, item.selectedSize)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Remove item"
                      >
                        <FiTrash2 size={20} />
                      </button>

                      <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.selectedSize,
                              item.quantity - 1,
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.selectedSize,
                              item.quantity + 1,
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>

                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-semibold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      ${shipping.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-black">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full btn-primary mb-3"
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/products"
                  className="block w-full text-center btn-secondary"
                >
                  Continue Shopping
                </Link>

                {/* Security Badges */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-600">✓</span>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-600">✓</span>
                    <span>30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-600">✓</span>
                    <span>Flat shipping rate $120</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
