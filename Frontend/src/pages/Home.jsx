import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import ProductGrid from "../components/Product/ProductGrid";
import CategoryCard from "../components/Product/CategoryCard";
import Loading from "../components/Common/Loading";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topSelling, setTopSelling] = useState([]);

  useEffect(() => {
    // Simulate API call - Replace with actual API calls
    setTimeout(() => {
      // Mock categories
      setCategories([
        {
          id: 1,
          name: "Men's Shoes",
          slug: "mens",
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        },
        {
          id: 2,
          name: "Women's Shoes",
          slug: "womens",
          image:
            "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
        },
        {
          id: 3,
          name: "Sports",
          slug: "sports",
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        },
        {
          id: 4,
          name: "Casual",
          slug: "casual",
          image:
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",
        },
        {
          id: 5,
          name: "Formal",
          slug: "formal",
          image:
            "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400",
        },
        {
          id: 6,
          name: "Sneakers",
          slug: "sneakers",
          image:
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
        },
      ]);

      // Mock products
      const mockProducts = [
        {
          id: 1,
          name: "Premium Running Shoes",
          price: 89.99,
          originalPrice: 129.99,
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        },
        {
          id: 2,
          name: "Classic Leather Sneakers",
          price: 75.0,
          originalPrice: 99.99,
          image:
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
        },
        {
          id: 3,
          name: "Casual Canvas Shoes",
          price: 45.0,
          originalPrice: 60.0,
          image:
            "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400",
        },
        {
          id: 4,
          name: "Formal Oxford Shoes",
          price: 120.0,
          originalPrice: 150.0,
          image:
            "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400",
        },
        {
          id: 5,
          name: "High-Top Basketball Shoes",
          price: 110.0,
          originalPrice: 140.0,
          image:
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400",
        },
        {
          id: 6,
          name: "Casual Slip-On Loafers",
          price: 65.0,
          originalPrice: 85.0,
          image:
            "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400",
        },
        {
          id: 7,
          name: "Women's Heeled Boots",
          price: 95.0,
          originalPrice: 125.0,
          image:
            "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
        },
        {
          id: 8,
          name: "Trail Running Shoes",
          price: 100.0,
          originalPrice: 130.0,
          image:
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
        },
      ];

      setNewArrivals(mockProducts);
      setTopSelling(mockProducts.slice().reverse());
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <Helmet>
        <title>E-Shoe - Premium Footwear Store</title>
        <meta
          name="description"
          content="Shop the latest collection of premium shoes. Free shipping on orders over $50!"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom h-full flex items-center relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow">
              Step Into Style
            </h1>
            <p className="text-lg md:text-xl mb-8 text-shadow">
              Discover our premium collection of shoes designed for comfort and
              elegance. Free shipping on all orders over $50!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg"
              >
                Shop Now
              </Link>
              <Link
                to="/products/new"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-all duration-300"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop By Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our diverse collection of footwear for every occasion
            </p>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
            <Link
              to="/products/new"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              View All →
            </Link>
          </div>

          <ProductGrid products={newArrivals} loading={loading} />
        </div>
      </section>

      {/* Top Selling Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Top Selling Products
            </h2>
            <Link
              to="/products/top"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              View All →
            </Link>
          </div>

          <ProductGrid products={topSelling} loading={loading} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🚚
              </div>
              <h3 className="font-bold text-xl mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders over $50</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔒
              </div>
              <h3 className="font-bold text-xl mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure transactions</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ↩️
              </div>
              <h3 className="font-bold text-xl mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
