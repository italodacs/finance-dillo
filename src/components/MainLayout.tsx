import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../taman.png";

// Importa as imagens do diretório assets
import painelIcon from "../assets/painel-de-controle.png";
import transacaoIcon from "../assets/transacao.png";
import pessoaIcon from "../assets/pessoa.png";

import "./MainLayout.css";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: painelIcon },
    { path: "/transactions", label: "Transações", icon: transacaoIcon },
    { path: "/profile", label: "Perfil", icon: pessoaIcon },
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
            <img src={logo} alt="Logo" className="logo-image" />
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
            <img
              src={item.icon}
              alt={item.label}
              className="bottom-nav-icon-img"
            />
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
