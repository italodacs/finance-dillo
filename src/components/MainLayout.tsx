// src/components/MainLayout.tsx
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/dillosemfundo.png"; // <- importa do src/assets
import "./MainLayout.css";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/transactions", label: "Transações", icon: "💳" },
    { path: "/profile", label: "Perfil", icon: "👤" },
  ];

  return (
    <div className={`main-layout ${isDarkMode ? "dark" : ""}`}>
      <header className={`main-header ${isDarkMode ? "dark" : ""}`}>
        <div className="header-content">
          {/* Logo e nome */}
          <div
            className="header-logo"
            onClick={() => navigate("/dashboard")}
            style={{ cursor: "pointer" }}
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
            <span className={`logo-text ${isDarkMode ? "dark" : ""}`}>
              <strong>FinanceDillo</strong>
            </span>
          </div>

          {/* Navegação */}
          <nav className={`nav-tabs ${isDarkMode ? "dark" : ""}`}>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-tab ${isActive(item.path) ? "active" : ""} ${
                  isDarkMode ? "dark" : ""
                }`}
              >
                <span className="nav-tab-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Toggle de tema */}
          <button
            onClick={toggleTheme}
            className={`theme-toggle ${isDarkMode ? "dark" : ""}`}
            aria-label="Alternar tema"
          >
            <div className="toggle-slider">{isDarkMode ? "🌙" : "☀️"}</div>
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="page-transition">{children}</div>
      </main>
    </div>
  );
};
