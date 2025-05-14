import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Syringe } from "lucide-react";

const loadAnimal = async () => {
  try {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal`);
    return {
      animals: data.infoAnimales,
      total: data.total,
    };
  } catch (error) {
    console.error("Error cargando animales:", error);
    return { animals: [], total: 0 };
  }
};

const ListAnimal = async () => {
  const { animals } = await loadAnimal();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registro de Animales
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Total registrados: {animals.length}
          </p>
        </div>
        <Link 
          href="/auth/dashboard/animal/registraranimal"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Animal
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Sexo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Última Vacunación
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {animals.map((animal) => (
              <tr key={animal.codigo_ani} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {animal.codigo_ani}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {animal.nombre_ani}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center capitalize">
                  {animal.sexo_ani.toLowerCase()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                  <div className="flex items-center justify-center gap-1">
                    <Syringe className="w-4 h-4 text-blue-500" />
                    {formatDate(animal.fechaVacunacion_ani)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                  <Link
                    href={`/auth/dashboard/animal/updateanimal/${animal.codigo_ani}`}
                    className="inline-flex items-center"
                  >
                    <Button variant="outline" size="sm" className="hover:bg-blue-500 hover:text-white">
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <Link
                    href={`/auth/dashboard/animal/deleteanimal/${animal.codigo_ani}`}
                    className="inline-flex items-center"
                  >
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {animals.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <p className="text-gray-500">No hay animales registrados</p>
            <Link 
              href="/auth/dashboard/animal/registraranimal"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Registrar primer animal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListAnimal;