import { useEffect, useRef } from "react";
import "../components/EvolutionChart.css";

interface EvolutionChartProps {
  data: {
    months: string[];
    saldo: number[];
    receitas: number[];
    despesas: number[];
  };
}

export default function EvolutionChart({ data }: EvolutionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any | null>(null);

  useEffect(() => {
    // ✅ Se não houver dados ou referência, sai
    if (!canvasRef.current || !data.months.length) return;

    const initChart = async () => {
      try {
        const Chart = (await import("chart.js/auto")).default;

        // Destroi gráfico anterior antes de recriar
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }

        // ✅ Corrigido: checagem explícita contra null
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.months,
            datasets: [
              {
                label: "Receitas",
                data: data.receitas,
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#10b981",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
              {
                label: "Despesas",
                data: data.despesas,
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#ef4444",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: "#374151",
                  font: { size: 14, weight: 600 },
                  padding: 20,
                  usePointStyle: true,
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#111827",
                bodyColor: "#374151",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: 1,
                callbacks: {
                  label: (context) => {
                    let label = context.dataset.label || "";
                    if (label) label += ": ";
                    if (context.parsed?.y !== null) {
                      label += new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(context.parsed.y);
                    }
                    return label;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { color: "rgba(0, 0, 0, 0.05)" },
                ticks: { color: "#6b7280", font: { size: 12 } },
              },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(0, 0, 0, 0.05)" },
                ticks: {
                  color: "#6b7280",
                  font: { size: 12 },
                  callback: (value) =>
                    "R$ " + Number(value).toLocaleString("pt-BR"),
                },
                suggestedMax:
                  Math.max(...data.receitas, ...data.despesas, 100) * 1.2,
              },
            },
            interaction: { intersect: false, mode: "index" },
            animations: { tension: { duration: 1000, easing: "linear" } },
          },
        });

        chartInstanceRef.current = chart;
      } catch (error) {
        console.error("Erro ao inicializar gráfico:", error);
      }
    };

    initChart();

    // Cleanup ao desmontar
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  if (!data.months.length) {
    return (
      <div className="chart-container">
        <p className="text-gray-500">Não há dados suficientes para exibir o gráfico.</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Evolução Mensal — Receitas vs Despesas
      </h3>
      <div className="h-[450px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
