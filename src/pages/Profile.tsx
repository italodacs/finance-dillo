import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../components/Profile.css";

export const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "transactions">("info");

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadUserTransactions(user.id);
      }
    };
    loadUserData();
  }, []);

  const loadUserTransactions = async (userId: string) => {
    setTransactionsLoading(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      setError("Erro ao carregar transações: " + err.message);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Deseja excluir esta transação?")) return;

    setDeleteLoading(transactionId);
    try {
      await supabase.from("parcelas").delete().eq("transaction_id", transactionId);
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);
      if (error) throw error;
      setTransactions(transactions.filter((t) => t.id !== transactionId));
    } catch (err: any) {
      setError("Erro ao excluir: " + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR");

  // Agrupar por tipo e banco
  const groupedTransactions = () => {
    const receitas = transactions.filter((t) => t.type === "income");
    const despesas = transactions.filter((t) => t.type === "expense");

    const despesasPorBanco: Record<string, any[]> = {};
    despesas.forEach((t) => {
      const banco = t.bank_name || "Outros";
      if (!despesasPorBanco[banco]) despesasPorBanco[banco] = [];
      despesasPorBanco[banco].push(t);
    });

    return { receitas, despesasPorBanco };
  };

  const { receitas, despesasPorBanco } = groupedTransactions();

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Cabeçalho */}
        <div className="profile-header">
          <div className="avatar-3d">
            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="profile-header-info">
            <h1 className="profile-title">Meu Perfil</h1>
            <p className="profile-subtitle">Gerencie sua conta e informações</p>
          </div>
        </div>

        {/* Abas */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Informações
          </button>
          <button
            className={`tab-button ${
              activeTab === "transactions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            Transações ({transactions.length})
          </button>
        </div>

        {/* ======= INFORMAÇÕES ======= */}
        {activeTab === "info" && (
          <div className="info-section">
            <h3>Informações da Conta</h3>

            <div className="info-item">
              <label>Nome Completo</label>
              <div className="info-value">
                <span>{user?.user_metadata?.full_name || "Não definido"}</span>
              </div>
            </div>

            <div className="info-item">
              <label>Email</label>
              <div className="info-value">
                <span>{user?.email || "Não informado"}</span>
                <span className="verified">
                  {user?.email_confirmed_at ? "Verificado" : "Pendente"}
                </span>
              </div>
            </div>

            <div className="info-item">
              <label>Senha</label>
              <div className="info-value">
                <span>••••••••</span>
                <button onClick={() => navigate("/redefinir-senha")}>
                  Alterar
                </button>
              </div>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              {loading ? "Saindo..." : "Sair da Conta"}
            </button>
          </div>
        )}

        {/* ======= TRANSAÇÕES ======= */}
        {activeTab === "transactions" && (
          <div className="transactions-section">
            {transactionsLoading ? (
              <p>Carregando...</p>
            ) : (
              <>
                {receitas.length > 0 && (
                  <div className="transaction-group">
                    <h4>Receitas</h4>
                    {receitas.map((t) => (
                      <div key={t.id} className="transaction-row">
                        <div className="transaction-info">
                          <strong>{t.description || "Sem descrição"}</strong>
                          <p>{formatDate(t.date)}</p>
                          <span className="category-badge">
                            {t.category || "Outros"}
                          </span>
                        </div>
                        <div className="transaction-amount positive">
                          +{formatCurrency(Number(t.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {Object.entries(despesasPorBanco).map(([banco, lista]) => (
                  <div key={banco} className="transaction-group">
                    <h4>{banco}</h4>
                    {lista.map((t) => (
                      <div key={t.id} className="transaction-row">
                        <div className="transaction-info">
                          <strong>{t.description || "Sem descrição"}</strong>
                          <p>{formatDate(t.date)}</p>
                          <span className="category-badge">
                            {t.category || "Outros"}
                          </span>
                        </div>
                        <div className="transaction-amount negative">
                          -{formatCurrency(Number(t.amount))}
                        </div>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteTransaction(t.id)}
                          disabled={deleteLoading === t.id}
                        >
                          {deleteLoading === t.id ? "Aguarde..." : "Excluir"}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
