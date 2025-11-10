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

  // Estados de edição
  const [editingName, setEditingName] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setNewName(user.user_metadata?.full_name || "");
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

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      setError("Nome não pode estar vazio");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName },
      });

      if (error) throw error;

      setUser({
        ...user,
        user_metadata: { ...user.user_metadata, full_name: newName },
      });
      setEditingName(false);
      setSuccess("Nome atualizado com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Erro ao atualizar nome: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Preencha todos os campos de senha");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Senha atualizada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Erro ao atualizar senha: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta transação?\n\nEsta ação não pode ser desfeita."
      )
    )
      return;

    setDeleteLoading(transactionId);
    setError("");

    try {
      await supabase
        .from("parcelas")
        .delete()
        .eq("transaction_id", transactionId)
        .eq("user_id", user.id);

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", user.id);

      if (error) throw error;

      setTransactions(transactions.filter((t) => t.id !== transactionId));
      setSuccess("Transação excluída com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Erro ao excluir transação: " + err.message);
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

  // 🔹 Agrupa as transações por tipo e banco
  const groupedTransactions = () => {
    const receitas = transactions.filter((t) => t.type === "income");
    const despesas = transactions.filter((t) => t.type === "expense");

    // agrupar despesas por banco
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
        <div className="profile-header">
          <div className="avatar-3d">
            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="profile-header-info">
            <h1 className="profile-title">Meu Perfil</h1>
            <p className="profile-subtitle">Gerencie sua conta e informações</p>
          </div>
        </div>

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

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {activeTab === "info" && (
          <div className="info-section">
            <h3>Informações da Conta</h3>

            <div className="info-item">
              <label>Nome completo</label>
              {editingName ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                  <div className="edit-actions">
                    <button onClick={handleUpdateName} disabled={loading}>
                      {loading ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      className="cancel"
                      onClick={() => {
                        setEditingName(false);
                        setNewName(user?.user_metadata?.full_name || "");
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-value">
                  {user?.user_metadata?.full_name || "Não definido"}
                  <button onClick={() => setEditingName(true)}>Editar</button>
                </div>
              )}
            </div>

            <div className="info-item">
              <label>Email</label>
              <div className="info-value">
                {user?.email}
                <span className="verified">
                  {user?.email_confirmed_at ? "Verificado" : "Pendente"}
                </span>
              </div>
            </div>

            <div className="info-item">
              <label>Senha</label>
              {editingPassword ? (
                <div className="edit-form">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Senha atual"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar nova senha"
                  />
                  <div className="edit-actions">
                    <button onClick={handleUpdatePassword} disabled={loading}>
                      {loading ? "Salvando..." : "Alterar"}
                    </button>
                    <button
                      className="cancel"
                      onClick={() => {
                        setEditingPassword(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="info-value">
                  ••••••••
                  <button onClick={() => setEditingPassword(true)}>
                    Alterar
                  </button>
                </div>
              )}
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "Saindo..." : "Sair da Conta"}
            </button>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="transactions-section">
            {transactionsLoading ? (
              <p>Carregando transações...</p>
            ) : transactions.length === 0 ? (
              <div className="empty-transactions">
                <p>Nenhuma transação encontrada</p>
              </div>
            ) : (
              <>
                {/* RECEITAS */}
                {receitas.length > 0 && (
                  <div className="transaction-group">
                    <h4>Receitas</h4>
                    {receitas.map((t) => (
                      <div key={t.id} className="transaction-row">
                        <div>
                          <strong>{t.description || "Sem descrição"}</strong>
                          <p>{formatDate(t.date)}</p>
                        </div>
                        <div className="amount positive">
                          +{formatCurrency(Number(t.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DESPESAS AGRUPADAS POR BANCO */}
                {Object.entries(despesasPorBanco).map(([banco, lista]) => (
                  <div key={banco} className="transaction-group">
                    <h4>{banco}</h4>
                    {lista.map((t) => (
                      <div key={t.id} className="transaction-row">
                        <div>
                          <strong>{t.description || "Sem descrição"}</strong>
                          <p>{formatDate(t.date)}</p>
                        </div>
                        <div className="amount negative">
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
