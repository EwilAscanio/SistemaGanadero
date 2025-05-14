"use client";
import axios from "axios";
import Swal from "sweetalert2";
import { FaWeight, FaBarcode, FaSearch, FaSpinner } from "react-icons/fa"; // Añadimos FaSearch y FaSpinner
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Peso = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  // Estado para controlar si se ha cargado un animal
  const [animalCargado, setAnimalCargado] = useState(false);
  // Estado para controlar si la búsqueda está en curso
  const [buscando, setBuscando] = useState(false); // Estado para el spinner en el botón

  //Funcion para realizar la busqueda del animal
  const buscarAnimal = async (codigo) => {
    if (!codigo) {
      Swal.fire({
         title: "Advertencia",
         text: "Por favor, ingrese un código de animal.",
         icon: "warning",
         confirmButtonColor: "#f8bb86",
      });
      setAnimalCargado(false);
      setValue("peso_ani", ""); // Limpia el campo de peso si no hay código
      return;
    }

    setBuscando(true); // Inicia el estado de búsqueda

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal/${codigo}`
      );
      if (res.status === 200) {
        setAnimalCargado(true);
        // Mostrar alerta indicando que el animal ha sido encontrado
        Swal.fire({
          title: "Éxito",
          text: `Animal ${codigo} encontrado.`,
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        setValue("peso_ani", res.data.peso_ani); // Establece el peso en el formulario
      } else {
         // Esto maneja casos donde la API devuelve 200 pero con datos inesperados o vacíos
         throw new Error("Animal no encontrado o datos inválidos.");
      }
    } catch (error) {
      console.error("Error buscando animal:", error);
      Swal.fire({
        title: "Error",
        text: "Animal no encontrado.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setAnimalCargado(false);
      setValue("peso_ani", ""); // Limpia el campo de peso si no se encuentra el animal
    } finally {
      setBuscando(false); // Finaliza el estado de búsqueda
    }
  };

  const onSubmit = handleSubmit(async (data) => {
     // Asegurarse de que hay un animal cargado antes de enviar
    if (!animalCargado) {
      Swal.fire({
        title: "Advertencia",
        text: "Debe buscar y encontrar un animal válido para actualizar su peso.",
        icon: "warning",
        confirmButtonColor: "#f8bb86",
      });
      return; // No enviar si no hay animal cargado/validado
    }

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/peso`,
        data
      );
      if (res.status === 200) {
        Swal.fire({
          title: "Éxito",
          text: "El peso se actualizó correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        router.push("/auth/dashboard");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al actualizar el peso.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  });

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Actualizar Peso del Animal
          </h1>
          <p className="text-gray-600 mt-2">
            Busque un animal para actualizar su peso.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Campo de Código del Animal con Botón de Búsqueda */}
          <div> {/* Contenedor para el label y el input/boton */}
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
                } rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500`} // rounded-l-lg para que el borde derecho se conecte con el botón
                {...register("codigo_ani", {
                  required: {
                    value: true,
                    message: "Campo requerido",
                  },
                   minLength: {
                     value: 1,
                     message: "Ingrese un código",
                   },
                })}
              />
               {/* Botón de Búsqueda */}
              <button
                type="button"
                onClick={() => buscarAnimal(getValues("codigo_ani"))}
                className="flex items-center justify-center bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={buscando} // Deshabilita el botón mientras busca
              >
                 {buscando ? <FaSpinner className="animate-spin" size={20} /> : <FaSearch size={20} />} {/* Icono o spinner */}
              </button>
            </div>
            {errors.codigo_ani && (
              <span className="text-red-600 text-sm">
                {errors.codigo_ani.message}
              </span>
            )}
          </div>


          {/* Campo de Peso (deshabilitado si no hay animal cargado) */}
          <div className={`${!animalCargado ? 'opacity-50 pointer-events-none' : ''}`}> {/* Envuelve en un div para deshabilitar fácilmente */}
             <div className="relative">
                <label htmlFor="peso_ani" className="block text-sm font-medium text-gray-700 mb-1">
                  Peso del Animal (kg)
                </label>
                <div className="flex items-center relative">
                  <FaWeight
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="number" // Aseguramos que sea tipo number
                    id="peso_ani" // Añadimos ID
                    step="0.01" // Permite decimales
                    placeholder="Ingrese el peso"
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.peso_ani ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    {...register("peso_ani", {
                      required: {
                        value: animalCargado, // Requerido solo si animalCargado es true
                        message: "Campo requerido",
                      },
                      valueAsNumber: true, // Convierte el valor a número
                      min: {
                         value: 0.01, // Peso mínimo (ajusta si es necesario)
                         message: "El peso debe ser mayor a 0",
                      }
                    })}
                    disabled={!animalCargado} // Deshabilita el campo si no hay animal cargado
                  />
                </div>
                {errors.peso_ani && (
                  <span className="text-red-600 text-sm">
                    {errors.peso_ani.message}
                  </span>
                )}
             </div>
          </div> {/* Fin del div que agrupa el campo dependiente */}


          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!animalCargado} // Deshabilita el botón si no hay animal cargado/validado
          >
            Actualizar Peso
          </button>
        </form>
      </div>
    </div>
  );
};

export default Peso;