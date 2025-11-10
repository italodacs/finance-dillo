import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../taman.png";
import "./MainLayout.css";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/transactions", label: "Transações", icon: "💳" },
    { path: "/profile", label: "Perfil", icon: "👤" },
  ];

  return (
    <div className="main-layout">
      {/* HEADER SUPERIOR */}
      <header className="main-header">
        <div className="header-top">
          <div
            className="header-logo-center"
            onClick={() => navigate("/dashboard")}
          >
           <img
  src="/taman.png"
  alt="Logo"
  className="logo-image"
/>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        <div className="page-transition">{children}</div>
      </main>

      {/* NAVBAR INFERIOR */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${
              isActive(item.path) ? "active" : ""
            }`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
