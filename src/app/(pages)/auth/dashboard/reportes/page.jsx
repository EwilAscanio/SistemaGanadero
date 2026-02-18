"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const PageReports = () => {
  const router = useRouter();

  const [error, setError] = useState("");

  // Estado para la categoría de Animales (grupos)
  const [categoria, setCategoria] = useState("Todos");

  // Estado para la familia seleccionada
  const [familiaSeleccionada, setFamiliaSeleccionada] = useState("Todos");
  const [listadoFamilias, setListadoFamilias] = useState([]);
  const [loadingFamilias, setLoadingFamilias] = useState(true);

  // Cargar la lista de familias al montar el componente
  useEffect(() => {
    const fetchFamilias = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/familiaanimal`,
          { params: { familia: "Todos" } }
        );
        setListadoFamilias(data.conteo || []);
      } catch (err) {
        console.error("Error cargando familias:", err);
      } finally {
        setLoadingFamilias(false);
      }
    };
    fetchFamilias();
  }, []);

  const handleSubmitCategoriaAnimales = (e) => {
    e.preventDefault();
    router.push(`reportes/grupoanimal?categoria=${categoria}`);
  };

  const handleSubmitFamiliaAnimales = (e) => {
    e.preventDefault();
    router.push(`reportes/familiaanimal?familia=${familiaSeleccionada}`);
  };

  return (
    <>
      <div className="flex justify-around"></div>
      <div className="flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Reportes del Sistema
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Escoge que reporte desea visualizar
            </p>
          </div>

          {/* Mensaje de error */}
          <div className="mb-4">
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          </div>

          {/* Formulario para los reportes */}
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
              {/* Reporte Número 1 Reporte de Animales */}
              <div className="relative border border-gray-300 rounded-lg p-4">
                <p className="text-center text-gray-600 mb-4">
                  Mostrar Animales Segun el Grupo.
                </p>

                <div className="mt-4">
                  <div className="flex flex-col sm:flex-row sm:space-x-6 sm:justify-center space-y-2 sm:space-y-0">
                    <label className="flex items-center justify-center sm:justify-start">
                      <input
                        type="radio"
                        name="categoria"
                        value="Bufalinos"
                        checked={categoria === "Bufalinos"}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">Bufalinos</span>
                    </label>
                    <label className="flex items-center justify-center sm:justify-start">
                      <input
                        type="radio"
                        name="categoria"
                        value="Bobinos"
                        checked={categoria === "Bobinos"}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">Bobinos</span>
                    </label>
                    <label className="flex items-center justify-center sm:justify-start">
                      <input
                        type="radio"
                        name="categoria"
                        value="Equinos"
                        checked={categoria === "Equinos"}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">Equinos</span>
                    </label>
                    <label className="flex items-center justify-center sm:justify-start">
                      <input
                        type="radio"
                        name="categoria"
                        value="Todos"
                        checked={categoria === "Todos"}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">Todos</span>
                    </label>
                  </div>
                </div>
                <button
                  className="col-span-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center mt-10"
                  onClick={handleSubmitCategoriaAnimales}
                >
                  Mostrar Reporte
                </button>
              </div>

              {/* Reporte Número 2 Familias de Animales */}
              <div className="relative border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  
                  <p className="text-center text-gray-600 font-medium">
                    Mostrar Familias de Animales.
                  </p>
                </div>

                <div className="mt-2">
                  {loadingFamilias ? (
                    <p className="text-center text-gray-400 text-xs animate-pulse">
                      Cargando familias...
                    </p>
                  ) : (
                    <select
                      value={familiaSeleccionada}
                      onChange={(e) => setFamiliaSeleccionada(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Todos">Todos</option>
                      {listadoFamilias.map((fam) => (
                        <option key={fam.codigo_fam} value={fam.nombre_fam}>
                          {fam.nombre_fam} ({fam.total})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  className="col-span-2 w-full bg-primary text-white py-2 rounded-lg hover:opacity-90 transition duration-300 flex items-center justify-center mt-6"
                  onClick={handleSubmitFamiliaAnimales}
                >
                  Mostrar Reporte
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PageReports;
