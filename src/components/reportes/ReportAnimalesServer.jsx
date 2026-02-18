"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import AnimalesPDF from "@/components/reportes/AnimalesPDF";
import { useSearchParams } from "next/navigation";

const ReportAnimalesServer = () => {
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria") || "Todos";

  const [animales, setAnimales] = useState([]);
  const [conteo, setConteo] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/animales`,
          { params: { categoria } }
        );
        setAnimales(response.data.animales || []);
        setConteo(response.data.conteo || []);
        setTotal(response.data.total || 0);
      } catch (err) {
        console.error("Error fetching animales:", err);
        let msg = "Ocurrió un error al cargar el reporte de animales.";
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
  }, [categoria]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Reporte de Animales
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Categoría:{" "}
            <span className="font-semibold text-primary">{categoria}</span>
          </p>
        </div>

        <PDFDownloadLink
          document={
            <AnimalesPDF
              animales={animales}
              conteo={conteo.filter(
                (item) => categoria === "Todos" || item.categoria === categoria
              )}
              categoria={categoria}
              total={total}
            />
          }
          fileName={`Reporte_Animales_${categoria}_${new Date()
            .toISOString()
            .slice(0, 10)}.pdf`}
          className="bg-primary hover:opacity-90 text-white font-medium py-2 px-6 rounded-lg transition-opacity"
        >
          {({ loading: pdfLoading }) =>
            pdfLoading ? "Generando PDF..." : "Descargar Reporte PDF"
          }
        </PDFDownloadLink>
      </div>

      {/* Tarjetas de resumen — solo muestra la categoría seleccionada o todas si es "Todos" */}
      {conteo.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {conteo
            .filter((item) => categoria === "Todos" || item.categoria === categoria)
            .map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow p-4 text-center border-t-4 border-primary"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {item.categoria}
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {item.total}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary">
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
                  "Categoría",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {animales.length > 0 ? (
                animales.map((animal, idx) => (
                  <tr
                    key={animal.codigo_ani || idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {animal.codigo_ani}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
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
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {animal.categoria}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-500 text-sm"
                  >
                    No se encontraron animales para la categoría seleccionada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {animales.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500">Total de animales</span>
            <span className="text-lg font-bold text-gray-800">{total}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportAnimalesServer;
