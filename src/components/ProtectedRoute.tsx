// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setLoading(true);

        // 1. Verificar se há sessão ativa
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erro ao verificar sessão:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log(
            "❌ Nenhuma sessão encontrada, redirecionando para login..."
          );
          navigate("/login", { replace: true });
          return;
        }

        // 2. Verificar se o token é válido e obter usuário
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Erro ao obter usuário:", userError);
          throw userError;
        }

        if (!user) {
          console.log("❌ Usuário não encontrado, redirecionando...");
          await supabase.auth.signOut();
          navigate("/login", { replace: true });
          return;
        }

        // 3. Verificar se o email foi confirmado (opcional)
        if (!user.email_confirmed_at) {
          console.warn("⚠️ Email não confirmado, mas permitindo acesso");
          // Você pode redirecionar para uma página de confirmação se quiser
        }

        // 4. Verificar role se necessário
        if (requiredRole) {
          const userRole = user.role || "authenticated";
          if (userRole !== requiredRole) {
            console.log("❌ Permissão insuficiente, redirecionando...");
            navigate("/unauthorized", { replace: true });
            return;
          }
        }

        console.log("✅ Usuário autenticado com sucesso:", user.email);
        setAuthenticated(true);
      } catch (error: any) {
        console.error("❌ Erro na verificação de autenticação:", error);

        // Limpar sessão corrompida
        await supabase.auth.signOut();

        // Redirecionar para login com mensagem de erro
        navigate("/login", {
          replace: true,
          state: { error: "Sessão expirada. Faça login novamente." },
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();

    // 5. Ouvir mudanças de autenticação em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento de autenticação:", event);

      if (event === "SIGNED_OUT" || event === "USER_DELETED" || !session) {
        console.log("🔐 Usuário deslogado, redirecionando...");
        setAuthenticated(false);
        navigate("/login", { replace: true });
      }

      if (event === "TOKEN_REFRESHED") {
        console.log("🔄 Token renovado com sucesso");
      }

      if (event === "SIGNED_IN") {
        console.log("🔐 Usuário logado, verificando...");
        // Recarregar a verificação quando o usuário fizer login
        checkAuthentication();
      }
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, requiredRole]);

  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-content">
          <div className="security-spinner"></div>
          <h3>Verificando segurança...</h3>
          <p>Estamos confirmando suas credenciais</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="protected-route-denied">
        <div className="denied-content">
          <div className="denied-icon">🔒</div>
          <h3>Acesso Negado</h3>
          <p>Você não tem permissão para acessar esta página</p>
          <button
            onClick={() => navigate("/login")}
            className="login-redirect-button"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
