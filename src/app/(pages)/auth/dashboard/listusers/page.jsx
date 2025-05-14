import axios from "axios";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";

const loadUsers = async () => {
  try {
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/users`);
    return data;
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    return [];
  }
};

const UsersPage = async () => {
  const users = await loadUsers();
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="flex justify-between items-center mb-4">
        <div>

        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Usuarios
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Total registrados: {users.length} 
          </p>

        </div>
        <Link 
          href="/auth/register"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear Usuario
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id_usr} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name_usr}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email_usr}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                  <Link
                    href={`/auth/dashboard/listusers/updateusers/${user.id_usr}`}
                    className="inline-flex items-center"
                  >
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  {session?.user?.email !== user.email_usr && (
                    <Link
                      href={`/auth/dashboard/listusers/deleteusers/${user.id_usr}`}
                      className="inline-flex items-center"
                    >
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="text-center py-12 bg-gray-50">
            <p className="text-gray-500">No se encontraron usuarios registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;