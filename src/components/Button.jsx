import Link from "next/link";
import React from "react";

const Button = ({ content, icono, url, className, isActive }) => { // Añadimos isActive prop
  // Clases base y de hover/focus
  const defaultClasses = "block w-full px-2 py-1 text-left rounded-md text-gray-700 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 flex items-center gap-3 text-base text-md";

  // Clases para el estado activo
  const activeClasses = "bg-blue-600 text-white font-semibold shadow-md"; // Clases del estado activo

  // Combina las clases por defecto, las clases activas (si isActive es true) y las clases adicionales
  const combinedClasses = `${defaultClasses} ${isActive ? activeClasses : ''} ${className || ''}`.trim();


  return (
    <Link
      href={url}
      className={combinedClasses} // Usa las clases combinadas
      aria-current={isActive ? 'page' : undefined} // Añade aria-current para accesibilidad
    >
      <i>{icono}</i>
      <span>{content}</span>
    </Link>
  );
};

export default Button;
