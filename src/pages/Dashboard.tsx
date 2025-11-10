// src/pages/Dashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { EvolutionChart } from "../components/EvolutionChart";
import "../components/Dashboard.css";

type Transaction = {
  id: string;
  user_id: string;
  amount: number | string;
  type: "income" | "expense";
  description: string | null;
  date: string;
  category?: string | null;
  is_credit?: boolean | null;
  bank_name?: string | null;
  is_parcelada?: boolean | null;
  total_parcelas?: number | null;
  is_recorrente?: boolean | null;
  recorrencia_meses?: number | null; // 0 == indefinido
};

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setTransactions([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (error) throw error;

        setTransactions((data || []) as Transaction[]);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // === Função que prepara dados para o gráfico e resumo ===
  const prepareChartData = (txs: Transaction[]) => {
    if (!txs || txs.length === 0) {
      return { months: [], saldo: [], receitas: [], despesas: [] };
    }

    const monthsArray: string[] = [];
    const monthlyData: Record<string, { receitas: number; despesas: number }> =
      {};
    const today = new Date();

    for (let i = -6; i <= 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      monthsArray.push(monthKey);
      monthlyData[monthKey] = { receitas: 0, despesas: 0 };
    }

    const isInWindow = (y: number, m: number) => {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      return monthlyData[key] !== undefined;
    };

    txs.forEach((t) => {
      const baseDate = new Date(t.date);
      const baseY = baseDate.getFullYear();
      const baseM = baseDate.getMonth() + 1;
      const amount = parseFloat(String(t.amount)) || 0;

      // 1) Recorrentes
      if (t.is_recorrente) {
        const totalMeses =
          t.recorrencia_meses && t.recorrencia_meses > 0
            ? t.recorrencia_meses
            : 1000;

        for (let i = 0; i < totalMeses; i++) {
          const d = new Date(baseY, baseM - 1 + i, 1);
          const y = d.getFullYear();
          const m = d.getMonth() + 1;

          if (!isInWindow(y, m)) continue;

          const mk = `${y}-${String(m).padStart(2, "0")}`;
          if (t.type === "income") monthlyData[mk].receitas += amount;
          else monthlyData[mk].despesas += amount;
        }
        return;
      }

      // 2) Parceladas
      if (t.is_parcelada && t.total_parcelas && t.total_parcelas > 0) {
        const parcela = amount / t.total_parcelas;

        for (let i = 0; i < t.total_parcelas; i++) {
          const d = new Date(baseY, baseM - 1 + i, 1);
          const y = d.getFullYear();
          const m = d.getMonth() + 1;

          if (!isInWindow(y, m)) continue;

          const mk = `${y}-${String(m).padStart(2, "0")}`;
          if (t.type === "income") monthlyData[mk].receitas += parcela;
          else monthlyData[mk].despesas += parcela;
        }
        return;
      }

      // 3) Avulsas
      const baseKey = `${baseY}-${String(baseM).padStart(2, "0")}`;
      if (monthlyData[baseKey]) {
        if (t.type === "income") monthlyData[baseKey].receitas += amount;
        else monthlyData[baseKey].despesas += amount;
      }
    });

    const sorted = monthsArray.sort();
    const months = sorted.map((mk) => {
      const [y, m] = mk.split("-");
      return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString(
        "pt-BR",
        { month: "short", year: "numeric" }
      );
    });

    const receitas = sorted.map((mk) => monthlyData[mk].receitas);
    const despesas = sorted.map((mk) => monthlyData[mk].despesas);
    const saldo = sorted.map(
      (mk) => monthlyData[mk].receitas - monthlyData[mk].despesas
    );

    return { months, saldo, receitas, despesas };
  };

  // Dados do gráfico e dos cards
  const chartData = useMemo(
    () => prepareChartData(transactions),
    [transactions]
  );

  // Totais do mês atual
  const { receitaMes, despesaMes } = useMemo(() => {
    const now = new Date();
    const mesAtualFormatado = now.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });

    const idx = chartData.months.findIndex((m) => m === mesAtualFormatado);

    if (idx === -1) {
      return { receitaMes: 0, despesaMes: 0 };
    }

    return {
      receitaMes: chartData.receitas[idx],
      despesaMes: chartData.despesas[idx],
    };
  }, [chartData]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(n || 0);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Carregando seu resumo...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Resumo da sua vida financeira</p>
      </div>

      {/* Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-title">Receitas (mês)</span>
            <span className="summary-card-indicator indicator-positive" />
          </div>
          <div className="summary-card-value value-positive">
            {formatCurrency(receitaMes)}
          </div>
          <div className="summary-card-trend">Entradas do mês atual</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-title">Despesas (mês)</span>
            <span className="summary-card-indicator indicator-negative" />
          </div>
          <div className="summary-card-value value-negative">
            {formatCurrency(despesaMes)}
          </div>
          <div className="summary-card-trend">Saídas do mês atual</div>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <span className="summary-card-title">Saldo (mês)</span>
            <span className="summary-card-indicator" />
          </div>
          <div
            className={`summary-card-value ${
              receitaMes - despesaMes >= 0
                ? "value-positive"
                : "value-negative"
            }`}
          >
            {formatCurrency(receitaMes - despesaMes)}
          </div>
          <div className="summary-card-trend">Receitas - Despesas</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="chart-section">
        <EvolutionChart data={chartData} />
      </div>

      {/* Lista de transações */}
      <div className="all-transactions">
        <div className="transactions-header">
          <h3 className="transactions-title">Transações recentes</h3>
          <span className="transactions-count">
            {transactions.length} no total
          </span>
        </div>

        {error ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div className="empty-title">Erro ao carregar</div>
            <p className="empty-description">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <div className="empty-title">Sem transações ainda</div>
            <p className="empty-description">
              Registre sua primeira transação para ver o resumo aqui.
            </p>
            <button
              className="empty-action-button"
              onClick={() => (window.location.href = "/transactions")}
            >
              Nova transação
            </button>
          </div>
        ) : (
          <div className="transactions-list">
            {transactions.slice(0, 8).map((t) => {
              const isIncome = t.type === "income";
              return (
                <div key={t.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-description">
                      {t.description || "Sem descrição"}
                    </div>
                    <div className="transaction-meta">
                      <span
                        className={`transaction-type ${
                          isIncome ? "type-income" : "type-expense"
                        }`}
                      >
                        {isIncome ? "Receita" : "Despesa"}
                      </span>
                      <span className="transaction-date">
                        {new Date(t.date).toLocaleDateString("pt-BR")}
                      </span>
                      {t.category && (
                        <span className="transaction-category">
                          {t.category}
                        </span>
                      )}
                      {t.is_credit && (
                        <span className="transaction-credit">💳 Crédito</span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`transaction-amount ${
                      isIncome ? "amount-income" : "amount-expense"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(Number(t.amount))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
