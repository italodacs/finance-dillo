// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
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

  // Estados para edição
  const [editingName, setEditingName] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [newName, setNewName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Carregar dados do usuário e transações
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

  // Carregar transações do usuário
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

  // Atualizar nome do usuário
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

      // Atualizar estado local
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

  // Atualizar senha
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

  // Deletar transação E SUAS PARCELAS
  const handleDeleteTransaction = async (transactionId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta transação?\n\nEsta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setDeleteLoading(transactionId);
    setError("");

    try {
      // PRIMEIRO: Deletar parcelas associadas (se houver)
      const { error: parcelasError } = await supabase
        .from("parcelas")
        .delete()
        .eq("transaction_id", transactionId)
        .eq("user_id", user.id); // ← Segurança extra com user_id

      if (parcelasError) {
        console.warn("Aviso ao deletar parcelas:", parcelasError);
        // Continua mesmo se houver erro nas parcelas
      }

      // DEPOIS: Deletar a transação principal
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", user.id); // ← ESSENCIAL: só deleta transações do usuário atual

      if (transactionError) throw transactionError;

      // Atualizar lista local
      setTransactions(transactions.filter((t) => t.id !== transactionId));
      setSuccess("Transação excluída com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError("Erro ao excluir transação: " + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Logout
  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-icon">
              {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-title">Meu Perfil</h1>
            <p className="profile-subtitle">Gerencie sua conta e transações</p>
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === "info" ? "active" : ""} ${
              isDarkMode ? "dark" : ""
            }`}
            onClick={() => setActiveTab("info")}
          >
            <span className="tab-icon">👤</span>
            Informações
          </button>
          <button
            className={`tab-button ${
              activeTab === "transactions" ? "active" : ""
            } ${isDarkMode ? "dark" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <span className="tab-icon">💳</span>
            Transações ({transactions.length})
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {error && (
          <div className="message error">
            <span className="message-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            <span className="message-icon">✅</span>
            {success}
          </div>
        )}

        {/* Conteúdo das Tabs */}
        <div className="tab-content">
          {activeTab === "info" && (
            <div className="info-content">
              {/* Informações da Conta */}
              <div className={`info-section ${isDarkMode ? "dark" : ""}`}>
                <h3 className="section-title">Informações da Conta</h3>

                <div className="info-item">
                  <label className="info-label">Nome completo</label>
                  {editingName ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        className="edit-input"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Seu nome completo"
                      />
                      <div className="edit-actions">
                        <button
                          onClick={handleUpdateName}
                          disabled={loading}
                          className="save-button"
                        >
                          {loading ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingName(false);
                            setNewName(user.user_metadata?.full_name || "");
                          }}
                          className="cancel-button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="info-value">
                      <span>
                        {user?.user_metadata?.full_name || "Não definido"}
                      </span>
                      <button
                        onClick={() => setEditingName(true)}
                        className="edit-button"
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  )}
                </div>

                <div className="info-item">
                  <label className="info-label">Email</label>
                  <div className="info-value">
                    <span>{user?.email}</span>
                    <span className="verified-badge">
                      {user?.email_confirmed_at
                        ? "✓ Verificado"
                        : "⏳ Pendente"}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <label className="info-label">Senha</label>
                  {editingPassword ? (
                    <div className="edit-form">
                      <input
                        type="password"
                        className="edit-input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Senha atual"
                      />
                      <input
                        type="password"
                        className="edit-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova senha (mín. 6 caracteres)"
                      />
                      <input
                        type="password"
                        className="edit-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar nova senha"
                      />
                      <div className="edit-actions">
                        <button
                          onClick={handleUpdatePassword}
                          disabled={loading}
                          className="save-button"
                        >
                          {loading ? "Salvando..." : "Alterar Senha"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                          className="cancel-button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="info-value">
                      <span>••••••••</span>
                      <button
                        onClick={() => setEditingPassword(true)}
                        className="edit-button"
                      >
                        🔒 Alterar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações da Conta */}
              <div className={`info-section ${isDarkMode ? "dark" : ""}`}>
                <h3 className="section-title">Ações da Conta</h3>
                <div className="actions-grid">
                  <button
                    onClick={() => navigate("/transactions")}
                    className="action-button primary"
                  >
                    <span className="action-icon">➕</span>
                    Nova Transação
                  </button>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="action-button secondary"
                  >
                    <span className="action-icon">📋</span>
                    Gerenciar Transações
                  </button>
                </div>
              </div>

              {/* Sair */}
              <div className="logout-section">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="logout-button"
                >
                  {loading ? "Saindo..." : "🚪 Sair da Conta"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="transactions-content">
              <div className="transactions-header">
                <h3 className="section-title">Gerenciar Transações</h3>
                <p className="section-subtitle">
                  {transactions.length} transações encontradas
                </p>
              </div>

              {transactionsLoading ? (
                <div className="loading-transactions">
                  <div className="loading-spinner"></div>
                  <p>Carregando transações...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="empty-transactions">
                  <div className="empty-icon">💸</div>
                  <h4>Nenhuma transação encontrada</h4>
                  <p>Você ainda não possui transações registradas</p>
                  <button
                    onClick={() => navigate("/transactions")}
                    className="empty-action-button"
                  >
                    Criar Primeira Transação
                  </button>
                </div>
              ) : (
                <div className="transactions-list">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`transaction-item ${isDarkMode ? "dark" : ""}`}
                    >
                      <div className="transaction-info">
                        <div className="transaction-main">
                          <span className="transaction-description">
                            {transaction.description || "Sem descrição"}
                            {transaction.is_parcelada && (
                              <span className="parcelada-badge">
                                📦 {transaction.total_parcelas}x
                              </span>
                            )}
                            {transaction.is_recorrente && (
                              <span className="recorrente-badge">
                                🔄 Recorrente
                              </span>
                            )}
                          </span>
                          <span
                            className={`transaction-amount ${
                              transaction.type === "income"
                                ? "income"
                                : "expense"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        <div className="transaction-details">
                          <span className="transaction-date">
                            {formatDate(transaction.date)}
                          </span>
                          <span
                            className={`transaction-type ${
                              transaction.type === "income"
                                ? "type-income"
                                : "type-expense"
                            }`}
                          >
                            {transaction.type === "income"
                              ? "Receita"
                              : "Despesa"}
                          </span>
                          {transaction.category && (
                            <span className="transaction-category">
                              {transaction.category}
                            </span>
                          )}
                          {transaction.is_credit && (
                            <span className="transaction-credit">
                              💳 Crédito
                            </span>
                          )}
                          {transaction.bank_name && (
                            <span className="transaction-bank">
                              🏦 {transaction.bank_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        disabled={deleteLoading === transaction.id}
                        className="delete-button"
                        title="Excluir transação"
                      >
                        {deleteLoading === transaction.id ? (
                          <div className="delete-spinner"></div>
                        ) : (
                          "🗑️ Excluir"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
