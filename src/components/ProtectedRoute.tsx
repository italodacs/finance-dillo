// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setAllowed(!!session?.user);
      setAuthChecked(true);
      if (!session?.user) {
        navigate("/login", { replace: true });
      }
    };

    check();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // Eventos válidos; removido "USER_DELETED"
        console.log("Evento de autenticação:", event);

        const hasUser = !!session?.user;
        setAllowed(hasUser);
        setAuthChecked(true);

        if (!hasUser || event === "SIGNED_OUT") {
          navigate("/login", { replace: true });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (!authChecked) {
    return (
      <div className="protected-route-loading">
        <div className="loading-content">
          <div className="security-spinner" />
          <h3>Verificando acesso…</h3>
          <p>Validando sua sessão com segurança.</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="protected-route-denied">
        <div className="denied-content">
          <div className="denied-icon">🚫</div>
          <h3>Acesso negado</h3>
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
