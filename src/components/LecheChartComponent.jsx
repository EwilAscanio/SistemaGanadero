"use client";
import { Chart } from "chart.js/auto";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { LuLoader2 } from "react-icons/lu";

const LecheChartComponent = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [produccionData, setProduccionData] = useState([]);

  const obtenerProduccion = async (selectedYear) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/produccionleche/mensual?year=${selectedYear}`
      );
      
      if (res.status === 200) {
        setProduccionData(res.data);
      }
    } catch (error) {
      console.error("Error al obtener producción de leche:", error);
      // Datos de ejemplo en caso de error
      setProduccionData([
        { mes: "Enero", total_litros: 0 },
        { mes: "Febrero", total_litros: 0 },
        { mes: "Marzo", total_litros: 0 },
        { mes: "Abril", total_litros: 0 },
        { mes: "Mayo", total_litros: 0 },
        { mes: "Junio", total_litros: 0 },
        { mes: "Julio", total_litros: 0 },
        { mes: "Agosto", total_litros: 0 },
        { mes: "Septiembre", total_litros: 0 },
        { mes: "Octubre", total_litros: 0 },
        { mes: "Noviembre", total_litros: 0 },
        { mes: "Diciembre", total_litros: 0 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    obtenerProduccion(year);
  }, [year]);

  useEffect(() => {
    if (isLoading || !chartRef.current) return;

    // Destruir el gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    const data = {
      labels: produccionData.map(item => item.mes),
      datasets: [
        {
          label: "Litros de Leche",
          data: produccionData.map(item => item.total_litros),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
          tension: 0.4, // Curva suave
          pointBackgroundColor: "rgb(34, 197, 94)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: {
              size: 12,
              weight: "bold",
            },
          },
        },
        title: {
          display: true,
          text: `Producción de Leche Anual - ${year}`,
          font: {
            size: 16,
            weight: "bold",
          },
          color: "#1f2937",
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleFont: { size: 14 },
          bodyFont: { size: 12 },
          padding: 10,
          callbacks: {
            label: function (context) {
              return ` ${context.dataset.label}: ${context.raw.toLocaleString()} litros`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ticks: {
            font: {
              size: 11,
            },
            callback: function (value) {
              return value.toLocaleString() + " L";
            },
          },
        },
      },
    };

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data,
      options,
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [produccionData, isLoading, year]);

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  // Generar opciones de años (desde 2020 hasta el año actual + 1)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2020; y <= currentYear + 1; y++) {
    years.push(y);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-72 bg-white rounded-lg shadow p-4">
        <div className="text-center">
          <LuLoader2 className="animate-spin h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-gray-600">Cargando gráfico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Producción de Leche</h3>
        <select
          value={year}
          onChange={handleYearChange}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center justify-center lg:h-72">
        <canvas ref={chartRef} className="h-full w-full"></canvas>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Total Anual</p>
          <p className="text-lg font-bold text-green-600">
            {produccionData.reduce((acc, item) => acc + item.total_litros, 0).toLocaleString()} L
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Promedio Mensual</p>
          <p className="text-lg font-bold text-blue-600">
            {(produccionData.reduce((acc, item) => acc + item.total_litros, 0) / 12).toFixed(0).toLocaleString()} L
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-2">
          <p className="text-xs text-gray-500">Mejor Mes</p>
          <p className="text-lg font-bold text-purple-600">
            {produccionData.length > 0 
              ? produccionData.reduce((max, item) => item.total_litros > max.total_litros ? item : max, produccionData[0]).mes
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LecheChartComponent;