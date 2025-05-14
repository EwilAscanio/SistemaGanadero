"use client"; // Asegúrate de que este archivo se ejecute en el cliente
import { useEffect, useState } from "react";
import axios from "axios"; // Asegúrate de importar axios

// Importa el ícono de carga
import { LuLoader2 } from "react-icons/lu";

// Importa tus iconos para las tarjetas
import { FaUsers, FaFileInvoiceDollar, FaCalendar } from "react-icons/fa";
import { LuMilk } from "react-icons/lu";

// Importa tus componentes
import CardDashboard from "@/components/CardDashboard";
import ChartComponent from "@/components/ChartComponent";

const Page = () => {
  const [fechaVacunacion, setFechaVacunacion] = useState(null);
  // 1. Añadir el estado de carga, inicializado a true
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  useEffect(() => {
    const obtenerFechaVacunacion = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/configuracion`
        );

        if (res.status === 200) {
          const config = res.data[0];
          const fecha = formatDate(config.ultima_vacunacion);
          setFechaVacunacion(fecha);
        }
      } catch (error) {
        console.error("Error al obtener la fecha de vacunación", error);
      } finally {
        // 2. Establecer isLoadingInitialData a false después de la carga (éxito o error)
        setIsLoadingInitialData(false);
      }
    };

    obtenerFechaVacunacion();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  // 3. Renderizado condicional: Mostrar carga si isLoadingInitialData es true
  if (isLoadingInitialData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-md w-full">
          <LuLoader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-semibold">
            Cargando datos del animal y opciones...
          </p>
        </div>
      </div>
    );
  }

  // Si isLoadingInitialData es false, mostrar el contenido principal
  return (
    <div className="p-6 bg-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardDashboard
          title="Total Animales"
          value="40.685"
          icon={<FaUsers className="w-full h-10 text-white" />}
          bgColor="bg-blue-500"
        />
        <CardDashboard
          title="Total Litros de Leche"
          value="10.293"
          icon={<LuMilk className="w-full h-10 text-white" />}
          bgColor="bg-green-500"
        />
        <CardDashboard
          title="Total de Inventario"
          value="89.600 $"
          icon={<FaFileInvoiceDollar className="w-full h-10 text-white" />}
          bgColor="bg-red-500"
        />
        <CardDashboard
          title="Fecha de Vacunación"
          value={fechaVacunacion ? fechaVacunacion : "Cargando..."}
          icon={<FaCalendar className="w-full h-10 text-white" />}
          bgColor="bg-yellow-500"
        />
      </div>
      <div className="mt-4 p-4">
        <ChartComponent />
      </div>
    </div>
  );
};

export default Page;
