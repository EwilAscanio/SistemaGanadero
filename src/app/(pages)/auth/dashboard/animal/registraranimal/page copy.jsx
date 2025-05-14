"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  LuHash,
  LuBrush,
  LuUsers,
  LuGitBranch,
  LuVenetianMask,
  LuScanLine,
  LuScale,
  LuTag,
  LuHourglass,
  LuActivity,
  LuDollarSign,
  LuArrowRight,
  LuCalendar,
} from "react-icons/lu";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import FechaNacimientoInput from "@/components/FechaNacimientoInput";

const Animal = () => {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [familyOptions, setFamilyOptions] = useState([]);
  const [selectedSex, setSelectedSex] = useState("");
  const [grupos, setGrupos] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    // Para establecer valores por defecto
    defaultValues: {
      codigo_ani: "",
      nombre_ani: "",
      chip_ani: "",
      id_gru: "",
      codigo_fam: "",
      sexo_ani: "",
      fechaPalpacion_ani: "",
      tiempoGestacion_ani: "",
      peso_ani: "",
      arete_ani: "",
      fechaNacimiento_ani: "", // Importante inicializarlo aunque sea vacío
      fechaVacunacion_ani: "",
      status_ani: "1", // Valor por defecto para activo, por ejemplo
      precio_ani: "",
    },
  });

  // UseEffect para cargar los grupos de animales al inicio
  useEffect(() => {
    // Obtener los grupos de animales desde la API
    const cargarGrupo = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/grupoAnimales`
        );

        if (response.status === 200) {
          setGrupos(response.data);
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar los grupos",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    };

    cargarGrupo();
  }, []);

  //UseEffect para cargar las familias de animales al seleccionar un grupo
  useEffect(() => {
    const cargarFamilias = async () => {
      if (selectedGroup) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familia/${selectedGroup}`
          );

          // Crear opciones como objetos, no como JSX directamente para el estado
          const options = response.data.map((fam) => ({
            value: fam.codigo_fam,
            label: fam.name_fam,
          }));
          setFamilyOptions(options); // Guardar los datos, no los <option>
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: "No se pudieron cargar las familias",
            icon: "error",
          });
          setFamilyOptions([]); // Limpiar en caso de error
        }
      } else {
        setFamilyOptions([]); // Limpiar si no hay grupo
      }
    };
    cargarFamilias();
  }, [selectedGroup]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Convertir valores numéricos y fechas si es necesario antes de enviar
      const dataToSend = {
        ...data,
        peso_ani: data.peso_ani ? parseFloat(data.peso_ani) : null,
        precio_ani: data.precio_ani ? parseFloat(data.precio_ani) : null,
        status_ani: parseInt(data.status_ani, 10),
      };

      console.log("Datos a enviar:", dataToSend);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal`,
        dataToSend // Enviar los datos procesados
      );

      if (res.status === 200) {
        Swal.fire({
          title: "Registro Exitoso",
          text: "Animal registrado correctamente",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        router.push(`/auth/dashboard`); // Es más seguro usar rutas relativas o absolutas sin la variable de entorno aquí si es posible
        router.refresh();
      }
    } catch (error) {
      console.error("Error en onSubmit:", error.response || error); // Mejor log del error
      const codigoError = error.response?.status;
      const mensageError =
        error.response?.data?.message || "Ocurrió un error inesperado."; // Mensaje por defecto

      // Simplificación manejo de errores
      Swal.fire({
        title: `Error ${codigoError ? `(${codigoError})` : ""}`,
        text: mensageError,
        icon: "error",
        confirmButtonColor: "#d33",
      });

      if (codigoError === 400 || codigoError === 409 || codigoError === 500) {
        Swal.fire({
          title: "Error de Registro",
          text: mensageError,
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } else {
        // Error genérico si no es uno de los esperados
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error inesperado al registrar el animal.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  });

  // Estilo común para labels
  const labelClass = "block mb-1 text-sm font-medium text-gray-700";

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Registrar Animal
            </h1>
            <p className="text-gray-600 mt-2">
              Rellene los datos correctamente
            </p>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo numero 1 del Formulario CODIGO ANIMAL */}
              <div className="relative">
                <LuHash
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Código Animal *"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("codigo_ani", {
                    required: "El código del animal es requerido",
                    minLength: {
                      value: 2,
                      message: "El código debe tener mínimo 2 caracteres",
                    },
                  })}
                />
                {errors.codigo_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.codigo_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 2 del Formulario NOMBRE ANIMAL */}
              <div className="relative">
                <LuBrush
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Nombre Animal *"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("nombre_ani", {
                    required: "El nombre del animal es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener mínimo 2 caracteres",
                    },
                  })}
                />
                {errors.nombre_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.nombre_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 3 del Formulario GRUPO ANIMAL */}
              <div className="relative">
                <select
                  className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                    watch("id_gru") ? "text-gray-700" : "text-gray-400"
                  }`} // Cambiar color del texto si hay valor
                  {...register("id_gru", {
                    required: "Debe seleccionar un grupo",
                    onChange: (e) => {
                      setSelectedGroup(e.target.value);
                      setValue("codigo_fam", ""); // Reinicia la familia al cambiar grupo
                    },
                  })}
                >
                  <option value="">Grupo Animal *</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id_gru} value={grupo.id_gru}>
                      {grupo.name_gru}
                    </option>
                  ))}
                </select>
                <LuUsers
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <LuArrowRight
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
                  size={20}
                />
                {errors.id_gru && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.id_gru.message}
                  </span>
                )}
              </div>
              {/* Campo numero 4 del Formulario FAMILIA ANIMAL */}
              <div className="relative">
                <select
                  className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                    watch("codigo_fam") ? "text-gray-700" : "text-gray-400"
                  }`} // Cambiar color del texto
                  {...register("codigo_fam", {
                    required: "Debe seleccionar una familia", // Hacerlo requerido
                  })}
                  disabled={!selectedGroup || familyOptions.length === 0} // Deshabilitar si no hay grupo o familias
                >
                  <option value="">Familia Animal *</option>
                  {/* Renderizar las opciones desde el estado */}
                  {familyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <LuGitBranch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <LuArrowRight
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
                  size={20}
                />
                {errors.codigo_fam && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.codigo_fam.message}
                  </span>
                )}
              </div>
              {/* Campo numero 5 del Formulario SEXO ANIMAL */}
              <div className="relative">
                <select
                  className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                    watch("sexo_ani") ? "text-gray-700" : "text-gray-400"
                  }`}
                  {...register("sexo_ani", {
                    required: "Debe seleccionar el sexo",
                    onChange: (e) => {
                      const sexo = e.target.value;
                      setSelectedSex(sexo);
                      // Si es Macho, limpiar y deshabilitar campos de hembra
                      if (sexo === "Macho") {
                        setValue("fechaPalpacion_ani", "", {
                          shouldValidate: false,
                        }); // No validar al limpiar
                        setValue("tiempoGestacion_ani", "", {
                          shouldValidate: false,
                        });
                      }
                      // Si cambia a Hembra, los campos se habilitarán por la condición 'disabled'
                    },
                  })}
                >
                  <option value="">Sexo Animal *</option>
                  <option value="Hembra">Hembra</option>
                  <option value="Macho">Macho</option>
                </select>
                <LuVenetianMask
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <LuArrowRight
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
                  size={20}
                />
                {errors.sexo_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.sexo_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 6 del Formulario CHIP ANIMAL */}
              <div className="relative">
                <LuScanLine // Considera usar un ícono más apropiado para Chip si existe
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Chip (Opcional)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("chip_ani")} // Sin validaciones específicas por ahora
                />
                {errors.chip_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.chip_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 7 del Formulario PESO ANIMAL */}
              <div className="relative">
                <LuScale
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number" // Usar number para validación numérica
                  step="0.1" // Permitir decimales (ej. para Kg)
                  placeholder="Peso (Kg) (Opcional)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("peso_ani", {
                    valueAsNumber: true, // Convierte a número
                    min: { value: 0, message: "El peso no puede ser negativo" }, // Validación simple
                  })}
                />
                {errors.peso_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.peso_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 8 del Formulario ARETE ANIMAL */}
              <div className="relative">
                <LuTag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Arete"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register("arete_ani", {
                    required: "El arete del animal es requerido",
                    minLength: {
                      value: 2,
                      message: "El arete debe tener mínimo 2 caracteres",
                    },
                  })}
                />
                {errors.arete_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.arete_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 9 del Formulario FECHA PALPACION (condicional) */}
              {/* ENVUELTO EN UN DIV PARA EL GRID */}
              <div>
                <label htmlFor="fechaPalpacion_ani" className={labelClass}>
                  Fecha Palpación (Hembra)
                  {selectedSex === "Hembra" && " *"}{" "}
                  {/* Indica si es requerido */}
                </label>
                <div className="relative">
                  <LuCalendar // Usar ícono de calendario
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    id="fechaPalpacion_ani" // Añadir ID para el label
                    type="date"
                    // El placeholder en type="date" no se ve en todos los navegadores, el label es más importante
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={selectedSex !== "Hembra"} // Deshabilitar si no es hembra
                    {...register("fechaPalpacion_ani", {
                      // Requerido solo si es hembra
                      required:
                        selectedSex === "Hembra"
                          ? "La fecha de palpación es requerida para hembras"
                          : false,
                    })}
                  />
                </div>
                {/* Mover el span de error DENTRO de este div contenedor */}
                {errors.fechaPalpacion_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.fechaPalpacion_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 10 del Formulario TIEMPO DE GESTACION (condicional) */}
              {/* Este campo no es de fecha, pero lo mantengo envuelto en un div para el grid */}
              <div>
                <label htmlFor="tiempodegestacion_ani" className={labelClass}>
                  Tiempo de Gestacion
                </label>
                <div className="relative">
                  
                  {/* Este div ya estaba para el ícono y es el elemento del grid */}
                  <LuHourglass
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text" // Podría ser number si solo esperas números (e.g., días)
                    placeholder="Gestación (días/meses)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={selectedSex !== "Hembra"}
                    {...register("tiempoGestacion_ani", {
                      required:
                        selectedSex === "Hembra"
                          ? "El tiempo de gestación es requerido para hembras"
                          : false,
                      minLength:
                        selectedSex === "Hembra"
                          ? { value: 1, message: "Indique el tiempo" }
                          : undefined, // Ajusta según necesites
                    })}
                  />
                  {errors.tiempoGestacion_ani && (
                    <span className="text-red-600 text-sm mt-1 block">
                      {errors.tiempoGestacion_ani.message}
                    </span>
                  )}
                </div>
              </div>
              {/* Campo numero 11 del Formulario FECHA NACIMIENTO */}
              <div>
                <label htmlFor="fechaNacimiento_ani" className={labelClass}>
                  Fecha de Nacimiento *
                </label>

                <FechaNacimientoInput
                  name="fechaNacimiento_ani" // Asegúrate de que el componente use este name/id
                  registerProps={register("fechaNacimiento_ani", {
                    required: "La fecha de nacimiento es requerida",
                    validate: (value) => {
                      if (!value) return true; // No validar si está vacío (ya lo cubre required)
                    
                      // Esperamos el formato yyyy-mm-dd del input type="date"
                      const parts = value.split("-"); // ¡Dividir por guión (-) ahora!
                    
                      // Asegurarse de que hay 3 partes y son números válidos
                      if (
                        parts.length === 3 &&
                        !isNaN(parts[0]) && // yyyy
                        !isNaN(parts[1]) && // mm
                        !isNaN(parts[2])    // dd
                      ) {
                        // Extraer las partes en el orden correcto: año, mes, día
                        const [yyyy, mm, dd] = parts.map(Number);
                    
                        // Opcional pero útil: verificación básica de rangos
                         if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
                             return "Fecha inválida. Mes o día fuera de rango.";
                         }
                    
                    
                        // Los meses en JavaScript son 0-indexados (enero es 0, diciembre es 11)
                        const selectedDate = new Date(yyyy, mm - 1, dd);
                    
                        // --- **VERIFICACIÓN ADICIONAL DE FECHA VÁLIDA** ---
                        // Comprobar si los componentes de la fecha creada coinciden con los componentes de entrada.
                        // Esto detecta fechas numéricamente inválidas como el 31 de Febrero.
                        const isValidDate =
                          selectedDate.getFullYear() === yyyy &&
                          selectedDate.getMonth() === mm - 1 &&
                          selectedDate.getDate() === dd;
                    
                        if (!isValidDate) {
                          return "Fecha inválida. Por favor, asegúrate de que la fecha exista (ej. 31 de Febrero no existe).";
                        }
                        // --- **FIN VERIFICACIÓN ADICIONAL** ---
                    
                    
                        const today = new Date();
                        // Ajustar la hora a 0 para comparar solo fechas
                        today.setHours(0, 0, 0, 0);
                        selectedDate.setHours(0, 0, 0, 0);
                    
                        return (
                          selectedDate <= today ||
                          "La fecha de nacimiento no puede ser futura"
                        );
                      }
                    
                      // Si el formato no es yyyy-mm-dd (esto es menos probable con type="date" a menos que el valor se manipule)
                      console.error("Formato de fecha inesperado:", value); // Para depuración
                      return "Formato de fecha inválido. Por favor, usa el formato yyyy-mm-dd (el navegador lo gestiona).";
                    },
                    
                  })}
                  error={errors.fechaNacimiento_ani}
                />
              </div>
              {/* Campo numero 12 del Formulario FECHA VACUNACION */}
              <div>
                <label htmlFor="fechaVacunacion_ani" className={labelClass}>
                  Fecha Última Vacunación *
                </label>
                <div className="relative">
                  <LuCalendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    id="fechaVacunacion_ani" // Añadir ID para el label
                    type="date" // Usar date
                    // El placeholder en type="date" no se ve en todos los navegadores
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("fechaVacunacion_ani", {
                      required: "La fecha de vacunación es requerida", // O quitar si es opcional
                    })}
                  />
                </div>

                {errors.fechaVacunacion_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.fechaVacunacion_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 13 del Formulario STATUS ANIMAL */}
              <div>
                <label htmlFor="status_ani" className={labelClass}>
                  Status del Animal *
                </label>
                <div className="relative">
                  <select
                    id="status_ani" // Añadir ID para el label
                    className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-gray-700`} // Siempre texto oscuro aquí
                    {...register("status_ani", {
                      required: "El status es requerido",
                    })}
                    defaultValue="1" // Establecer valor predeterminado
                  >
                    {/* Quitamos la opción vacía si hay default */}
                    <option value="1">Activo</option>
                    <option value="2">Inactivo</option>
                  </select>
                  <LuActivity
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <LuArrowRight
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
                    size={20}
                  />
                </div>

                {errors.status_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.status_ani.message}
                  </span>
                )}
              </div>
              {/* Campo numero 14 del Formulario PRECIO ANIMAL*/}
              <div>
                <label htmlFor="precio_ani" className={labelClass}>
                  Precio (Opcional)
                </label>
                <div className="relative">
                  <LuDollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    id="precio_ani"
                    type="number"
                    step="0.01" // Para precios con centavos
                    placeholder="1000"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("precio_ani", {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "El precio no puede ser negativo",
                      },
                    })}
                  />
                </div>
                {/* Mover el span de error DENTRO de este div contenedor */}
                {errors.precio_ani && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.precio_ani.message}
                  </span>
                )}
              </div>
              {/* Botón de Envío */}
              <button
                type="submit"
                // Ocupa todo el ancho en pantallas pequeñas, y las 2 columnas en medianas y grandes
                className="md:col-span-2 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center mt-4 text-lg font-semibold" // Aumentado padding y tamaño/peso de fuente
              >
                Registrar Animal
                <LuArrowRight className="ml-2" size={20} />
              </button>
            </div>{" "}
            {/* Fin del grid */}
          </form>
        </div>
      </div>
    </>
  );
};

export default Animal;
