import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../utils/adminApi";
import { FiEye, FiSearch } from "react-icons/fi";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.orders.getAll(filters);
      const data = response.data.data;
      setOrders(
        Array.isArray(data.orders)
          ? data.orders
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
          "Failed to load orders. Please ensure the backend API is running.",
      );
      setOrders([]);
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

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "warning",
      confirmed: "success",
      rejected: "danger",
      processing: "info",
      shipped: "primary",
      delivered: "dark",
    };
    return `badge-${statusColors[status] || "secondary"}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Orders Management</h1>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="filters-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="form-control"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="form-group flex-grow">
              <label>Search</label>
              <div className="search-input">
                <FiSearch size={20} />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name, phone..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">No orders found</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Phone</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <span>{order.guest_name || order.user_name}</span>
                            {order.guest_name && (
                              <span
                                className="badge badge-info"
                                style={{ width: "fit-content" }}
                              >
                                Guest Order
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <a
                            href={`tel:${order.guest_phone || order.user_phone}`}
                            style={{
                              color: "#2563eb",
                              textDecoration: "none",
                              fontWeight: "500",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.guest_phone || order.user_phone}
                          </a>
                        </td>
                        <td>৳{order.total?.toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge ${getStatusBadge(order.order_status)}`}
                          >
                            {order.order_status}
                          </span>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <Link
                            to={`/orders/${order.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            <FiEye size={16} /> View
                          </Link>
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
    </div>
  );
}
