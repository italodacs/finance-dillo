// src/pages/Register.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../components/LoginRegister.css";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      setError("Preencha todos os campos obrigatórios!");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Erro ao cadastrar usuário.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-bg-register">
      <div className="auth-bg-elements">
        <div className="auth-bg-circle auth-bg-circle-1"></div>
        <div className="auth-bg-circle auth-bg-circle-2"></div>
        <div className="auth-bg-circle auth-bg-circle-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo auth-logo-register">
            <span className="auth-logo-icon">🚀</span>
          </div>
          <h1 className="auth-title">Criar Conta</h1>
          <p className="auth-subtitle">Comece sua jornada financeira</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          <div className="auth-form-group">
            <label className="auth-label auth-label-required">
              Nome completo
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="Seu nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label auth-label-required">
              Confirmar senha
            </label>
            <input
              type="password"
              className="auth-input"
              placeholder="Digite a senha novamente"
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

          <div className="auth-checkbox">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms" className="auth-checkbox-label">
              Concordo com os{" "}
              <a href="#" className="auth-checkbox-link">
                Termos de Serviço
              </a>{" "}
              e{" "}
              <a href="#" className="auth-checkbox-link">
                Política de Privacidade
              </a>
            </label>
          </div>

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
              "Criar minha conta"
            )}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">já tem conta?</span>
          <div className="auth-divider-line"></div>
        </div>

        <div className="auth-nav">
          <p className="auth-nav-text">
            Já tem uma conta?{" "}
            <span className="auth-nav-link" onClick={() => navigate("/login")}>
              Fazer login
            </span>
          </p>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Comece a controlar suas finanças hoje mesmo
          </p>
        </div>
      </div>
    </div>
  );
};
