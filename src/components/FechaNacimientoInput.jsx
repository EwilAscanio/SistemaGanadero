// src/components/FechaNacimientoInput.js
"use client"; // Necesario si usas hooks como useState o useEffect dentro, aunque aquí no lo necesitamos directamente. Es buena práctica incluirlo si es un componente de cliente.

import React from "react";
import { LuCalendar } from "react-icons/lu"; // Cambié el ícono a uno más semántico para fechas

const FechaNacimientoInput = ({
  name, // Nombre del campo para react-hook-form
  label, // Placeholder/Label para el input
  registerProps, // Propiedades retornadas por register()
  error, // Objeto de error específico para este campo
  IconComponent = LuCalendar, // Ícono a usar (predeterminado: calendario)
  className = "", // Clases CSS adicionales opcionales
  ...props // Otras props nativas del input (e.g., disabled)
}) => {
  return (
    <div className={`relative ${className}`}>
      
      <input
        type="date" // Usar directamente el tipo 'date' es más semántico y accesible
        id={name} // Buena práctica para accesibilidad (asociar con label si tuvieras uno externo)
        placeholder={label} // Aunque en type="date" el placeholder no siempre se muestra como texto
        className="w-full text-sm pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-700" // Añadido appearance-none y text-gray-700 para mejor consistencia
        {...registerProps} // Aquí se pasan las props de register (name, onChange, onBlur, ref)
        {...props} 
      />
      {/* Manejo de Errores */}
      {error && (
        <span className="text-red-600 text-sm mt-1 block">
          {" "}
          {/* Añadido mt-1 y block para mejor espaciado */}
          {error.message}
        </span>
      )}
    </div>
  );
};

export default FechaNacimientoInput;
