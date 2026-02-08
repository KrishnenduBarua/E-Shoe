import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiHeart,
} from "react-icons/fi";
import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";
import { sanitizeInput } from "../../utils/security";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const sanitized = sanitizeInput(searchQuery);
    if (sanitized.trim()) {
      navigate(`/products?search=${encodeURIComponent(sanitized)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const categories = [
    { name: "Men's Shoes", path: "/products/mens" },
    { name: "Women's Shoes", path: "/products/womens" },
    { name: "Sports", path: "/products/sports" },
    { name: "Casual", path: "/products/casual" },
    { name: "Formal", path: "/products/formal" },
    { name: "Sneakers", path: "/products/sneakers" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container-custom flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:underline">
              About
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-custom py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-3xl font-bold text-primary-600">E-Shoe</div>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                maxLength={100}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <FiSearch size={20} />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden text-gray-700 hover:text-primary-600 transition-colors"
            >
              <FiSearch size={24} />
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="hidden sm:flex text-gray-700 hover:text-primary-600 transition-colors"
              >
                <FiHeart size={24} />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-primary-600 transition-colors"
            >
              <FiShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                <FiUser size={24} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.phoneNumber}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                maxLength={100}
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-gray-600 hover:text-primary-600"
              >
                <FiSearch size={20} />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className="bg-gray-50 border-t border-gray-200">
        <div className="container-custom">
          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center justify-center gap-8 py-3">
            {categories.map((category) => (
              <li key={category.path}>
                <Link
                  to={category.path}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <ul className="lg:hidden py-4 space-y-2">
              {categories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="block py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
