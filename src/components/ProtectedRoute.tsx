// src/components/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase"; // <- ajuste conforme o seu arquivo real
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        setAuthenticated(!!session);
        if (!session) {
          navigate("/login", { replace: true });
        }
      } catch (e) {
        console.error("Erro ao obter sessão:", e);
        setAuthenticated(false);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log("Evento de autenticação:", event);

        // eventos que efetivamente deslogam
        if (event === "SIGNED_OUT" || !session) {
          setAuthenticated(false);
          navigate("/login", { replace: true });
          return;
        }

        if (event === "SIGNED_IN" && session) {
          setAuthenticated(true);
        }
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-content">
          <div className="security-spinner" />
          <h3>Verificando sua sessão…</h3>
          <p>Garantindo a segurança dos seus dados.</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="protected-route-denied">
        <div className="denied-content">
          <div className="denied-icon">🔐</div>
          <h3>Acesso restrito</h3>
          <p>Faça login para continuar.</p>
          <button
            className="login-redirect-button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
