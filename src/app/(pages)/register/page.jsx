"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  LuUser,
  LuUserCircle,
  LuMail,
  LuLock,
  LuArrowRight,
} from "react-icons/lu";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";
import FondoLogin from "@/images/ImagenSesion.jpeg";
import Logo from "@/images/Logo.png";

const RegistrarUsuario = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm();

  const watchName = watch("name_usr");
  const watchLogin = watch("login_usr");
  const watchEmail = watch("email_usr");
  const watchPassword = watch("password_usr");
  const watchRol = watch("id_rol");

  const onSubmit = handleSubmit(async (data) => {
    try {
      Swal.close();

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/users`,
        data
      );

      console.log(res);

      if (res.status === 200) {
        Swal.fire({
          title: "Registro Exitoso",
          text: "El usuario ha sido registrado exitosamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          timer: 1500, // Añadido timer para cerrar automáticamente
          showConfirmButton: false,
        }).then(() => {
          router.push("/");
        });
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);

      let errorMessage =
        "Ocurrió un error desconocido al registrar el usuario.";
      let errorTitle = "Error de Registro";
      let icon = "error";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Datos del error del servidor:", error.response.data);
          console.error("Estado HTTP:", error.response.status);

          if (error.response.status === 400) {
            errorMessage =
              error.response.data.message ||
              "El usuario o login ya existe o los datos son inválidos.";
            errorTitle = "Datos Inválidos o Duplicados";
            icon = "warning";
          } else if (error.response.status === 500) {
            errorMessage =
              "Ocurrió un error interno en el servidor. Por favor, intenta nuevamente más tarde.";
            errorTitle = "Error del Servidor";
          } else {
            errorMessage = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
          }
        } else if (error.request) {
          errorMessage =
            "No se recibió respuesta del servidor. Por favor, verifica tu conexión.";
          errorTitle = "Error de Conexión";
        } else {
          errorMessage = error.message;
          errorTitle = "Error de Solicitud";
        }
      }

      Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: icon,
        confirmButtonColor: "#d33",
      });
    }
  });

  return (
    // Contenedor principal: Centra el card. min-h-screen asegura que si el contenido es corto,
    // el fondo se extienda, pero no fuerza scroll si el card es más alto.
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Contenedor del Layout Dividido: Elimina max-h y overflow-y-auto del panel.
          La altura ahora dependerá de su contenido (el panel más alto dictará). */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        {" "}
        {/* Eliminado max-h y overflow-y-auto */}
        {/* Panel de Imagen: Mantiene su configuración. md:h-auto permite que se ajuste */}
        <div className="relative md:w-1/2 h-64 md:h-auto flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none overflow-hidden">
          <Image
            src={FondoLogin}
            alt="Fondo de Registro de Usuario"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw" // Añadido sizes para mejor rendimiento
          />
        </div>
        <div className="w-full md:w-1/2 py-3 px-8 flex items-center justify-center bg-white rounded-b-lg md:rounded-r-lg md:rounded-tl-none">
          <div className="w-full max-w-md mx-auto space-y-3">
            <div className="text-center">
              <Image
                src={Logo}
                alt="Logo"
                className="h-20 w-auto mb-1 mx-auto"
                sizes="100px"
              />
              {/* Título: Ajustado margen inferior */}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Crear Cuenta
              </h2>
              {/* Subtítulo: Mantiene tamaño, elimina margen */}
              <p className="text-gray-600 text-sm">
                Rellene los datos solicitados
              </p>{" "}
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label
                  htmlFor="name_usr"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre Completo
                </label>
                <div className="relative mt-1">
                  <LuUser
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="name_usr"
                    name="name_usr"
                    type="text"
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.name_usr ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`} // text-sm para input
                    placeholder="Nombre completo"
                    {...register("name_usr", {
                      required: {
                        value: true,
                        message: "El nombre es requerido",
                      },
                      minLength: {
                        value: 2,
                        message: "El nombre debe tener al menos 2 caracteres",
                      },
                    })}
                  />
                  {errors.name_usr && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      {" "}
                      {/* text-xs para error */}
                      <FaExclamationCircle className="mr-1" />
                      <span>{errors.name_usr.message}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Campo Login */}
              <div>
                <label
                  htmlFor="login_usr"
                  className="block text-sm font-medium text-gray-700"
                >
                  Login (Nombre de Usuario)
                </label>
                <div className="relative mt-1">
                  <LuUserCircle
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="login_usr"
                    name="login_usr"
                    type="text"
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.login_usr ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`} // text-sm para input
                    placeholder="Login"
                    {...register("login_usr", {
                      required: {
                        value: true,
                        message: "El login es requerido",
                      },
                      minLength: {
                        value: 2,
                        message: "El login debe tener al menos 2 caracteres",
                      },
                    })}
                  />
                  {errors.login_usr && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      {/* text-xs para error */}
                      <FaExclamationCircle className="mr-1" />
                      <span>{errors.login_usr.message}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Campo Email */}
              <div>
                <label
                  htmlFor="email_usr"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo Electrónico
                </label>
                <div className="relative mt-1">
                  <LuMail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="email_usr"
                    name="email_usr"
                    type="email"
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.email_usr ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`} // text-sm para input
                    placeholder="Correo electrónico"
                    {...register("email_usr", {
                      required: {
                        value: true,
                        message: "El email es requerido",
                      },
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                        message: "Ingrese un correo electrónico válido",
                      },
                    })}
                  />
                  {errors.email_usr && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      {/* text-xs para error */}
                      <FaExclamationCircle className="mr-1" />
                      <span>{errors.email_usr.message}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Campo Contraseña */}
              <div>
                <label
                  htmlFor="password_usr"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <div className="relative mt-1">
                  <LuLock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="password_usr"
                    name="password_usr"
                    type={showPassword ? "text" : "password"}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.password_usr ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`} // text-sm para input, pr-10 para icono toggle
                    placeholder="Contraseña"
                    {...register("password_usr", {
                      required: {
                        value: true,
                        message: "La contraseña es requerida",
                      },
                      minLength: {
                        value: 6,
                        message:
                          "La contraseña debe tener al menos 6 caracteres",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.password_usr && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      {/* text-xs para error */}
                      <FaExclamationCircle className="mr-1" />
                      <span>{errors.password_usr.message}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Campo Selección de Rol */}
              <div>
                <label
                  htmlFor="id_rol"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rol de Usuario
                </label>
                <div className="relative mt-1">
                  <LuUserCircle
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <select
                    id="id_rol"
                    name="id_rol"
                    className={`appearance-none block w-full pl-10 pr-8 py-2 border ${
                      errors.id_rol ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700`} // text-sm para select
                    {...register("id_rol", {
                      required: {
                        value: true,
                        message: "Debe seleccionar un rol",
                      },
                      validate: (value) =>
                        value !== "" || "Debe seleccionar un rol",
                    })}
                  >
                    <option value="" className="text-gray-400">
                      -- Seleccione un Rol --
                    </option>
                    <option value="2">Usuario</option>
                    <option value="1">Administrador</option>
                  </select>
                  {errors.id_rol && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      {/* text-xs para error */}
                      <FaExclamationCircle className="mr-1" />
                      <span>{errors.id_rol.message}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    isSubmitting ||
                    Object.keys(errors).length > 0 ||
                    !watchName ||
                    !watchLogin ||
                    !watchEmail ||
                    !watchPassword ||
                    !watchRol
                  }
                >
                  {isSubmitting ? "Registrando..." : "Crear Cuenta"}{" "}
                  {!isSubmitting && <LuArrowRight className="ml-2" size={20} />}
                </button>
              </div>
            </form>

            <div className="text-center text-sm">
              <p className="text-gray-600">
                Ya tienes cuenta?{" "}
                <Link
                  href="/"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Iniciar Sesion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarUsuario;
