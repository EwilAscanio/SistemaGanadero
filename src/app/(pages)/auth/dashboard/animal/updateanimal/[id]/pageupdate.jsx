"use client";

import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  LuHash,
  LuBrush,
  LuUsers,
  LuGitBranch,
  LuScanLine,
  LuScale,
  LuTag,
  LuHourglass,
  LuActivity,
  LuDollarSign,
  LuArrowRight,
  LuCalendar,
  LuVenetianMask,
  LuLoader2,
} from "react-icons/lu";
import { FaExclamationCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { useState, useEffect } from "react"; // Removimos useCallback
import FechaNacimientoInput from "@/components/FechaNacimientoInput"; // Tu componente de fecha

// --- Clases CSS simples (Fuera del componente) ---

const baseInputClasses =
  "w-full pl-10 pr-3 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed";
const errorBorderClass = "border-red-500";
const normalBorderClass = "border-gray-300";
const textGray400 = "text-gray-400"; // Para selects sin valor seleccionado

// Helper para clases de inputs/selects basado en errores
const getInputClasses = (
  fieldName,
  errors,
  isSelect = false,
  hasValue = true
) => {
  let classes = baseInputClasses;
  classes += errors[fieldName]
    ? ` ${errorBorderClass}`
    : ` ${normalBorderClass}`;
  if (isSelect) {
    classes += " pr-10 appearance-none"; // Espacio para la flecha y remover flecha nativa
    classes += hasValue ? " text-gray-700" : ` ${textGray400}`; // Color de texto para placeholder/valor
  }
  return classes;
};

const errorTextClass = "flex items-center mt-1 text-red-600 text-xs";
const RequiredAsterisk = () => <span className="text-red-500 ml-1">*</span>;

// --- Helper para formatear fecha (Fuera del componente) ---
const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return ""; // Retorna vacío para fechas inválidas
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formateando fecha:", dateString, e);
    return "";
  }
};

// --- Componente Principal ---

