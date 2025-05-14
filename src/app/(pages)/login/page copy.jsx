"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuUser, LuLock, LuArrowRight } from "react-icons/lu";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Swal from "sweetalert2";

const Login = () => {
  const [error, setError] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //Funcion a utilizar el formulario
  const onSubmit = handleSubmit(async (data) => {
    console.log(data);

    // Aqui se envian los datos para el acceso, es decir los campos
    //que va a verificar el credencials.
    const resp = await signIn("credentials", {
      login: data.login_usr,
      password: data.password_usr,
      redirect: false,
    });

    if (resp.error) {
      Swal.fire({
        title: "Credenciales Incorrectas",
        text: "Por Favor Verifique.",
        icon: "warning",
        confirmButtonColor: "#d33",
      });
      setError(resp.error);
    } else {
      router.push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/dashboard`);
      router.refresh();
    }
  });

  return (
    <div className="mt-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
          <p className="text-gray-600 mt-2">
            Por favor inicia sesión en tu cuenta
          </p>
        </div>
        <form className="space-y-6" onSubmit={onSubmit}>
          {/* Campo numero 1 del Formulario LOGIN*/}
          <div className="relative">
            <LuUser
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Login"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("login_usr", {
                required: {
                  value: true,
                  message: "campo requerido",
                },
                minLength: {
                  value: 2,
                  message: "El nombre debe terner minimo 2 caracteres",
                },
              })}
            />
            {/* Manejo de Errores */}
            {errors.name && (
              <span className="text-red-600 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Campo numero 4 del Formulario PASSWORD*/}
          <div className="relative">
            <LuLock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("password_usr", {
                required: {
                  value: true,
                  message: "campo requerido",
                },
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener minimo 6 digitos",
                },
              })}
            />
            {/* Manejo de Errores */}
            {errors.password && (
              <span className="text-red-600 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            Iniciar Sesion
            <LuArrowRight className="ml-2" size={20} />
          </button>
        </form>
        <div className="mt-6 flex justify-between items-center">
          <Link href="#" className="text-sm text-blue-600 hover:underline">
            Olvido de Contraseña?
          </Link>
          <Link
            href="/register"
            className="text-sm text-blue-600 hover:underline"
          >
            Crear Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
