// src/pages/Login.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../components/LoginRegister.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Preencha email e senha!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setError(error.message);
      } else if (data.user) {
        navigate("/dashboard");
      }
    } catch (err) {
      setLoading(false);
      setError("Erro ao efetuar login.");
      console.error(err);
    }
  };

  return (
    <div className="auth-container auth-bg-login">
      <div className="auth-bg-elements">
        <div className="auth-bg-circle auth-bg-circle-1"></div>
        <div className="auth-bg-circle auth-bg-circle-2"></div>
        <div className="auth-bg-circle auth-bg-circle-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">💰</span>
          </div>
          <h1 className="auth-title">Bem-vindo de volta</h1>
          <p className="auth-subtitle">Entre na sua conta para continuar</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="auth-form-group">
            <label className="auth-label auth-label-required">Email</label>
            <input
              type="email"
              className="auth-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label auth-label-required">Senha</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="auth-error">
              <svg
                className="auth-error-icon"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-button auth-button-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                Entrando...
              </>
            ) : (
              "Entrar na conta"
            )}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">ou</span>
          <div className="auth-divider-line"></div>
        </div>

        <div className="auth-nav">
          <p className="auth-nav-text">
            Não tem uma conta?{" "}
            <span
              className="auth-nav-link"
              onClick={() => navigate("/register")}
            >
              Criar conta
            </span>
          </p>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Gerencie suas finanças de forma inteligente
          </p>
        </div>
      </div>
    </div>
  );
};
