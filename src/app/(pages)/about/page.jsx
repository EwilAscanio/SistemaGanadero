"use client";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import FondoLogin from "@/images/ImagenSesion.jpeg";
import Logo from "@/images/Logo.png";
import Image from "next/image";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = "Usuario debe tener al menos 3 caracteres";
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Contraseña debe tener al menos 8 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    // Contenedor principal con fondo y centrado general
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="relative md:w-1/2 h-64 md:h-auto flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none overflow-hidden">
          <Image
            src={FondoLogin}
            alt="Fondo de Inicio de Sesión"
            fill // Usar fill para que la imagen cubra este contenedor
            className="object-cover" // Asegura que la imagen cubra sin distorsionarse
          />
        </div>

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

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Usuario
                </label>
                <div className="mt-1 relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Ingrese su usuario"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <FaExclamationCircle className="mr-1" />
                      <span>{errors.username}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Ingrese su contraseña"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.password && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <FaExclamationCircle className="mr-1" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center mt-16 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.username || !formData.password}
                >
                  Iniciar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
