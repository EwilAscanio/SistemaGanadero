import { useState, useEffect, useRef } from "react";

function FechaNacimientoInput({ register, setValue, watch, error }) {
  const fechaActual = watch("fechaNacimiento_ani") || "";
  const [valor, setValor] = useState(fechaActual);
  const inputRef = useRef(null);

  // Función para formatear la fecha con barras
  const formatearFecha = (input) => {
    const numeros = input.replace(/\D/g, "").slice(0, 8);
    if (numeros.length === 0) return "";
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4)
      return numeros.slice(0, 2) + "/" + numeros.slice(2);
    return (
      numeros.slice(0, 2) +
      "/" +
      numeros.slice(2, 4) +
      "/" +
      numeros.slice(4, 8)
    );
  };

  // Validación simple de fecha
  const validarFecha = (fecha) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) return false;
    const [dd, mm, yyyy] = fecha.split("/").map(Number);
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;
    return true;
  };

  // Actualizar estado local cuando cambia el valor externo
  useEffect(() => {
    setValor(fechaActual);
  }, [fechaActual]);

  const handleChange = (e) => {
    const input = e.target;
    const rawValue = input.value;
    const selectionStart = input.selectionStart;

    // Contar números antes del cursor (ignorar barras)
    const numerosAntesCursor = rawValue
      .slice(0, selectionStart)
      .replace(/\D/g, "").length;

    // Formatear el valor completo
    const formattedValue = formatearFecha(rawValue);

    // Calcular nueva posición del cursor teniendo en cuenta las barras
    let newCursorPos = numerosAntesCursor;
    if (numerosAntesCursor > 2) newCursorPos += 1; // barra después de día
    if (numerosAntesCursor > 4) newCursorPos += 1; // barra después de mes

    if (newCursorPos > formattedValue.length)
      newCursorPos = formattedValue.length;

    // Actualizar estado y formulario
    setValor(formattedValue);
    setValue("fechaNacimiento_ani", formattedValue, { shouldValidate: true });

    // Ajustar cursor después de render
    window.requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =
          newCursorPos;
      }
    });
  };

  // Registro con validación personalizada
  const { ref, ...rest } = register("fechaNacimiento_ani", {
    required: { value: true, message: "Campo requerido" },
    validate: (val) => validarFecha(val) || "Fecha inválida",
  });

  return (
    <>
      <input
        type="text"
        placeholder="dd/mm/aaaa"
        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
        value={valor}
        onChange={handleChange}
        maxLength={10}
        ref={(e) => {
          ref(e);
          inputRef.current = e;
        }}
        {...rest}
      />
      {error && (
        <span className="text-red-600 text-sm mt-1 block">{error.message}</span>
      )}
    </>
  );
}

export default FechaNacimientoInput;
