// src/App.tsx
import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/MainLayout";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { FinancialQuestions } from "./pages/FinancialQuestions";
// ⬇️ Usar o form estilizado
import { TransactionForm } from "./components/TransactionForm";
import { Profile } from "./pages/Profile";
import { supabase } from "./lib/supabase";
import "./styles.css";

// Se o arquivo MobileOptimizations.css existir, importe. Se não, ignore.
try {
  require("./styles/MobileOptimizations.css");
} catch (error) {
  console.log("MobileOptimizations.css não encontrado, usando CSS padrão");
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erro na inicialização:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-content">
          <div className="app-loading-spinner"></div>
          <h2>FinanceApp</h2>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Rota raiz */}
            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
            />

            {/* Públicas */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/register"
              element={
                !user ? <Register /> : <Navigate to="/dashboard" replace />
              }
            />

            {/* Protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TransactionForm />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions"
              element={
                <ProtectedRoute>
                  <FinancialQuestions />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>404 - Página Não Encontrada</h1>
                  <p>A página que você está procurando não existe.</p>
                  <Navigate to="/" replace />
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
