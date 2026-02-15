import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../utils/adminApi";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.products.getAll(filters);
      const data = response.data.data;
      setProducts(
        Array.isArray(data.products)
          ? data.products
          : Array.isArray(data)
            ? data
            : [],
      );
      setPagination(
        data.pagination || {
          total: 0,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
        },
      );
    } catch (err) {
      console.error("API Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load products. Please ensure the backend API is running.",
      );
      setProducts([]);
      setPagination({ total: 0, totalPages: 1, currentPage: 1, limit: 10 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await adminApi.products.delete(deleteId);
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product");
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Products Management</h1>
        <Link to="/products/new" className="btn btn-primary">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="filters-row">
            <div className="form-group flex-grow">
              <label>Search</label>
              <div className="search-input">
                <FiSearch size={20} />
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : products.length === 0 ? (
            <div className="empty-state">No products found</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={`${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}${product.images[0]}`}
                              alt={product.name}
                              className="product-thumbnail"
                            />
                          ) : (
                            <div className="product-thumbnail-placeholder">
                              No Image
                            </div>
                          )}
                        </td>
                        <td>{product.name}</td>
                        <td>৳{product.price?.toLocaleString()}</td>
                        <td>
                          <span
                            className={
                              product.stock > 10
                                ? "text-success"
                                : product.stock > 0
                                  ? "text-warning"
                                  : "text-danger"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${product.is_active ? "badge-success" : "badge-secondary"}`}
                          >
                            {product.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`/products/edit/${product.id}`}
                              className="btn btn-sm btn-primary"
                            >
                              <FiEdit size={16} />
                            </Link>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => setDeleteId(product.id)}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Product</h3>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
