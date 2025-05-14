"use client";
import axios from "axios";
import Swal from "sweetalert2";
import { FaBarcode, FaCalendar } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Esta pagina funciona perfectamente, no incluye la mejora de busqueda de codigo del animal en tiempo real
const Palpacion = () => {
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
  const [preñado, setPreñado] = useState(false);

  // Función para realizar la búsqueda del animal
  const buscarAnimal = async (codigo) => {
    if (!codigo) {
      setAnimalCargado(false);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal/${codigo}`
      );
      if (res.status === 200) {
          if (res.data.sexo_ani === "Macho") {
          Swal.fire({
            title: "Error",
            text: "El animal no es hembra.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
          setAnimalCargado(false);
          return;
        }
        
        setAnimalCargado(true);
        // Mostrar alerta indicando que el animal ha sido encontrado
        Swal.fire({
          title: "Éxito",
          text: "Animal encontrado.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Animal no encontrado.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setAnimalCargado(false);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/palpacion`,
        data
      );
      if (res.status === 200) {
        Swal.fire({
          title: "Éxito",
          text: "La palpación se registró correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        router.push("/auth/dashboard");
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

  const pre = 200 + 45; // Ejemplo de cálculo para preñado (ajusta según tus necesidades)

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Proceso de Palpación
          </h1>
          <p className="text-gray-600 mt-2">
            Debe haber un animal cargado para habilitar los campos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex items-center relative">
            <FaBarcode
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Código del animal"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("codigo_ani", {
                required: {
                  value: true,
                  message: "Campo requerido",
                },
              })}
            />
            <button
              type="button"
              onClick={() => buscarAnimal(getValues("codigo_ani"))}
              className="ml-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
            >
              Buscar
            </button>
            {errors.codigo_ani && (
              <span className="text-red-600 text-sm">
                {errors.codigo_ani.message}
              </span>
            )}
          </div>

          <div className="relative">
            <FaCalendar
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="date"
              placeholder="Fecha de Palpación"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("fecha_pal", {
                required: {
                  value: animalCargado,
                  message: "Campo requerido",
                },
              })}
              disabled={!animalCargado} // Deshabilita el campo si no hay animal cargado
            />
            {errors.fecha_pal && (
              <span className="text-red-600 text-sm">
                {errors.fecha_pal.message}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="preñado"
              {...register("animalembarazado_pal")}
              checked={preñado}
              onChange={() => {
                setPreñado(!preñado);
                if (!preñado) {
                  setValue("tiempogestacion_pal", pre); // Establece el valor a 200 si está marcado
                } else {
                  setValue("tiempogestacion_pal", ""); // Limpia el valor si se desmarca
                }
              }}
              className="mr-2"
              disabled={!animalCargado}
            />
            <label htmlFor="preñado" className="text-gray-700">
              El animal está preñado
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Tiempo de Gestación"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("tiempogestacion_pal")}
              disabled={!preñado} // Deshabilita el campo si no está preñado
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg p-2"
            disabled={!animalCargado} // Deshabilita el botón si no hay animal cargado
          >
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Palpacion;
