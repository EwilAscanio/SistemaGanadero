import React from 'react';
// Importa tus componentes y librerías necesarias
import Image from "next/image"; // Asegúrate de importar si usas Next.js Image
import { TiThMenu } from "react-icons/ti"; // Importa tus iconos
import { FaUserCircle, FaSearch } from "react-icons/fa"; // Importa tus iconos
import { IoIosNotifications } from "react-icons/io"; // Importa tus iconos
import imgbandera from "@/images/banderaVzla.png"; // Importa tu imagen
import { getServerSession } from "next-auth"; // Importa si usas NextAuth
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Importa si usas NextAuth
import LinkSignout from "./ui/LinkSignout"; // Importa tu componente LinkSignout
import axios from "axios"; // Importa axios si lo usas

// Simulación de funciones y datos para el ejemplo
const loadUser = async (email) => {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/users/${email}`);
  
  return { data }; 
};


// const LinkSignout = () => {
//     // Componente de ejemplo para cerrar sesión
//     return <button className="text-red-600 hover:underline text-sm">Cerrar Sesión</button>;
// };

// Importa tu imagen de bandera real
//const imgbandera = "/path/to/your/banderaVzla.png"; // Reemplaza con la ruta correcta o el import

const NavRight = async () => {

  const sesion = await getServerSession(authOptions);
    
  const user = sesion?.user; 

  // Solo intentar cargar el rol si hay usuario
  const user_rol = await loadUser(user.email);
  const nombreRol = user_rol.data.name_rol


  return (
    <nav className="flex items-center justify-between p-4 bg-white w-full">
      
      {/* Sección Izquierda: Menú y Búsqueda */}
      <div className="flex items-center">
      
        {/* Ícono de Menú */}
        {/* <button aria-label="Abrir menú">
           
           <TiThMenu className="text-xl text-gray-600 hover:text-gray-800" />
           <i className="text-xl text-gray-600 hover:text-gray-800"></i> 
        </button> */}

        {/* Barra de Búsqueda */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500">
          {/* Ícono de Búsqueda */}
          
          <FaSearch className="text-gray-400 mr-2"></FaSearch> 
          <input
            className="bg-transparent outline-none text-gray-800 placeholder-gray-500 w-64" 
            type="search"
            placeholder="Buscar..."
            aria-label="Campo de búsqueda"
          />
        </div>
      </div>

      {/* Sección Derecha: Notificaciones, Idioma, Usuario, Cerrar Sesión */}
      <div className="flex items-center gap-6">
        

        {/* Idioma y Bandera */}
        <div className="flex items-center gap-2">
          {/* Imagen de Bandera */}            
          <Image src={imgbandera} alt="Bandera de Venezuela" width={24} height={18} className="w-6 h-auto rounded-sm" />  {/* Ejemplo con Next.js Image */}
          <p className="text-gray-800 text-sm">Español</p>
        </div>

        {/* Información del Usuario */}
        {user && ( // Mostrar solo si hay usuario
          <div className="flex items-center gap-3">
            {/* Ícono de Usuario */}
            {/* Reemplaza con tu componente de ícono FaUserCircle */}
            <i className="text-2xl text-gray-600"></i> {/* Placeholder */}
            <div className="text-sm">
              <p className="font-semibold text-gray-800">{user.name}</p>
              <p className="text-gray-600">{nombreRol}</p>
            </div>
          </div>
        )}


        {/* Enlace/Botón Cerrar Sesión */}
        {user && ( // Mostrar solo si hay usuario
           <div>
             {/* Reemplaza con tu componente LinkSignout */}
             <LinkSignout /> {/* Placeholder */}
           </div>
        )}

      </div>
    </nav>
  );
};

export default NavRight;