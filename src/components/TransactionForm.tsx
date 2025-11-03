// src/components/TransactionForm.tsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./TransactionForm.css";

// ===== Bancos (pode editar à vontade) =====
const BANCOS = [
  "Nubank",
  "Itaú",
  "Bradesco",
  "Santander",
  "Banco do Brasil",
  "Caixa",
  "Inter",
  "C6 Bank",
  "PicPay",
  "Will",
  "Outros",
];

// ===== Categorias separadas por tipo =====
const CATEGORIAS_DESPESA = [
  "Alimentação",
  "Supermercado",
  "Restaurante / Lanches",
  "Transporte",
  "Transporte (Uber & 99)",
  "Combustível",
  "Moradia",
  "Aluguel",
  "Energia Elétrica",
  "Internet",
  "Água e Saneamento",
  "Saúde",
  "Educação",
  "Pet",
  "Passeio",
  "Viagem",
  "Assinaturas",
  "Vestuário",
  "Outros",
];

const CATEGORIAS_RECEITA = [
  "Salário",
  "Freelance",
  "Reembolso",
  "Rendimentos / Dividendos",
  "Outros",
];

type TipoTransacao = "avulsa" | "parcelada" | "recorrente";

export const TransactionForm = () => {
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"income" | "expense">("expense");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");

  // começa com "Outros" (existe nas duas listas)
  const [categoria, setCategoria] = useState("Outros");

  const [tipoTransacao, setTipoTransacao] = useState<TipoTransacao>("avulsa");
  const [isCredito, setIsCredito] = useState(false);
  const [banco, setBanco] = useState("");
  const [totalParcelas, setTotalParcelas] = useState(1);
  const [recorrenciaMeses, setRecorrenciaMeses] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Data atual
  useEffect(() => {
    const now = new Date();
    setData(now.toISOString().split("T")[0]);
  }, []);

  // Ao mudar o tipo (income/expense), zera crédito e ajusta categoria se necessário
  useEffect(() => {
    if (tipo === "income") {
      setIsCredito(false);
      setBanco("");
    }

    const listaAtual =
      tipo === "income" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

    if (!listaAtual.includes(categoria)) {
      setCategoria("Outros");
    }
  }, [tipo]); // intencional: roda quando o tipo muda

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value) {
      const numericValue = parseInt(value) / 100;
      value = numericValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    setValor(value);
  };

  const calcularValorParcela = () => {
    try {
      const valorLimpo = valor.replace(/[^\d,]/g, "").replace(",", ".");
      const valorNumerico = parseFloat(valorLimpo);
      return isNaN(valorNumerico) ? 0 : valorNumerico / totalParcelas;
    } catch {
      return 0;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!valor || !data) {
      setError("Preencha valor e data!");
      return;
    }

    if (isCredito && !banco) {
      setError("Selecione o banco para compras no crédito!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/login");
        return;
      }

      // Converter valor
      let valorNumerico;
      try {
        const valorLimpo = valor.replace(/[^\d,]/g, "").replace(",", ".");
        valorNumerico = parseFloat(valorLimpo);
        if (isNaN(valorNumerico)) throw new Error("Valor inválido");
      } catch {
        setError("Valor inválido. Use números e vírgula para centavos");
        setLoading(false);
        return;
      }

      // Dados da transação
      const transactionData: any = {
        user_id: user.id,
        amount: valorNumerico,
        type: tipo,
        description: descricao || null, // descrição opcional
        date: data,
        category: categoria,
        is_credit: tipo === "expense" ? isCredito : false,
        bank_name: tipo === "expense" && isCredito ? banco : null,
        is_parcelada: tipoTransacao === "parcelada",
        is_recorrente: tipoTransacao === "recorrente",
        total_parcelas: tipoTransacao === "parcelada" ? totalParcelas : null,
        parcela_atual: tipoTransacao === "parcelada" ? 1 : null,
        recorrencia_meses:
          tipoTransacao === "recorrente" ? recorrenciaMeses : null,
      };

      // Complementos na descrição
      if (tipoTransacao === "parcelada") {
        transactionData.description = transactionData.description
          ? `${transactionData.description} (${totalParcelas}x)`
          : `Compra parcelada - ${totalParcelas}x`;
      }

      if (tipoTransacao === "recorrente") {
        transactionData.description = transactionData.description
          ? `${transactionData.description} (recorrente ${recorrenciaMeses} meses)`
          : `Despesa recorrente - ${recorrenciaMeses} meses`;
      }

      const { error: insertError } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select();

      if (insertError) throw insertError;

      setSuccess("Transação registrada com sucesso!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar transação.");
    } finally {
      setLoading(false);
    }
  };

  // Lista atual para o select de categoria
  const categoriasAtuais =
    tipo === "income" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  return (
    <div className={`transaction-form-container ${isDarkMode ? "dark" : ""}`}>
      {/* Header */}
      <div className="transaction-form-header">
        <h1 className="transaction-form-title">Registrar Transação</h1>
        <p className="transaction-form-subtitle">
          {tipo === "income"
            ? "Adicione suas receitas"
            : "Adicione suas despesas"}
        </p>
      </div>

      {/* Form Section */}
      <div className="transaction-form">
        <h2 className="form-section-title">
          {tipo === "income" ? "Nova Receita" : "Nova Despesa"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Valor */}
          <div className="form-group">
            <label className="form-label required">
              Valor {tipoTransacao === "parcelada" && "Integral"} *
            </label>
            <div className="currency-input">
              <span className="currency-prefix">R$</span>
              <input
                type="text"
                value={valor}
                onChange={handleValorChange}
                placeholder="0,00"
                className="form-input currency-input-field"
                required
              />
            </div>
            {tipoTransacao === "parcelada" && (
              <p className="info-text parcela-info">
                💡 Valor total será dividido em {totalParcelas} parcelas de{" "}
                {formatCurrency(calcularValorParcela())}
              </p>
            )}
          </div>

          {/* Tipo (Receita/Despesa) */}
          <div className="form-group">
            <label className="form-label required">Tipo *</label>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="income"
                  name="type"
                  value="income"
                  checked={tipo === "income"}
                  onChange={(e) =>
                    setTipo(e.target.value as "income" | "expense")
                  }
                  className="radio-input"
                />
                <label
                  htmlFor="income"
                  className={`radio-label income-option ${
                    tipo === "income" ? "checked" : ""
                  }`}
                >
                  <span className="icon">💰</span>
                  <span>Receita</span>
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="expense"
                  name="type"
                  value="expense"
                  checked={tipo === "expense"}
                  onChange={(e) =>
                    setTipo(e.target.value as "income" | "expense")
                  }
                  className="radio-input"
                />
                <label
                  htmlFor="expense"
                  className={`radio-label expense-option ${
                    tipo === "expense" ? "checked" : ""
                  }`}
                >
                  <span className="icon">💸</span>
                  <span>Despesa</span>
                </label>
              </div>
            </div>
          </div>

          {/* Categoria (dinâmica) */}
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="form-select"
            >
              {categoriasAtuais.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Transação */}
          <div className="form-group">
            <label className="form-label required">Tipo de Transação *</label>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="avulsa"
                  name="tipoTransacao"
                  value="avulsa"
                  checked={tipoTransacao === "avulsa"}
                  onChange={(e) =>
                    setTipoTransacao(e.target.value as TipoTransacao)
                  }
                  className="radio-input"
                />
                <label
                  htmlFor="avulsa"
                  className={`radio-label transaction-type-avulsa ${
                    tipoTransacao === "avulsa" ? "checked" : ""
                  }`}
                >
                  <span className="icon">⚡</span>
                  <span>Avulsa</span>
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="parcelada"
                  name="tipoTransacao"
                  value="parcelada"
                  checked={tipoTransacao === "parcelada"}
                  onChange={(e) =>
                    setTipoTransacao(e.target.value as TipoTransacao)
                  }
                  className="radio-input"
                />
                <label
                  htmlFor="parcelada"
                  className={`radio-label transaction-type-parcelada ${
                    tipoTransacao === "parcelada" ? "checked" : ""
                  }`}
                >
                  <span className="icon">📦</span>
                  <span>Parcelada</span>
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="recorrente"
                  name="tipoTransacao"
                  value="recorrente"
                  checked={tipoTransacao === "recorrente"}
                  onChange={(e) =>
                    setTipoTransacao(e.target.value as TipoTransacao)
                  }
                  className="radio-input"
                />
                <label
                  htmlFor="recorrente"
                  className={`radio-label transaction-type-recorrente ${
                    tipoTransacao === "recorrente" ? "checked" : ""
                  }`}
                >
                  <span className="icon">🔄</span>
                  <span>Recorrente</span>
                </label>
              </div>
            </div>
          </div>

          {/* Específico Parcelada */}
          {tipoTransacao === "parcelada" && (
            <div className="special-section parcelada-section">
              <label className="form-label">Número de Parcelas</label>
              <select
                value={totalParcelas}
                onChange={(e) => setTotalParcelas(Number(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "parcela" : "parcelas"}
                  </option>
                ))}
              </select>
              <p className="info-text parcela-info">
                Valor por parcela: {formatCurrency(calcularValorParcela())}
              </p>
            </div>
          )}

          {/* Específico Recorrente */}
          {tipoTransacao === "recorrente" && (
            <div className="special-section recorrente-section">
              <label className="form-label">Duração da Recorrência</label>
              <select
                value={recorrenciaMeses}
                onChange={(e) => setRecorrenciaMeses(Number(e.target.value))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "mês" : "meses"}
                  </option>
                ))}
              </select>
              <p className="info-text recorrente-info">
                💡 Serão criadas {recorrenciaMeses} transações mensais
              </p>
            </div>
          )}

          {/* Crédito - só para Despesa */}
          {tipo === "expense" && (
            <>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="isCredito"
                    checked={isCredito}
                    onChange={(e) => setIsCredito(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span>Esta compra foi no crédito?</span>
                </label>
              </div>

              {isCredito && (
                <div className="form-group">
                  <label className="form-label required">Banco *</label>
                  <select
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Selecione o banco</option>
                    {BANCOS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Descrição (opcional) */}
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={
                tipo === "income"
                  ? "Ex: Salário, Freelance, Rendimentos..."
                  : "Ex: Mercado, Combustível, Aluguel..."
              }
              className="form-input"
            />
          </div>

          {/* Data */}
          <div className="form-group">
            <label className="form-label required">
              Data {tipoTransacao === "recorrente" ? "Inicial" : ""} *
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Mensagens */}
          {success && <div className="success-message">✅ {success}</div>}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${
              tipo === "income" ? "income-button" : "expense-button"
            } ${loading ? "loading" : ""}`}
          >
            {loading
              ? "Salvando..."
              : tipoTransacao === "recorrente"
              ? `Criar ${recorrenciaMeses} Transações Recorrentes`
              : tipoTransacao === "parcelada"
              ? "Criar Transação Parcelada"
              : "Registrar Transação"}
          </button>
        </form>

        {/* Navegação */}
        <div className="form-navigation">
          <button onClick={() => navigate("/dashboard")} className="nav-button">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
