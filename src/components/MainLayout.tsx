// src/components/MainLayout.tsx
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/dillosemfundo.png";
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
          {/* Logo central */}
          <div
            className="header-logo-center"
            onClick={() => navigate("/dashboard")}
          >
            <img
              src={logo}
              alt="FinanceDillo logo"
              className="logo-image"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                objectFit: "contain",
              }}
            />
            <span className="logo-text">
              <strong>FinanceDillo</strong>
            </span>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        <div className="page-transition">{children}</div>
      </main>

      {/* NAVBAR INFERIOR (somente mobile) */}
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
