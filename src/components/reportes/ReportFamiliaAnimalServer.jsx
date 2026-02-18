"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import FamiliaAnimalPDF from "@/components/reportes/FamiliaAnimalPDF";
import { useSearchParams } from "next/navigation";

const ReportFamiliaAnimalServer = () => {
  const searchParams = useSearchParams();
  const familia = searchParams.get("familia") || "Todos";

  const [familias, setFamilias]         = useState([]);
  const [conteo, setConteo]             = useState([]);
  const [totalAnimales, setTotalAnimales] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/familiaanimal`,
          { params: { familia } }
        );
        setFamilias(response.data.familias || []);
        setConteo(response.data.conteo || []);
        setTotalAnimales(response.data.totalAnimales || 0);
      } catch (err) {
        console.error("Error fetching familias:", err);
        let msg = "Ocurrió un error al cargar el reporte de familias.";
        if (axios.isAxiosError(err) && err.response) {
          msg = err.response.data?.message || `Error del servidor (${err.response.status})`;
        } else if (axios.isAxiosError(err) && err.request) {
          msg = "No se pudo conectar con el servidor.";
        }
        setError(msg);
        Swal.fire({ icon: "error", title: "Error en el Reporte", text: msg });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [familia]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Filtrar conteo según familia seleccionada
  const conteoFiltrado = conteo.filter(
    (c) => familia === "Todos" || c.nombre_fam === familia
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Reporte de Familias de Animales
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Familia:{" "}
            <span className="font-semibold text-primary">{familia}</span>
          </p>
        </div>

        <PDFDownloadLink
          document={
            <FamiliaAnimalPDF
              familias={familias}
              conteo={conteoFiltrado}
              familia={familia}
              totalAnimales={totalAnimales}
            />
          }
          fileName={`Reporte_Familias_${familia}_${new Date()
            .toISOString()
            .slice(0, 10)}.pdf`}
          className="bg-primary hover:opacity-90 text-white font-medium py-2 px-6 rounded-lg transition-opacity"
        >
          {({ loading: pdfLoading }) =>
            pdfLoading ? "Generando PDF..." : "Descargar Reporte PDF"
          }
        </PDFDownloadLink>
      </div>

      {/* Tarjetas de resumen por familia */}
      {conteoFiltrado.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {conteoFiltrado.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-4 text-center border-t-4 border-primary"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {item.nombre_fam}
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {item.total}
              </p>
              <p className="text-xs text-gray-400 mt-1">animales</p>
            </div>
          ))}
        </div>
      )}

      {/* Bloque por familia */}
      {familias.length > 0 ? (
        familias.map((fam) => (
          <div key={fam.codigo_fam} className="mb-8">
            {/* Encabezado de familia */}
            <div className="bg-primary text-white px-5 py-3 rounded-t-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <div>
                <h2 className="text-lg font-bold">{fam.nombre_fam}</h2>
                <span className="text-blue-200 text-xs">Grupo: {fam.grupo}</span>
              </div>
              <span className="text-sm font-medium bg-white text-primary rounded-full px-3 py-0.5">
                {fam.animales.length} animales
              </span>
            </div>

            {/* Tabla de animales de la familia */}
            <div className="bg-white shadow-md rounded-b-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      {[
                        "Código",
                        "Nombre",
                        "Arete",
                        "Sexo",
                        "Fec. Nacimiento",
                        "Peso (kg)",
                        "Precio",
                        "Status",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left text-xs font-semibold text-primary uppercase tracking-wider"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fam.animales.length > 0 ? (
                      fam.animales.map((animal, idx) => (
                        <tr
                          key={animal.codigo_ani || idx}
                          className={
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {animal.codigo_ani}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {animal.nombre_ani}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {animal.arete_ani || "Sin Arete"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {animal.sexo_ani}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(animal.fechaNacimiento_ani)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {animal.peso_ani ?? 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {animal.precio_ani ?? 0}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                animal.status_ani === 1
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {animal.status_ani === 1 ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-6 text-center text-gray-400 text-sm italic"
                        >
                          Esta familia no tiene animales registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 text-gray-400">
          No se encontraron familias para los criterios seleccionados.
        </div>
      )}

      {/* Total general */}
      {totalAnimales > 0 && (
        <div className="flex justify-end mt-4">
          <div className="bg-white shadow rounded-lg px-6 py-3 flex items-center gap-4">
            <span className="text-sm text-gray-500">Total de animales</span>
            <span className="text-2xl font-bold text-primary">
              {totalAnimales}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFamiliaAnimalServer;
