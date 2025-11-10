import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../components/Register.css";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError("Preencha todos os campos!");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
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
      setError("Erro ao criar conta.");
      console.error(err);
    }
  };

  return (
    <div className="auth-container auth-bg-register">
      <div className="auth-bg-elements" />

      <div className="auth-card">
        <div className="auth-header">
          {/* LOGO centralizada */}
          <div className="auth-logo">
            <img
              src="/taman.png"
              alt="FinanceDillo"
              className="auth-logo-img"
              width={140}
              height={140}
              loading="eager"
              decoding="async"
            />
          </div>

          <h1 className="auth-title">Crie sua conta</h1>
          <p className="auth-subtitle">
            Preencha os campos abaixo para começar
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
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
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label auth-label-required">
              Confirmar Senha
            </label>
            <input
              type="password"
              className="auth-input"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                Criando conta...
              </>
            ) : (
              "Criar conta"
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
            Já tem uma conta?{" "}
            <span
              className="auth-nav-link"
              onClick={() => navigate("/login")}
            >
              Entrar
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
