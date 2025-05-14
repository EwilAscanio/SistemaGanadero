"use client"; // Asegúrate de que este archivo se ejecute en el cliente
import { useEffect, useState } from "react";
import axios from "axios"; // Asegúrate de importar axios

import { FaUsers, FaFileInvoiceDollar, FaCalendar } from "react-icons/fa";
import { LuMilk } from "react-icons/lu";
import CardDashboard from "@/components/CardDashboard";
import ChartComponent from "@/components/ChartComponent";

const Page = () => {
  const [fechaVacunacion, setFechaVacunacion] = useState(null);

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
      }
    };

    obtenerFechaVacunacion();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="p-6 bg-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          title="Última Fecha de Vacunación"
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

export default Page; // Asegúrate de que esta línea esté presente
