import { useState } from "react";
import { FiX, FiShoppingBag, FiTruck, FiCheck } from "react-icons/fi";
import {
  sanitizeInput,
  validateEmail,
  validatePhone,
} from "../../utils/security";

const DirectOrderModal = ({
  isOpen,
  onClose,
  product,
  quantity,
  selectedSize,
  selectedColor,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "COD",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Full name is required (minimum 3 characters)";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.address || formData.address.length < 10) {
      newErrors.address =
        "Complete address is required (minimum 10 characters)";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "State/District is required";
    }

    if (!formData.zipCode) {
      newErrors.zipCode = "Zip/Postal code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { api } = await import("../../utils/api");

      const orderData = {
        productId: product.id,
        quantity,
        selectedSize,
        selectedColor,
        shippingInfo: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await api.orders.createDirect(orderData);

      // Success - show confirmation with order instructions
      const orderNumber = response.data.data.orderNumber;
      const successMessage = `
🎉 Order Placed Successfully!

Order Number: ${orderNumber}
Total Amount: $${response.data.data.total.toFixed(2)}

📞 What's Next?
Our team will call you at ${formData.phone} to confirm:
• Delivery address
• Payment method
• Delivery time

Please keep your phone accessible. Thank you for shopping with us!
      `.trim();

      alert(successMessage);
      onClose();

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        paymentMethod: "COD",
        notes: "",
      });
    } catch (error) {
      console.error("Order failed:", error);
      alert(
        error.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPrice = product.price * quantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Now</h3>
                <p className="text-sm text-gray-600">
                  Fill in your delivery details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <img
                src={
                  product.image || product.images?.[0]
                    ? `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}${product.image || product.images?.[0]}`
                    : "https://via.placeholder.com/80"
                }
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span>Size: {selectedSize || "N/A"}</span>
                  {selectedColor && <span>• Color: {selectedColor}</span>}
                  <span>• Qty: {quantity}</span>
                </div>
                <p className="mt-1 text-lg font-bold text-black">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-4 max-h-[60vh] overflow-y-auto"
          >
            <div className="space-y-4">
              {/* Contact Information */}
              <div>
                <h4 className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900">
                  <FiCheck className="text-black" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 8900"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900">
                  <FiTruck className="text-black" />
                  Delivery Address
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complete Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House/Flat no, Street, Area"
                      rows="2"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      }`}
                    ></textarea>
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                          errors.state ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.state && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="12345"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent ${
                          errors.zipCode ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.zipCode && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, paymentMethod: "COD" }))
                    }
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.paymentMethod === "COD"
                        ? "border-black bg-gray-100 text-black"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Pay when you receive
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: "Card",
                      }))
                    }
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.paymentMethod === "Card"
                        ? "border-black bg-gray-100 text-black"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold">Card Payment</div>
                    <div className="text-xs text-gray-600 mt-1">Pay online</div>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for delivery..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-black">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Order Verification Notice */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <FiCheck
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                  size={18}
                />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">
                    Order Verification Process
                  </p>
                  <p>
                    Our team will call you within 24 hours to confirm your order
                    details and delivery information.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Confirm Order"}
              </button>
            </div>
            <p className="mt-3 text-xs text-center text-gray-500">
              By placing this order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectOrderModal;
