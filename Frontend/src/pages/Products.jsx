import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ProductGrid from "../components/Product/ProductGrid";
import { FiFilter } from "react-icons/fi";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: "featured",
    priceRange: "all",
    size: "all",
    category: "all",
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockProducts = Array(12)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          name: `Premium Shoe ${i + 1}`,
          price: 50 + i * 10,
          originalPrice: 80 + i * 10,
          image: `https://images.unsplash.com/photo-${1542291026 + i}-7eec264c27ff?w=400`,
        }));
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, [searchParams, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Shop All Products - E-Shoe</title>
        <meta
          name="description"
          content="Browse our complete collection of premium shoes"
        />
      </Helmet>

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                All Products
              </h1>
              <p className="text-gray-600">{products.length} products found</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-outline flex items-center gap-2"
            >
              <FiFilter />
              Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside
              className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 flex-shrink-0`}
            >
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Filters</h3>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="w-full input-field"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Price Range
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) =>
                      handleFilterChange("priceRange", e.target.value)
                    }
                    className="w-full input-field"
                  >
                    <option value="all">All Prices</option>
                    <option value="0-50">Under $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-150">$100 - $150</option>
                    <option value="150+">$150+</option>
                  </select>
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full input-field"
                  >
                    <option value="all">All Categories</option>
                    <option value="mens">Men's Shoes</option>
                    <option value="womens">Women's Shoes</option>
                    <option value="sports">Sports</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                {/* Size */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Size
                  </label>
                  <select
                    value={filters.size}
                    onChange={(e) => handleFilterChange("size", e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="all">All Sizes</option>
                    <option value="7">US 7</option>
                    <option value="8">US 8</option>
                    <option value="9">US 9</option>
                    <option value="10">US 10</option>
                    <option value="11">US 11</option>
                    <option value="12">US 12</option>
                  </select>
                </div>

                <button
                  onClick={() =>
                    setFilters({
                      sortBy: "featured",
                      priceRange: "all",
                      size: "all",
                      category: "all",
                    })
                  }
                  className="w-full btn-secondary text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid products={products} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
