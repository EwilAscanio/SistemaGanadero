import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Contact } from "lucide-react";

const loadCliente = async () => {
  try {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/cliente`);
    return data;
  } catch (error) {
    console.error("Error cargando clientes:", error);
    return [];
  }
};

const ClientPage = async () => {
  const clientes = await loadCliente();

  const formatPhone = (phone) => {
    return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1-$2-$3-$4');
  };

  const formatRIF = (rif) => {
    return rif.replace(/([A-Z])-?(\d{8})(\d)/, '$1-$2-$3');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Directorio de Clientes
          </h1>
          <p className="mt-2 text-sm text-gray-500">
          Total registrados: {clientes.length} 
          </p>
        </div>
        <Link
          href="/auth/dashboard/cliente/registrarcliente"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Telefono
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                RIF
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <tr key={cliente.codigo_cli} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {cliente.codigo_cli}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cliente.nombre_cli}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <a href={`tel:${cliente.telefono_cli}`} className="hover:text-blue-800">
                      {formatPhone(cliente.telefono_cli)}
                    </a>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">                   
                    <a href={`mailto:${cliente.email_cli}`} className="hover:text-blue-800">
                      {cliente.email_cli}
                    </a>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatRIF(cliente.rif_cli)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                  <Link
                    href={`/auth/dashboard/cliente/updatecliente/${cliente.codigo_cli}`}
                    className="inline-flex items-center"
                  >
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  <Link
                    href={`/auth/dashboard/cliente/deletecliente/${cliente.codigo_cli}`}
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

        {clientes.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <Contact className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No hay clientes registrados</p>
            <Link
              href="/auth/dashboard/cliente/registrarcliente"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Registrar primer cliente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPage;