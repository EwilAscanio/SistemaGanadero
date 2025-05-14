"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuUser, LuLock, LuArrowRight } from "react-icons/lu";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Swal from "sweetalert2";
import Image from "next/image";
import FondoLogin from "@/images/ImagenSesion.jpeg";
import Logo from "@/images/Logo.png";

const MergedLoginForm = () => {
  // Estado para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false);
  // Estado para manejar errores generales de autenticación (aunque SweetAlert2 ya lo maneja visualmente)
  const [error, setError] = useState(null); // Mantener por si acaso, aunque Swal es primario

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid }, // <-- Añadir isValid aquí
    // watch, // Ya no necesitas watch solo para deshabilitar el botón
  } = useForm({
    // Puedes añadir defaultValues si es necesario, o mode: "onBlur" o "onChange"
    mode: "onChange", // Opcional: valida y actualiza `isValid` en cada cambio
  });

  // Función para manejar el envío del formulario
  const onSubmit = handleSubmit(async (data) => {
    // Limpiamos errores previos si los hay
    setError(null);

    // Llamada a signIn de Next-Auth
    const resp = await signIn("credentials", {
      login: data.login_usr, // Usamos el nombre de campo registrado con RHF
      password: data.password_usr, // Usamos el nombre de campo registrado con RHF
      redirect: false, // Importante para manejar la redirección manualmente
    });

    if (resp?.error) {
      // Si hay un error de autenticación (credenciales incorrectas, etc.)
      Swal.fire({
        title: "Error de Inicio de Sesión",
        text: "Credenciales incorrectas. Por favor, verifique su usuario y contraseña.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setError(resp.error); // Opcional, Swal ya mostró el error
    } else {
      // Si el inicio de sesión es exitoso
      Swal.fire({
        title: "Inicio de Sesión Exitoso",
        text: "Redirigiendo a la página principal.",
        icon: "success",
        timer: 1500, // Muestra el mensaje por 1.5 segundos
        showConfirmButton: false,
      }).then(() => {
        // Redirige al dashboard
        // Asegúrate de que esta ruta sea correcta y segura (tal vez no necesites NEXT_PUBLIC_NEXTAUTH_URL aquí si es una ruta interna)
        router.push("/auth/dashboard"); // RHF deberías poder usar la ruta interna directamente
        // router.refresh(); // Esta llamada es a veces necesaria, pero puede causar doble renderizado. Prueba sin ella primero.
      });
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Panel de Imagen */}
        <div className="relative md:w-1/2 h-64 md:h-auto flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none overflow-hidden">
          <Image
            src={FondoLogin}
            alt="Fondo de Inicio de Sesión"
            fill
            className="object-cover"
          />
        </div>

        {/* Panel del Formulario */}
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white rounded-b-lg md:rounded-r-lg md:rounded-tl-none">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              {/* Logo de la empresa */}
              <Image
                src={Logo}
                alt="Logo"
                className="h-28 w-auto mb-4 mx-auto"
              />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido
              </h2>
              <p className="text-gray-600">
                Ingrese sus credenciales para continuar
              </p>
            </div>

            {/* Formulario utilizando React Hook Form */}
            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              {/* Campo de Usuario/Login */}
              <div>
                <label
                  htmlFor="login_usr"
                  className="block text-sm font-medium text-gray-700"
                >
                  Usuario o Login
                </label>
                <div className="mt-1 relative">
                  <LuUser
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="login_usr"
                    name="login_usr"
                    type="text"
                    className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                      errors.login_usr ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Ingrese su usuario o login"
                    {...register("login_usr", {
                      required: {
                        value: true,
                        message: "El usuario/login es requerido",
                      },
                      minLength: {
                        value: 3,
                        message:
                          "El usuario/login debe tener al menos 3 caracteres",
                      },
                    })}
                  />
                  {/* Mostrar error si existe */}
                  {errors.login_usr && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <FaExclamationCircle className="mr-1" />
                      <span>{errors.login_usr.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div>
                <label
                  htmlFor="password_usr"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <LuLock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="password_usr" // ID para la etiqueta label
                    name="password_usr"
                    type={showPassword ? "text" : "password"}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.password_usr ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Ingrese su contraseña"
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
                  {/* Botón para mostrar/ocultar contraseña */}
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

                  
                </div>
              </div>

              {/* Botón de Iniciar Sesión */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !isValid} // <-- ¡Cambiado aquí!
                >
                  {isSubmitting ? "Iniciando Sesión..." : "Iniciar Sesión"}{" "}
                  {!isSubmitting && (
                    <LuArrowRight className="ml-2" size={20} />
                  )}
                </button>
              </div>
            </form>

            {/* Enlaces (comentados) */}
            {/* <div className="mt-6 flex justify-between items-center text-sm">
              <Link href="#" className="text-blue-600 hover:underline">
                Olvido de Contraseña?
              </Link>
              <Link
                href="/register"
                className="text-blue-600 hover:underline"
              >
                Crear Cuenta
              </Link>
            </div> */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MergedLoginForm;