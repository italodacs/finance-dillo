// src/pages/FinancialQuestions.tsx - Versão melhorada
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Buscar questões do banco
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from("financial_questions")
          .select("*")
          .order("created_at");

        if (error) {
          console.error("Erro ao buscar questões:", error);
          setError("Erro ao carregar questões.");
          return;
        }

        const formattedQuestions =
          data?.map((q) => ({
            ...q,
            options:
              typeof q.options === "string" ? JSON.parse(q.options) : q.options,
          })) || [];

        setQuestions(formattedQuestions);
      } catch (err) {
        console.error("Erro:", err);
        setError("Erro ao carregar questões.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Salvar resposta e ir para próxima questão
  const handleAnswer = async () => {
    if (!selectedAnswer) {
      setError("Por favor, selecione uma resposta.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const currentQuestion = questions[currentQuestionIndex];

      // Salvar resposta no user_answers
      const { error } = await supabase.from("user_answers").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        question_id: currentQuestion.id,
        answer: selectedAnswer,
      });

      if (error) throw error;

      // Verificar se é a última questão
      if (currentQuestionIndex === questions.length - 1) {
        navigate("/dashboard");
      } else {
        // Próxima questão
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer("");
      }
    } catch (err) {
      console.error("Erro ao salvar resposta:", err);
      setError("Erro ao salvar resposta.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Carregando questões...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Nenhuma questão encontrada
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Não há questões disponíveis no momento.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💡</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Educação Financeira
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Questão {currentQuestionIndex + 1} de {questions.length}
          </p>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-md mx-auto">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedAnswer === option
                    ? "bg-purple-500 border-purple-500 text-white transform scale-105"
                    : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white hover:border-purple-300 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedAnswer === option
                        ? "bg-white border-white"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedAnswer === option && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() =>
              currentQuestionIndex > 0 &&
              setCurrentQuestionIndex(currentQuestionIndex - 1)
            }
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              currentQuestionIndex === 0
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            Voltar
          </button>

          <button
            onClick={handleAnswer}
            disabled={saving || !selectedAnswer}
            className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                Salvando...
              </div>
            ) : currentQuestionIndex === questions.length - 1 ? (
              "Finalizar"
            ) : (
              "Próxima"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
