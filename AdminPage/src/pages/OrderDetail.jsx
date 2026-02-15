import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminApi } from "../utils/adminApi";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiCheck,
  FiX,
  FiPackage,
} from "react-icons/fi";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.orders.getById(id);
      const { order, items } = response.data.data;
      // Merge order details with items array
      setOrder({ ...order, items });
    } catch (err) {
      setError("Failed to load order details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await adminApi.orders.confirm(id, notes);
      setShowConfirmModal(false);
      setNotes("");
      fetchOrderDetail();
    } catch (err) {
      alert("Failed to confirm order");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.orders.reject(id, notes);
      setShowRejectModal(false);
      setNotes("");
      fetchOrderDetail();
    } catch (err) {
      alert("Failed to reject order");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      alert("Please select a status");
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.orders.updateStatus(id, newStatus, notes);
      setShowStatusModal(false);
      setNotes("");
      setNewStatus("");
      fetchOrderDetail();
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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
        <button
          onClick={() => navigate("/orders")}
          className="btn btn-secondary"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Order #{order.id}</h1>
        <button
          onClick={() => navigate("/orders")}
          className="btn btn-secondary"
        >
          Back to Orders
        </button>
      </div>

      {/* Order Status & Actions */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="order-status-section">
            <div>
              <h3>Order Status</h3>
              <span className={`badge ${getStatusBadge(order.order_status)}`}>
                {order.order_status}
              </span>
              {order.guest_name && (
                <span className="badge badge-info ml-2">
                  Guest Order - Verify by Phone
                </span>
              )}
            </div>
            <div className="action-buttons">
              {order.order_status === "pending" && (
                <>
                  <a
                    href={`tel:${order.guest_phone || order.user_phone}`}
                    className="btn btn-primary"
                    style={{ marginRight: "10px" }}
                  >
                    <FiPhone size={16} /> Call Customer:{" "}
                    {order.guest_phone || order.user_phone}
                  </a>
                  <button
                    className="btn btn-success"
                    onClick={() => setShowConfirmModal(true)}
                  >
                    <FiCheck size={16} /> Confirm Order
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowRejectModal(true)}
                  >
                    <FiX size={16} /> Reject Order
                  </button>
                </>
              )}
              {order.order_status === "confirmed" && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setNewStatus("processing");
                    setShowStatusModal(true);
                  }}
                >
                  <FiPackage size={16} /> Mark as Processing
                </button>
              )}
              {order.order_status === "processing" && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setNewStatus("shipped");
                    setShowStatusModal(true);
                  }}
                >
                  <FiPackage size={16} /> Mark as Shipped
                </button>
              )}
              {order.order_status === "shipped" && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setNewStatus("delivered");
                    setShowStatusModal(true);
                  }}
                >
                  <FiCheck size={16} /> Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2-cols">
        {/* Customer Information */}
        <div className="card">
          <div className="card-header">
            <h3>Customer Information</h3>
            {order.guest_name && (
              <span className="badge badge-secondary">Guest Order</span>
            )}
          </div>
          <div className="card-body">
            <div className="info-item">
              <strong>Name:</strong>
              <span>{order.guest_name || order.user_name}</span>
            </div>
            <div className="info-item">
              <FiPhone size={16} />
              <strong>Phone:</strong>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <a
                  href={`tel:${order.guest_phone || order.user_phone}`}
                  style={{
                    color: "#2563eb",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {order.guest_phone || order.user_phone}
                </a>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() =>
                    copyToClipboard(order.guest_phone || order.user_phone)
                  }
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="info-item">
              <FiMail size={16} />
              <strong>Email:</strong>
              <span>{order.guest_email || order.user_email}</span>
            </div>
            <div className="info-item">
              <FiMapPin size={16} />
              <strong>Address:</strong>
              <span>{order.shipping_address}</span>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="card">
          <div className="card-header">
            <h3>Order Information</h3>
          </div>
          <div className="card-body">
            <div className="info-item">
              <strong>Order Date:</strong>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <strong>Total Amount:</strong>
              <span className="text-lg text-bold">
                ৳{order.total?.toLocaleString()}
              </span>
            </div>
            {order.confirmed_by && (
              <>
                <div className="info-item">
                  <strong>Confirmed By:</strong>
                  <span>{order.confirmed_by_name}</span>
                </div>
                <div className="info-item">
                  <strong>Confirmed At:</strong>
                  <span>{new Date(order.confirmed_at).toLocaleString()}</span>
                </div>
              </>
            )}
            {order.admin_notes && (
              <div className="info-item">
                <strong>Admin Notes:</strong>
                <p className="admin-notes">{order.admin_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>Order Items</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>{item.selected_size || "N/A"}</td>
                    <td>{item.selected_color || "N/A"}</td>
                    <td>৳{item.price?.toLocaleString()}</td>
                    <td>{item.quantity}</td>
                    <td>৳{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="text-right">
                    <strong>Total:</strong>
                  </td>
                  <td>
                    <strong>৳{order.total?.toLocaleString()}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Order</h3>
              <button
                className="btn-close"
                onClick={() => setShowConfirmModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#f0fdf4",
                  borderLeft: "4px solid #22c55e",
                  marginBottom: "20px",
                  borderRadius: "4px",
                }}
              >
                <p style={{ margin: 0, fontWeight: "600", color: "#15803d" }}>
                  ✓ Confirm after verifying order details with customer
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "14px",
                    color: "#166534",
                  }}
                >
                  Customer Phone:{" "}
                  <a
                    href={`tel:${order.guest_phone || order.user_phone}`}
                    style={{ color: "#15803d", fontWeight: "bold" }}
                  >
                    {order.guest_phone || order.user_phone}
                  </a>
                </p>
              </div>
              <div className="form-group">
                <label>Confirmation Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Customer confirmed delivery address, payment method verified..."
                  rows="3"
                  className="form-control"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? "Confirming..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRejectModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Order</h3>
              <button
                className="btn-close"
                onClick={() => setShowRejectModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#fef2f2",
                  borderLeft: "4px solid #ef4444",
                  marginBottom: "20px",
                  borderRadius: "4px",
                }}
              >
                <p style={{ margin: 0, fontWeight: "600", color: "#991b1b" }}>
                  ⚠ Warning: Rejecting this order will restore the product stock
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "14px",
                    color: "#991b1b",
                  }}
                >
                  Common reasons: Customer unreachable, address undeliverable,
                  payment declined
                </p>
              </div>
              <div className="form-group">
                <label>
                  Rejection Reason *{" "}
                  <span style={{ color: "#ef4444" }}>
                    (Required to proceed)
                  </span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Customer unreachable after multiple attempts, wrong phone number, customer cancelled..."
                  rows="4"
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? "Rejecting..." : "Reject Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowStatusModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button
                className="btn-close"
                onClick={() => setShowStatusModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Update order status to <strong>{newStatus}</strong>
              </p>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add status update notes..."
                  rows="3"
                  className="form-control"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
