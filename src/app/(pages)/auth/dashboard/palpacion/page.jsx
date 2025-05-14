"use client";

import axios from "axios";
import Swal from "sweetalert2";
import { FaBarcode, FaCalendar, FaSpinner } from "react-icons/fa"; // Añadimos FaSpinner
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react"; // Añadimos useEffect y useRef

const Palpacion = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch, // Usamos watch para observar el valor del input en tiempo real
  } = useForm();

  // Observa el valor del input de código animal
  const codigoAnimalWatch = watch("codigo_ani");

  // Estado para controlar si se ha cargado y validado un animal hembra
  const [animalCargado, setAnimalCargado] = useState(false);
  // Estado para mostrar/ocultar el campo de tiempo de gestación
  const [preñado, setPreñado] = useState(false);
  // Estado para almacenar las sugerencias de búsqueda
  const [sugerencias, setSugerencias] = useState([]);
  // Estado para indicar si la búsqueda está en curso (opcional, para mostrar spinner)
  const [buscando, setBuscando] = useState(false);
  // Referencia para el timeout del debouncing
  const debounceTimeoutRef = useRef(null);

  const isSettingValueRef = useRef(false);

  // Lógica de búsqueda en tiempo real con debouncing
  useEffect(() => {

    if (isSettingValueRef.current) {
      return;
  }

    // Limpiar timeout anterior si el usuario sigue escribiendo
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const codigo = codigoAnimalWatch; // Usamos el valor observado por watch

    if (!codigo || codigo.length < 2) { // Opcional: empezar a buscar después de 2 caracteres
      setSugerencias([]); // Limpiar sugerencias si el input está vacío o muy corto
      setAnimalCargado(false); // Resetear el estado si el código se vacía
      return;
    }

    setBuscando(true); // Indicar que estamos buscando

    // Configurar un nuevo timeout para la búsqueda
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/palpacion?search=${codigo}` // <--- CAMBIA ESTA RUTA Y QUERY
        );

        console.log("Respuesta de búsqueda:", res.data); // Log para depuración

        if (res.status === 200 && Array.isArray(res.data)) {
          setSugerencias(res.data); // Asume que res.data es un array de animales coincidentes
        } else {
           setSugerencias([]);
        }
      } catch (error) {
        console.error("Error buscando animales:", error);
        setSugerencias([]); // Limpiar sugerencias en caso de error
      } finally {
        setBuscando(false); // Finalizar búsqueda
      }
    }, 300); // Esperar 300ms después de la última pulsación

    // Función de limpieza: se ejecuta cuando el componente se desmonta
    // o antes de que useEffect se vuelva a ejecutar (ej. cuando codigoAnimalWatch cambia)
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [codigoAnimalWatch]); // Este efecto se ejecuta cada vez que codigoAnimalWatch cambia

  // Función que se llama al seleccionar una sugerencia
  const seleccionarSugerencia = async (animal) => {

    isSettingValueRef.current = true;
  
    // Establecer el valor del input con el código exacto del animal seleccionado
    setValue("codigo_ani", animal.codigo_ani, { shouldValidate: true });
    setSugerencias([]); // Limpiar la lista de sugerencias
   
    //await new Promise(resolve => setTimeout(resolve, 50)); // Esperar un poco para que el input se actualice antes de validar
   
    // Validar el animal seleccionado (sexo)
    if (animal.sexo_ani === "Macho") { // Asume que el endpoint de búsqueda parcial retorna sexo_ani
      await Swal.fire({
        title: "Error",
        text: "El animal seleccionado no es hembra.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setAnimalCargado(false);
      
      // Opcional: limpiar el input o resetear el campo si se selecciona un macho
      // setValue("codigo_ani", "");
    } else {
      setAnimalCargado(true);
      await Swal.fire({
        title: "Éxito",
        text: `Animal ${animal.codigo_ani} encontrado y validado.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    }

    isSettingValueRef.current = false;

  };

   // Función para manejar el envío del formulario principal (Registro de Palpación)
  const onSubmit = handleSubmit(async (data) => {

    if (!animalCargado) {
         Swal.fire({
            title: "Error",
            text: "Debe seleccionar un animal válido de la lista de sugerencias.",
            icon: "warning",
            confirmButtonColor: "#f8bb86",
         });
         return; // No enviar si no hay animal cargado/validado
     }


    try {
      // La data del formulario ya incluye codigo_ani, fecha_pal, animalembarazado_pal, tiempogestacion_pal
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/palpacion`,
        data // RHF recolecta todos los valores registrados
      );

      if (res.status === 200) {
        Swal.fire({
          title: "Éxito",
          text: "La palpación se registró correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        router.push("/auth/dashboard"); // Redirigir después del registro exitoso
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al registrar el proceso de palpacion.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  });

  const pre = 245; // Tiempo de gestación por defecto (ajusta según tu lógica)

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Proceso de Palpación
          </h1>
          <p className="text-gray-600 mt-2">
            Busque y seleccione un animal para continuar.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="relative"> {/* Usamos relative para posicionar las sugerencias */}
            <label htmlFor="codigo_ani" className="block text-sm font-medium text-gray-700 mb-1">
               Código del animal
            </label>
            <div className="flex items-center relative">
              <FaBarcode
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                id="codigo_ani" // Añadimos ID para la etiqueta
                placeholder="Ingrese el código del animal"
                autoComplete="off" // Desactiva autocompletar del navegador
                className={`w-full pl-10 pr-4 py-2 border ${
                  errors.codigo_ani ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                {...register("codigo_ani", {
                  required: {
                    value: true,
                    message: "Campo requerido",
                  },
                  minLength: {
                    value: 1, // Mínimo 1 carácter para empezar a buscar (ajusta si usas < 2 en useEffect)
                    message: "Ingrese un código",
                  },
                })}
                 // No necesitas un onChange explícito si usas watch/useEffect para la búsqueda
              />
               {buscando && ( // Mostrar spinner si está buscando
                <FaSpinner className="animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
               )}
            </div>
            {errors.codigo_ani && (
              <span className="text-red-600 text-sm">
                {errors.codigo_ani.message}
              </span>
            )}

            {/* Lista de sugerencias */}
            {sugerencias.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                {sugerencias.map((animal) => (
                  <li
                    key={animal.codigo_ani} // Usa un identificador único para la key
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    onClick={() => seleccionarSugerencia(animal)}
                  >
                    {animal.codigo_ani} - {animal.nombre_ani || "Sin Nombre"} {/* Muestra código y quizás nombre */}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Campos de Palpación (deshabilitados si no hay animal cargado) */}
          <div className={`${!animalCargado ? 'opacity-50 pointer-events-none' : ''} space-y-4`}> {/* Envuelve en un div para deshabilitar fácilmente */}
             <div className="relative">
                <label htmlFor="fecha_pal" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Palpación
                </label>
                <div className="flex items-center relative">
                  <FaCalendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="date"
                    id="fecha_pal" // Añadimos ID
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.fecha_pal ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    {...register("fecha_pal", {
                      required: {
                        value: animalCargado, // Requerido solo si animalCargado es true
                        message: "Campo requerido",
                      },
                    })}
                    disabled={!animalCargado} // Deshabilita el campo si no hay animal cargado
                  />
                </div>
                {errors.fecha_pal && (
                  <span className="text-red-600 text-sm">
                    {errors.fecha_pal.message}
                  </span>
                )}
             </div>

             <div className="flex items-center">
                <input
                  type="checkbox"
                  id="animalembarazado_pal" // Usamos el nombre del campo como ID
                  {...register("animalembarazado_pal")}
                  checked={preñado} // Controlado por estado local `preñado`
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setPreñado(isChecked);
                    // Si se marca, establecemos el valor predefinido de gestación
                    // Si se desmarca, limpiamos el valor de gestación
                    if (isChecked) {
                       setValue("tiempogestacion_pal", pre);
                    } else {
                       setValue("tiempogestacion_pal", "");
                    }
                  }}
                  className="mr-2"
                  disabled={!animalCargado} // Deshabilita si no hay animal cargado
                />
                <label htmlFor="animalembarazado_pal" className="text-gray-700 cursor-pointer">
                  El animal está preñado
                </label>
             </div>

             <div className="relative">
                <label htmlFor="tiempogestacion_pal" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de Gestación (días)
                </label>
                <input
                  type="number" // Cambiado a type="number" para tiempo de gestación
                  id="tiempogestacion_pal" // Añadimos ID
                  placeholder="Tiempo de Gestación"
                  className={`w-full pl-3 pr-4 py-2 border ${
                    errors.tiempogestacion_pal ? "border-red-500" : "border-gray-300" // Añadir manejo de error si es necesario validación para este campo
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  {...register("tiempogestacion_pal", {
                     // Opcional: Añadir validaciones si se espera un número
                     // valueAsNumber: true,
                     // required: { value: preñado, message: "Campo requerido si está preñado" },
                     // min: { value: 1, message: "Debe ser un número positivo" }
                  })}
                  disabled={!preñado || !animalCargado} // Deshabilita si no está preñado O si no hay animal cargado
                />
                  {errors.tiempogestacion_pal && (
                  <span className="text-red-600 text-sm">
                    {errors.tiempogestacion_pal.message}
                  </span>
                )}
             </div>
          </div> {/* Fin del div que agrupa los campos dependientes */}


          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!animalCargado} // Deshabilita el botón si no hay animal cargado/validado
          >
            Registrar Palpación
          </button>
        </form>
      </div>
    </div>
  );
};

export default Palpacion;