import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/adminStore";
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiUsers,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: "/", label: "Dashboard", icon: FiHome },
    { path: "/orders", label: "Orders", icon: FiShoppingBag },
    { path: "/products", label: "Products", icon: FiPackage },
    { path: "/users", label: "Users", icon: FiUsers },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>Flick Admin</h2>
          <button
            className="btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <FiLogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <button
            className="btn-icon mobile-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiMenu size={24} />
          </button>
          <div className="header-right">
            <div className="admin-info">
              <span className="admin-name">{admin?.fullName}</span>
              <span
                className={`badge badge-${admin?.role === "super_admin" ? "success" : "primary"}`}
              >
                {admin?.role?.replace("_", " ")}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