const UpdateAnimal = ({ params }) => {
  const router = useRouter();
  const [grupos, setGrupos] = useState([]);
  const [familyOptions, setFamilyOptions] = useState([]);

  // Estados de carga y error para la carga inicial de datos
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  // Estado de carga específico para las familias (cuando cambia el grupo)
  const [isLoadingFamilias, setIsLoadingFamilias] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control, // Necesario para Controller
    clearErrors,
  } = useForm();

  // Observar el valor del campo 'id_gru' para cargar las familias correspondientes
  const idGruWatched = watch("id_gru");
  const sexoAniWatched = watch("sexo_ani"); // Observar el sexo para campos condicionales

  // useEffect 1: Carga inicial del animal y los grupos
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingInitialData(true);
      setLoadingError(null);

      try {
        // Cargar animal y grupos en paralelo
        const [gruposRes, animalRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/grupoAnimales`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal/${params.id}`
          ),
        ]);

        // Procesar grupos
        if (gruposRes.status === 200) {
          setGrupos(gruposRes.data);
        } else {
          console.warn("Error al cargar grupos:", gruposRes.status);
          setGrupos([]);
        }

        // Procesar datos del animal
        if (animalRes.status === 200) {
          const animalData = animalRes.data;

          // Formatear datos para el formulario
          const formattedData = {
            ...animalData,
            codigo_ani: animalData.codigo_ani || "",
            nombre_ani: animalData.nombre_ani || "",
            chip_ani: animalData.chip_ani || "",
            id_gru: animalData.id_gru || "", // Si id_gru es 0 o null, usar ""
            // *** CLAVE AQUÍ: Asegurarse de que codigo_fam sea STRING ***
            // Si viene null o undefined, usar "", si viene un valor, convertirlo a string.
            codigo_fam: String(animalData.codigo_fam || ""),
            sexo_ani: animalData.sexo_ani || "",
            fechaPalpacion_ani: formatDateToYYYYMMDD(
              animalData.fechaPalpacion_ani
            ),
            tiempoGestacion_ani: animalData.tiempoGestacion_ani || "",
            peso_ani: animalData.peso_ani ?? null, // Mantener null si viene null
            arete_ani: animalData.arete_ani || "",
            fechaNacimiento_ani: formatDateToYYYYMMDD(
              animalData.fechaNacimiento_ani
            ),
            fechaVacunacion_ani: formatDateToYYYYMMDD(
              animalData.fechaVacunacion_ani
            ),
            // *** CLAVE AQUÍ: Asegurarse de que status_ani sea STRING para el select ***
            status_ani: String(animalData.status_ani ?? 1),
            precio_ani: animalData.precio_ani ?? null,
          };

          // Log para verificar los datos formateados, especialmente id_gru y codigo_fam
          console.log(
            "Datos del animal formateados para reset:",
            formattedData
          );

          // Prellenar el formulario con los datos cargados.
          // Esto disparará el siguiente useEffect si id_gru cambia.
          reset(formattedData);
        } else {
          setLoadingError(
            "No se pudieron obtener los datos del animal. Código: " +
              animalRes.status
          );
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setLoadingError(
          "No se pudieron cargar los datos iniciales. Verifique conexión o API."
        );
      } finally {
        setIsLoadingInitialData(false);
      }
    };
    loadInitialData();
    // Dependencias: params.id (para recargar si el ID cambia en la URL) y reset (estable de useForm).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, reset]);

  // useEffect 2: Cargar las familias cuando el grupo seleccionado cambia
  useEffect(() => {
    // Solo cargar si hay un id de grupo válido
    if (idGruWatched) {
      setIsLoadingFamilias(true);
      setFamilyOptions([]); // Limpiar opciones de familia del grupo anterior
      // No limpiamos el valor de 'codigo_fam' aquí porque 'reset' ya lo estableció
      // para la carga inicial. Si el usuario cambia el grupo manualmente,
      // React Hook Form limpiará automáticamente el valor si la opción seleccionada ya no existe.

      axios
        .get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familia/${idGruWatched}`
        )
        .then((response) => {
          if (response.status === 200) {
            const options = response.data.map((fam) => ({
              // *** SOLUCIÓN CLAVE: Convertir el código de familia a STRING ***
              // Esto asegura que el valor de la opción coincida con el valor
              // que 'reset' estableció para 'codigo_fam'.
              value: String(fam.codigo_fam),
              label: fam.name_fam,
            }));
            setFamilyOptions(options);
            // Log para verificar las familias cargadas y sus valores
            console.log(
              "Familias cargadas para grupo",
              idGruWatched,
              ":",
              options
            );
          } else {
            console.warn(
              "Error al cargar familias para grupo",
              idGruWatched,
              ":",
              response.status
            );
            setFamilyOptions([]);
          }
        })
        .catch((error) => {
          console.error("Error al cargar familias:", error);
          setFamilyOptions([]);
        })
        .finally(() => {
          setIsLoadingFamilias(false);
        });
    } else {
      // Si no hay grupo seleccionado (ej. al inicio o si se deselecciona)
      setFamilyOptions([]);
      // Opcional: Limpiar el campo familia si el grupo se deselecciona.
      // Si reset estableció un valor, watch lo mantendrá hasta que cambie el grupo.
      // Si el usuario deselecciona el grupo, esto limpiará el campo familia.
      setValue("codigo_fam", "");
      clearErrors("codigo_fam");
    }
  }, [idGruWatched, setValue, clearErrors]); // Dependencia: el valor observado del grupo

  // Función que se ejecuta al enviar el formulario si la validación es exitosa
  const onSubmit = handleSubmit(async (data) => {
    Swal.close(); // Cerrar SweetAlerts anteriores

    try {
      // Preparar los datos para enviar a la API
      const dataToSend = {
        ...data,
        // Convertir campos opcionales vacíos (string vacíos o NaN) a null si la API lo espera
        chip_ani: data.chip_ani || null,
        arete_ani: data.arete_ani || null,
        peso_ani: data.peso_ani || null,
        precio_ani: data.precio_ani || null,
        // Asegurarse de que status_ani sea un número si la API lo requiere
        status_ani: parseInt(data.status_ani, 10),
        // codigo_fam ya es string por el mapeo en cargarFamilias y reset.
        // id_gru ya es string por reset.

        // Campos condicionales: solo enviar si es hembra y el campo tiene valor
        fechaPalpacion_ani:
          sexoAniWatched === "Hembra" && data.fechaPalpacion_ani
            ? data.fechaPalpacion_ani
            : null,
        tiempoGestacion_ani:
          sexoAniWatched === "Hembra" && data.tiempoGestacion_ani
            ? data.tiempoGestacion_ani
            : null,
      };

      console.log("Datos a enviar para actualizar:", dataToSend);

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal/${params.id}`,
        dataToSend
      );

      // Manejar la respuesta de la API (códigos 2xx para éxito)
      if (res.status >= 200 && res.status < 300) {
        Swal.fire({
          title: "Actualización Exitosa",
          text: "El animal ha sido actualizado exitosamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          router.push(`/auth/dashboard/animal`); // Redirigir
          router.refresh(); // Recargar datos en la página de destino
        });
      } else {
        console.error("Actualización no exitosa:", res.status, res.data);
        Swal.fire({
          title: "Error en la respuesta",
          text: `El servidor respondió con estado ${res.status}.`,
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error(
        "Error al actualizar:",
        error.response?.data || error.message || error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Ocurrió un error al actualizar el animal.";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  });

  // --- Renderizado de la Interfaz ---

  // Mostrar mensaje de error inicial si la carga falló
  if (loadingError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center text-red-600 max-w-md w-full">
          <p className="text-lg font-semibold mb-4">Error al cargar datos:</p>
          <p className="text-gray-700 mb-4">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Mostrar spinner mientras se cargan los datos iniciales (animal y grupos)
  if (isLoadingInitialData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center max-w-md w-full">
          <LuLoader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-semibold">
            Cargando datos del animal y opciones...
          </p>
        </div>
      </div>
    );
  }

  // Renderizar el formulario una vez que los datos iniciales estén listos
  return (
    <div className="flex items-center justify-center p-4 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-4xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Actualizar Animal
          </h1>
          <p className="text-gray-600 text-sm">
            Modifique los datos necesarios
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Campo CODIGO ANIMAL (Read Only) */}
            <div>
              <label
                htmlFor="codigo_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Código Animal
              </label>
              <div className="relative">
                <LuHash
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="codigo_ani"
                  type="text"
                  readOnly
                  disabled={isSubmitting}
                  className={getInputClasses("codigo_ani", errors)}
                  {...register("codigo_ani")}
                />
              </div>
            </div>

            {/* Campo NOMBRE ANIMAL */}
            <div>
              <label
                htmlFor="nombre_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre <RequiredAsterisk />
              </label>
              <div className="relative">
                <LuBrush
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="nombre_ani"
                  type="text"
                  placeholder="Nombre Animal"
                  className={getInputClasses("nombre_ani", errors)}
                  disabled={isSubmitting}
                  {...register("nombre_ani", {
                    required: "El nombre del animal es requerido",
                    minLength: { value: 2, message: "Mínimo 2 caracteres" },
                  })}
                />
                {errors.nombre_ani && (
                  <p role="alert" className={errorTextClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.nombre_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo SEXO ANIMAL */}
            <div>
              <label
                htmlFor="sexo_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sexo <RequiredAsterisk />
              </label>
              <div className="relative">
                <LuVenetianMask
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  id="sexo_ani"
                  className={getInputClasses(
                    "sexo_ani",
                    errors,
                    true,
                    !!sexoAniWatched
                  )} // Es select, pasar hasValue
                  disabled={isSubmitting}
                  {...register("sexo_ani", {
                    required: "Debe seleccionar el sexo",
                  })}
                >
                  <option value="">-- Seleccione Sexo --</option>
                  <option value="Hembra">Hembra</option>
                  <option value="Macho">Macho</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none">
                  <LuArrowRight size={20} />
                </div>
                {errors.sexo_ani && (
                  <p role="alert" className={errorTextClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.sexo_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo CHIP ANIMAL (Opcional) */}
            <div>
              <label
                htmlFor="chip_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Chip (Opcional)
              </label>
              <div className="relative">
                <LuScanLine
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="chip_ani"
                  type="text"
                  placeholder="Chip (Opcional)"
                  className={getInputClasses("chip_ani", errors)}
                  disabled={isSubmitting}
                  {...register("chip_ani")}
                />
              </div>
            </div>

            {/* Campo GRUPO ANIMAL */}
            <div>
              <label
                htmlFor="id_gru"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Grupo Animal <RequiredAsterisk />
              </label>
              <div className="relative">
                <LuUsers
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  id="id_gru"
                  className={getInputClasses(
                    "id_gru",
                    errors,
                    true,
                    !!idGruWatched
                  )} // Es select, pasar hasValue
                  disabled={isSubmitting || grupos.length === 0}
                  {...register("id_gru", {
                    required: "Debe seleccionar un grupo",
                  })}
                >
                  <option value="">-- Seleccione Grupo --</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id_gru} value={grupo.id_gru}>
                      {grupo.name_gru}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none">
                  <LuArrowRight size={20} />
                </div>
                {errors.id_gru && (
                  <p role="alert" className={errorTextClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.id_gru.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo FAMILIA ANIMAL */}
            <div>
              <label
                htmlFor="codigo_fam"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Familia Animal <RequiredAsterisk />
              </label>
              <div className="relative">
                <LuGitBranch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  id="codigo_fam"
                  className={getInputClasses(
                    "codigo_fam",
                    errors,
                    true,
                    !!watch("codigo_fam")
                  )} // Es select, pasar hasValue
                  disabled={
                    isSubmitting ||
                    !idGruWatched || // Deshabilitado si no hay grupo
                    isLoadingFamilias || // Deshabilitado mientras se cargan
                    (idGruWatched &&
                      familyOptions.length === 0 &&
                      !isLoadingFamilias) // Deshabilitado si el grupo está seleccionado pero no hay familias cargadas y no están cargando
                  }
                  {...register("codigo_fam", {
                    required: "Debe seleccionar una familia",
                  })}
                >
                  <option value="">-- Seleccione Familia --</option>
                  {/* Renderizar opciones solo si hay un grupo seleccionado y opciones cargadas */}
                  {idGruWatched &&
                    familyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                {/* Spinner de carga para familias */}
                {isLoadingFamilias && (
                  <LuLoader2
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin z-10"
                    size={20}
                  />
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none">
                  <LuArrowRight size={20} />
                </div>
                {errors.codigo_fam && (
                  <p role="alert" className={errorTextClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.codigo_fam.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo ARETE ANIMAL (Opcional) */}
            <div>
              <label
                htmlFor="arete_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Arete (Opcional)
              </label>
              <div className="relative">
                <LuTag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="arete_ani"
                  type="text"
                  placeholder="Arete (Opcional)"
                  className={getInputClasses("arete_ani", errors)}
                  disabled={isSubmitting}
                  {...register("arete_ani")}
                />
              </div>
            </div>

            {/* Campo PESO ANIMAL (Opcional) */}
            <div>
              <label
                htmlFor="peso_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Peso (Kg) (Opcional)
              </label>
              <div className="relative">
                <LuScale
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="peso_ani"
                  type="number"
                  step="0.01"
                  placeholder="Peso (Kg) (Opcional)"
                  className={getInputClasses("peso_ani", errors)}
                  disabled={isSubmitting}
                  {...register("peso_ani", { valueAsNumber: true })}
                />
                {errors.peso_ani && (
                  <p role="alert" className={errorTextClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.peso_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo FECHA PALPACION (condicional) */}
            {/* Deshabilitar visual y funcionalmente si no es Hembra */}
            <div
              className={`relative ${
                sexoAniWatched !== "Hembra"
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              <label
                htmlFor="fechaPalpacion_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha Palpación{" "}
                {sexoAniWatched === "Hembra" && <RequiredAsterisk />}
              </label>
              <div className="relative mt-1">
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                <input
                  id="fechaPalpacion_ani"
                  type="date"
                  className={getInputClasses("fechaPalpacion_ani", errors)}
                  disabled={isSubmitting || sexoAniWatched !== "Hembra"}
                  {...register("fechaPalpacion_ani", {
                    required:
                      sexoAniWatched === "Hembra"
                        ? "La fecha de palpación es requerida"
                        : false,
                    validate: (value) => {
                      if (sexoAniWatched === "Hembra" && value) {
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        selectedDate.setHours(0, 0, 0, 0);
                        if (isNaN(selectedDate.getTime()))
                          return "Formato inválido";
                        return selectedDate <= today || "No puede ser futura";
                      }
                      return true;
                    },
                  })}
                />
              </div>
              {errors.fechaPalpacion_ani && sexoAniWatched === "Hembra" && (
                <p role="alert" className={errorTextClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.fechaPalpacion_ani.message}
                </p>
              )}
            </div>

            {/* Campo TIEMPO DE GESTACION (condicional) */}
            {/* Deshabilitar visual y funcionalmente si no es Hembra */}
            <div
              className={`relative ${
                sexoAniWatched !== "Hembra"
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              <label
                htmlFor="tiempoGestacion_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tiempo de Gestación{" "}
                {sexoAniWatched === "Hembra" && <RequiredAsterisk />}
              </label>
              <div className="relative mt-1">
                <LuHourglass
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                <input
                  id="tiempoGestacion_ani"
                  type="text"
                  placeholder="Gestación (ej: 60 días)"
                  className={getInputClasses("tiempoGestacion_ani", errors)}
                  disabled={isSubmitting || sexoAniWatched !== "Hembra"}
                  {...register("tiempoGestacion_ani", {
                    required:
                      sexoAniWatched === "Hembra"
                        ? "El tiempo de gestación es requerido"
                        : false,
                  })}
                />
              </div>
              {errors.tiempoGestacion_ani && sexoAniWatched === "Hembra" && (
                <p role="alert" className={errorTextClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.tiempoGestacion_ani.message}
                </p>
              )}
            </div>

            {/* Campo FECHA NACIMIENTO (Usando Custom Component con Controller) */}
            <div>
              <label
                htmlFor="fechaNacimiento_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de Nacimiento <RequiredAsterisk />
              </label>
              <div className="relative mt-1">
                {/* Icono (Si tu componente no lo tiene, puedes agregarlo aquí) */}
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                {/* Usar Controller para integrar tu componente con RHF */}
                <Controller
                  name="fechaNacimiento_ani"
                  control={control}
                  rules={{
                    required: "La fecha de nacimiento es requerida",
                    validate: (value) => {
                      if (!value) return true;
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      selectedDate.setHours(0, 0, 0, 0);
                      if (isNaN(selectedDate.getTime()))
                        return "Formato inválido";
                      return selectedDate <= today || "No puede ser futura";
                    },
                  }}
                  render={({ field }) => (
                    <FechaNacimientoInput // Tu componente de fecha
                      {...field} // Pasa value, onChange, onBlur
                      id="fechaNacimiento_ani" // Para la label
                      className={getInputClasses("fechaNacimiento_ani", errors)} // Clases visuales
                      disabled={isSubmitting} // Estado de envío
                      // Pasar error y errorMessage si tu componente FechaNacimientoInput los maneja
                      error={!!errors.fechaNacimiento_ani}
                      errorMessage={errors.fechaNacimiento_ani?.message}
                    />
                  )}
                />
              </div>
              {/* Mostrar error de RHF */}
              {errors.fechaNacimiento_ani && (
                <p role="alert" className={errorTextClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.fechaNacimiento_ani.message}
                </p>
              )}
            </div>

            {/* Campo FECHA ULTIMA VACUNACION */}
            <div>
              <label
                htmlFor="fechaVacunacion_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha Última Vacunación <RequiredAsterisk />
              </label>
              <div className="relative mt-1">
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                <input
                  id="fechaVacunacion_ani"
                  type="date"
                  className={getInputClasses("fechaVacunacion_ani", errors)}
                  disabled={isSubmitting}
                  {...register("fechaVacunacion_ani", {
                    required: "La fecha de vacunación es requerida",
                    validate: (value) => {
                      if (!value) return true;
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      selectedDate.setHours(0, 0, 0, 0);
                      if (isNaN(selectedDate.getTime()))
                        return "Formato inválido";
                      return selectedDate <= today || "No puede ser futura";
                    },
                  })}
                />
                {errors.fechaVacunacion_ani && (
                  <p role="alert" className={errorTextClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.fechaVacunacion_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo STATUS ANIMAL */}
            <div>
              <label
                htmlFor="status_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status <RequiredAsterisk />
              </label>
              <div className="relative mt-1">
                <LuActivity
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  id="status_ani"
                  className={getInputClasses(
                    "status_ani",
                    errors,
                    true,
                    !!watch("status_ani")
                  )} // Es select, pasar hasValue
                  disabled={isSubmitting}
                  {...register("status_ani", {
                    required: "El status es requerido",
                  })}
                >
                  <option value="1">Activo</option>
                  <option value="2">Inactivo</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none">
                  <LuArrowRight size={20} />
                </div>
                {errors.status_ani && (
                  <p role="alert" className={errorTextClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.status_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo PRECIO ANIMAL (Opcional) */}
            <div>
              <label
                htmlFor="precio_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Precio (Opcional)
              </label>
              <div className="relative mt-1">
                <LuDollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="precio_ani"
                  type="number"
                  step="0.01"
                  placeholder="Precio (Opcional)"
                  className={getInputClasses("precio_ani", errors)}
                  disabled={isSubmitting}
                  {...register("precio_ani", { valueAsNumber: true })}
                />
                {errors.precio_ani && (
                  <p role="alert" className={errorTextClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.precio_ani.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LuLoader2 className="animate-spin mr-2" size={20} />
                  Actualizando...
                </>
              ) : (
                <>
                  Actualizar Animal
                  <LuArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAnimal;
