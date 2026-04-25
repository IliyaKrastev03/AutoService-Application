import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button className="mobile-toggle-btn" onClick={toggleSidebar}>
        {isOpen ? "✖" : "☰"}
      </button>

      <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">🛠️ AutoService</h2>
        <p className="sidebar-role">
          Роля: <strong>{role}</strong>
        </p>

        <div className="sidebar-nav">
          {(role === "Admin" || role === "Manager") && (
            <Link to="/manager" className="sidebar-link" onClick={closeSidebar}>
              <span className="sidebar-icon">📋</span> Управление
            </Link>
          )}

          {(role === "Admin" || role === "Manager") && (
            <Link
              to="/accounting"
              className="sidebar-link"
              onClick={closeSidebar}
            >
              <span className="sidebar-icon">💰</span> Счетоводство
            </Link>
          )}

          {(role === "Admin" || role === "Manager") && (
            <Link to="/service" className="sidebar-link" onClick={closeSidebar}>
              <span className="sidebar-icon">📊</span> Сервизен График
            </Link>
          )}

          {(role === "Admin" ||
            role === "Manager" ||
            role === "ManagerGTP") && (
            <Link to="/gtp" className="sidebar-link" onClick={closeSidebar}>
              <span className="sidebar-icon">🚘</span> ГТП Пункт
            </Link>
          )}

          {(role === "Admin" || role === "Mechanic") && (
            <Link
              to="/mechanic"
              className="sidebar-link"
              onClick={closeSidebar}
            >
              <span className="sidebar-icon">👨‍🔧</span> Работно място
            </Link>
          )}

          {(role === "Admin" || role === "Manager") && (
            <Link to="/archive" className="sidebar-link" onClick={closeSidebar}>
              <span className="sidebar-icon">🗄️</span> Архив / VIN Търсене
            </Link>
          )}
        </div>

        <button onClick={handleLogout} className="sidebar-logout-btn">
          🚪 ИЗХОД
        </button>
      </div>
    </>
  );
}
