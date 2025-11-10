import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface FinancialQuestion {
  id: string;
  question: string;
  options: string[];
  correct: string;
}

export const FinancialQuestions = () => {
  const [questions, setQuestions] = useState<FinancialQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Buscar questões
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from("financial_questions")
          .select("*")
          .order("created_at");

        if (error) throw error;

        const formatted =
          data?.map((q) => ({
            ...q,
            options:
              typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          })) || [];

        setQuestions(formatted);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar questões.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Salvar resposta
  const handleAnswer = async () => {
    if (!selectedAnswer) {
      setError("Por favor, selecione uma resposta.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const current = questions[currentQuestionIndex];
      const user = (await supabase.auth.getUser()).data.user;

      if (!user) {
        navigate("/login");
        return;
      }

      const { error } = await supabase.from("user_answers").insert({
        user_id: user.id,
        question_id: current.id,
        answer: selectedAnswer,
      });

      if (error) throw error;

      if (currentQuestionIndex === questions.length - 1) {
        navigate("/dashboard");
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar resposta.");
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-card">
          <div className="spinner"></div>
          <p>Carregando questões...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="quiz-card">
          <div className="quiz-icon">❓</div>
          <h2>Nenhuma questão encontrada</h2>
          <p>Não há questões disponíveis no momento.</p>
          <button onClick={() => navigate("/dashboard")}>Voltar</button>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-page">
      <div className="quiz-card">
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-icon">💡</div>
          <h1>Educação Financeira</h1>
          <p>
            Questão {currentQuestionIndex + 1} de {questions.length}
          </p>

          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Pergunta */}
        <h2 className="quiz-question">{q.question}</h2>

        {/* Opções */}
        <div className="quiz-options">
          {q.options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option ${
                selectedAnswer === option ? "selected" : ""
              }`}
              onClick={() => setSelectedAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Erro */}
        {error && <div className="quiz-error">⚠️ {error}</div>}

        {/* Navegação */}
        <div className="quiz-actions">
          <button
            onClick={() =>
              currentQuestionIndex > 0 &&
              setCurrentQuestionIndex(currentQuestionIndex - 1)
            }
            disabled={currentQuestionIndex === 0}
            className="back-btn"
          >
            Voltar
          </button>
          <button
            onClick={handleAnswer}
            disabled={saving || !selectedAnswer}
            className="next-btn"
          >
            {saving
              ? "Salvando..."
              : currentQuestionIndex === questions.length - 1
              ? "Finalizar"
              : "Próxima"}
          </button>
        </div>
      </div>
    </div>
  );
};
