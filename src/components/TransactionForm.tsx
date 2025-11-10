import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "./TransactionForm.css";

// ===== Bancos =====
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

// ===== Categorias =====
const CATEGORIAS_DESPESA = [
  "Alimentação",
  "Supermercado",
  "Restaurante / Lanches",
  "Transporte",
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

  // Data atual
  useEffect(() => {
    const now = new Date();
    setData(now.toISOString().split("T")[0]);
  }, []);

  // Ajusta categorias e crédito
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
  }, [tipo]);

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
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Converter valor
      const valorLimpo = valor.replace(/[^\d,]/g, "").replace(",", ".");
      const valorNumerico = parseFloat(valorLimpo);

      if (isNaN(valorNumerico)) {
        setError("Valor inválido. Use números e vírgula para centavos");
        setLoading(false);
        return;
      }

      // Dados da transação
      const transactionData: any = {
        user_id: user.id,
        amount: valorNumerico,
        type: tipo,
        description: descricao || null,
        date: data,
        category: categoria,
        is_credit: tipo === "expense" ? isCredito : false,
        bank_name: tipo === "expense" && isCredito ? banco : null,
        is_parcelada: tipoTransacao === "parcelada",
        is_recorrente: tipoTransacao === "recorrente",
        total_parcelas: tipoTransacao === "parcelada" ? totalParcelas : null,
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

  const categoriasAtuais =
    tipo === "income" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  return (
    <div className="transaction-page">
      <div className="transaction-card">
        <h1 className="transaction-title">Registrar Transação</h1>
        <p className="transaction-subtitle">
          {tipo === "income" ? "Adicione suas receitas" : "Adicione suas despesas"}
        </p>

        {error && <div className="message error">⚠️ {error}</div>}
        {success && <div className="message success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Valor */}
          <div className="form-group">
            <label>Valor *</label>
            <div className="currency-input">
              <span>R$</span>
              <input
                type="text"
                value={valor}
                onChange={handleValorChange}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="form-group">
            <label>Tipo *</label>
            <div className="radio-group">
              <label className={`radio-option ${tipo === "income" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="tipo"
                  value="income"
                  checked={tipo === "income"}
                  onChange={() => setTipo("income")}
                />
                💰 Receita
              </label>
              <label className={`radio-option ${tipo === "expense" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="tipo"
                  value="expense"
                  checked={tipo === "expense"}
                  onChange={() => setTipo("expense")}
                />
                💸 Despesa
              </label>
            </div>
          </div>

          {/* Categoria */}
          <div className="form-group">
            <label>Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categoriasAtuais.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Transação */}
          <div className="form-group">
            <label>Tipo de Transação *</label>
            <div className="radio-group">
              {["avulsa", "parcelada", "recorrente"].map((t) => (
                <label
                  key={t}
                  className={`radio-option ${tipoTransacao === t ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="tipoTransacao"
                    value={t}
                    checked={tipoTransacao === t}
                    onChange={() => setTipoTransacao(t as TipoTransacao)}
                  />
                  {t === "avulsa" && "⚡ Avulsa"}
                  {t === "parcelada" && "📦 Parcelada"}
                  {t === "recorrente" && "🔄 Recorrente"}
                </label>
              ))}
            </div>
          </div>

          {/* Parcelada */}
          {tipoTransacao === "parcelada" && (
            <div className="form-group">
              <label>Número de Parcelas</label>
              <select
                value={totalParcelas}
                onChange={(e) => setTotalParcelas(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} parcelas
                  </option>
                ))}
              </select>
              <p className="info-text">
                Valor por parcela: {formatCurrency(calcularValorParcela())}
              </p>
            </div>
          )}

          {/* Recorrente */}
          {tipoTransacao === "recorrente" && (
            <div className="form-group">
              <label>Duração (meses)</label>
              <select
                value={recorrenciaMeses}
                onChange={(e) => setRecorrenciaMeses(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} meses
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Crédito */}
          {tipo === "expense" && (
            <>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={isCredito}
                    onChange={(e) => setIsCredito(e.target.checked)}
                  />{" "}
                  Compra no crédito?
                </label>
              </div>
              {isCredito && (
                <div className="form-group">
                  <label>Banco *</label>
                  <select
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {BANCOS.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Descrição */}
          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Mercado, Aluguel..."
            />
          </div>

          {/* Data */}
          <div className="form-group">
            <label>Data *</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Salvando..." : "Registrar Transação"}
          </button>

          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Voltar ao Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
