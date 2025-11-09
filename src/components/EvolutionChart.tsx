// src/components/EvolutionChart.tsx
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

export const EvolutionChart = ({ data }: EvolutionChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.months.length) return;

    const initChart = async () => {
      try {
        const Chart = (await import("chart.js/auto")).default;

        // Destroi gráfico existente se houver
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }

        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        const chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.months,
            datasets: [
              {
                label: "Receitas",
                data: data.receitas,
                borderColor: "rgb(34, 197, 94)",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "rgb(34, 197, 94)",
                pointBorderColor: "white",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
              {
                label: "Despesas",
                data: data.despesas,
                borderColor: "rgb(239, 68, 68)",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "rgb(239, 68, 68)",
                pointBorderColor: "white",
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
                titleColor: "#374151",
                bodyColor: "#374151",
                borderColor: "rgba(0, 0, 0, 0.1)",
                borderWidth: 1,
                callbacks: {
                  label: function (context: any) {
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
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
                ticks: {
                  color: "#6b7280",
                  font: { size: 12 },
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                },
                ticks: {
                  stepSize: 500,
                  color: "#6b7280",
                  font: { size: 12 },
                  callback: (value) =>
                    "R$ " + Number(value).toLocaleString("pt-BR"),
                },
                suggestedMax:
                  Math.max(...data.receitas, ...data.despesas) * 1.2,
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

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  if (!data.months.length) {
    return (
      <div className="rounded-lg p-6 bg-white h-64 flex items-center justify-center">
        <p className="text-center text-gray-500">
          Não há dados suficientes para exibir o gráfico
        </p>
      </div>
    );
  }

  return (
    <div className="chart-container bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Evolução Mensal - Receitas vs Despesas
      </h3>
      <div className="h-96">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
