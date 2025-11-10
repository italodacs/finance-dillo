import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      <div className="home-card">
        <div className="home-icon">🏠</div>
        <h1 className="home-title">Página Inicial 💰</h1>
        <p className="home-text">
          Bem-vindo ao <strong>FinanceDillo</strong> — aqui você verá um resumo
          das suas finanças e atalhos rápidos para suas transações.
        </p>
        <button
          className="home-button"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Ir para o Dashboard
        </button>
      </div>
    </div>
  );
}
