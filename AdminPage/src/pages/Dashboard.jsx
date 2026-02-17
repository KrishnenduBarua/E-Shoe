import { useState, useEffect } from "react";
import { adminApi } from "../utils/adminApi";
import {
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.stats.getDashboard();
      setStats(response.data.data);
    } catch (err) {
      setError("Failed to load statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: "blue",
    },
    {
      title: "Total Revenue",
      value: `৳${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: FiDollarSign,
      color: "green",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: FiPackage,
      color: "purple",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: "orange",
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card stat-card">
              <div className={`stat-icon stat-icon-${card.color}`}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{card.title}</p>
                <h2 className="stat-value">{card.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>Recent Orders by Status</h3>
        </div>
        <div className="card-body">
          <div className="status-grid">
            <div className="status-item">
              <span className="badge badge-warning">Pending</span>
              <span className="status-count">{stats?.pendingOrders || 0}</span>
            </div>
            <div className="status-item">
              <span className="badge badge-success">Confirmed</span>
              <span className="status-count">
                {stats?.confirmedOrders || 0}
              </span>
            </div>
            <div className="status-item">
              <span className="badge badge-dark">Delivered</span>
              <span className="status-count">
                {stats?.deliveredOrders || 0}
              </span>
            </div>
          </div>

          {/* Recent Orders List */}
          {stats?.recentOrders && stats.recentOrders.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-3">Latest Orders</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.slice(0, 5).map((order) => (
                      <tr key={order.id}>
                        <td>#{order.order_number}</td>
                        <td>{order.customer_name || order.shipping_name}</td>
                        <td>৳{order.total_amount?.toLocaleString()}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              order.order_status === "pending"
                                ? "warning"
                                : order.order_status === "confirmed"
                                  ? "success"
                                  : order.order_status === "delivered"
                                    ? "dark"
                                    : "secondary"
                            }`}
                          >
                            {order.order_status}
                          </span>
                        </td>
                        <td>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
