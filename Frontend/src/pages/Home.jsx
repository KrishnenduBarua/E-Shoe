import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import ProductGrid from "../components/Product/ProductGrid";
import Loading from "../components/Common/Loading";
import { api } from "../utils/api";
import { transformProduct } from "../utils/transformers";
import FlickWallpaper from "../components/Photos/Flick_Wallpaper.PNG";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState([]);
  const [topSelling, setTopSelling] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch new arrivals (latest products)
        const newArrivalsResponse = await api.products.getAll({
          sortBy: "newest",
          limit: 8,
        });
        const transformedNewArrivals =
          newArrivalsResponse.data.data.map(transformProduct);
        setNewArrivals(transformedNewArrivals);

        // Fetch top selling (featured products)
        const topSellingResponse = await api.products.getAll({
          sortBy: "featured",
          limit: 8,
        });
        const transformedTopSelling =
          topSellingResponse.data.data.map(transformProduct);
        setTopSelling(transformedTopSelling);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Flick - Premium Footwear Store</title>
        <meta
          name="description"
          content="Shop the latest collection of premium shoes. Free shipping on orders over $50!"
        />
      </Helmet>

      {/* Hero Section */}
      <section
        className="relative h-[500px] md:h-[600px] bg-black"
        style={{
          backgroundImage: `url(${FlickWallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        <div className="container-custom h-full flex items-center relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Step Into Style
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed">
              Discover our premium collection of shoes designed for comfort and
              elegance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-white text-black hover:bg-gray-100 font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-white/20 transform hover:scale-105"
              >
                Shop Now
              </Link>
              <Link
                to="/products/new"
                className="border-2 border-white text-white hover:bg-white hover:text-black font-bold py-4 px-10 rounded-lg transition-all duration-300 backdrop-blur-sm"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
            <Link
              to="/products/new"
              className="text-black hover:text-gray-700 font-semibold"
            >
              View All →
            </Link>
          </div>

          <ProductGrid products={newArrivals} loading={loading} />
        </div>
      </section>
    </>
  );
};

export default Home;
