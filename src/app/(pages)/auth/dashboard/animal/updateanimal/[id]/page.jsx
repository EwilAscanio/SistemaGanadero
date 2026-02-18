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
import { useState, useEffect, useCallback } from "react";
import clsx from "clsx"; // Para manejar clases CSS condicionales

import FechaNacimientoInput from "@/components/FechaNacimientoInput";

// --- Clases CSS comunes (Fuera del componente para no redefinir) ---

const baseInputClass = `
  w-full pl-10 pr-3 py-2 border rounded-lg text-sm
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  text-gray-700
  disabled:bg-gray-100 disabled:cursor-not-allowed
`;

const inputClass = (fieldName, errors) =>
  clsx(baseInputClass, {
    "border-red-500": errors[fieldName],
    "border-gray-300": !errors[fieldName],
  });

const selectClass = (fieldName, errors, hasValue) =>
  clsx(baseInputClass, "pr-10 appearance-none", {
    "border-red-500": errors[fieldName],
    "border-gray-300": !errors[fieldName],
    "text-gray-400": !hasValue, // Estilo para placeholder (opción vacía)
    "text-gray-700": hasValue, // Estilo cuando hay una opción seleccionada
  });

const errorClass = "flex items-center mt-1 text-red-600 text-xs";


// --- Helper para formatear fecha (Fuera del componente) ---
const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Verifica si la fecha es válida antes de formatear
    if (isNaN(date.getTime())) {
      // console.error("Fecha inválida recibida:", dateString); // Útil para depuración
      return "";
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

  // Estado de carga inicial para el animal y los grupos
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
    control, // Objeto control necesario para el componente FechaNacimientoInput con Controller
    clearErrors,
  } = useForm({});

  // Watch para obtener los valores actuales del formulario y reaccionar a ellos
  const idGruWatched = watch("id_gru");
  const sexoAniWatched = watch("sexo_ani");

  // UseEffect para cargar los datos del animal específico y los grupos al inicio.
  // Se combinan para un solo estado de carga inicial.
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingInitialData(true);
      setLoadingError(null);

      try {
        // Usar Promise.all para cargar animal y grupos en paralelo
        const [gruposRes, animalRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/grupoAnimales`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal/${params.id}`
          ),
        ]);

        // Procesar respuesta de grupos
        if (gruposRes.status === 200) {
          setGrupos(gruposRes.data);
        } else {
          // Si no se cargan los grupos, puede que el selector de grupo esté vacío.
          // Depende de si esto es un error bloqueante en tu app.
          console.warn("Error al cargar grupos:", gruposRes.status);
          setGrupos([]); // Asegurar que siempre sea un array
        }

        // Procesar respuesta del animal
        if (animalRes.status === 200) {
          const animalData = animalRes.data;

          // Formatear datos para el formulario
          const formattedData = {
            ...animalData,
            codigo_fam: String(animalData.codigo_fam ?? ""), // Convertir a string
            codigo_ani: animalData.codigo_ani || "",
            nombre_ani: animalData.nombre_ani || "",
            chip_ani: animalData.chip_ani || "",
            id_gru: animalData.id_gru || "", // Es crucial que este valor se establezca para disparar la carga de familias
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
            status_ani: String(animalData.status_ani ?? 1), // Asegurar string y default a '1'
            precio_ani: animalData.precio_ani ?? null, // Mantener null si viene null
          };

          // Prellenar el formulario con los datos cargados.
          // Esto establecerá id_gru y codigo_fam en el formulario.
          reset(formattedData);

          // La carga de familias para el id_gru inicial se manejará automáticamente
          // por el useEffect que observa idGruWatched.
        } else {
          // Si no se carga el animal, esto sí es un error bloqueante para este formulario.
          setLoadingError(
            "No se pudieron obtener los datos del animal. Código: " +
              animalRes.status
          );
          // No llamar reset si hay error en la carga del animal principal
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        // Capturar cualquier error de red o del servidor en Promise.all
        setLoadingError(
          "No se pudieron cargar los datos iniciales (animal o grupos). Verifique la conexión o las APIs."
        );
      } finally {
        setIsLoadingInitialData(false);
      }
    };
    loadInitialData();
    // Las dependencias son params.id (para recargar si el ID cambia en la URL) y reset (estable de useForm).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, reset]);

  // Función para cargar las familias de animales basado en el grupo seleccionado.
  // Usamos useCallback para que la función sea estable y no cause re-renderizados
  // innecesarios en el useEffect que la usa.
  const cargarFamilias = useCallback(
    async (grupoId) => {
      // Solo cargar si hay un grupoId seleccionado
      if (grupoId) {
        setIsLoadingFamilias(true);
        setFamilyOptions([]); // Limpiar opciones anteriores inmediatamente al empezar a cargar

        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familia/${grupoId}`
          );
          if (response.status === 200) {
            const options = response.data.map((fam) => ({
              value: String(fam.codigo_fam), // Asegurar que sea string
              label: fam.name_fam,
            }));
            setFamilyOptions(options);
          } else {
            console.warn(
              "Error al cargar familias para grupo",
              grupoId,
              ":",
              response.status
            );
            setFamilyOptions([]);
          }
        } catch (error) {
          console.error("Error al cargar familias:", error);
          setFamilyOptions([]);
        } finally {
          setIsLoadingFamilias(false);
        }
      } else {
        // Si no hay grupo seleccionado (ej. al inicio o si se deselecciona el grupo),
        // limpiar las opciones y el valor de familia.
        setFamilyOptions([]);
        setValue("codigo_fam", "");
        clearErrors("codigo_fam");
      }
    },
    [setValue, clearErrors] // Dependencias de useCallback: funciones de useForm que podrían cambiar (aunque setValue/clearErrors son estables)
  );

  // UseEffect para reaccionar cuando el idGruWatched cambia (incluyendo el cambio inicial por 'reset')
  // Este hook se encarga de llamar a cargarFamilias.
  useEffect(() => {
    cargarFamilias(idGruWatched);
  }, [idGruWatched, cargarFamilias]); // Dependencia: el valor observado del grupo y la función cargarFamilias (estable por useCallback)

  useEffect(() => {
    const cargarFamilias = async (grupoId) => {
      if (grupoId) {
        setIsLoadingFamilias(true);
        setFamilyOptions([]);

        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familia/${grupoId}`
          );
          if (response.status === 200) {
            const options = response.data.map((fam) => ({
              value: String(fam.codigo_fam), // Asegurar que sea string
              label: fam.name_fam,
            }));
            setFamilyOptions(options);

            // Forzar la actualización del valor del select si ya hay un valor inicial
            const currentCodigoFam = watch("codigo_fam");
            if (currentCodigoFam) {
              const existsInOptions = options.some(
                (option) => option.value === currentCodigoFam
              );
              if (existsInOptions) {
                setValue("codigo_fam", currentCodigoFam);
              }
            }
          } else {
            setFamilyOptions([]);
          }
        } catch (error) {
          console.error("Error al cargar familias:", error);
          setFamilyOptions([]);
        } finally {
          setIsLoadingFamilias(false);
        }
      } else {
        setFamilyOptions([]);
        setValue("codigo_fam", ""); // Limpiar el valor si no hay grupo seleccionado
        clearErrors("codigo_fam");
      }
    };

    cargarFamilias(idGruWatched);
  }, [idGruWatched, setValue, watch, clearErrors]);

  // Función que se ejecuta al enviar el formulario si la validación es exitosa
  const onSubmit = handleSubmit(async (data) => {
    Swal.close(); // Cerrar cualquier SweetAlert previo que pudiera estar abierto

    try {
      // Preparar los datos para enviar a la API
      const dataToSend = {
        ...data,
        // Convertir campos opcionales vacíos (string vacíos o NaN de valueAsNumber) a null si la API lo espera
        chip_ani: data.chip_ani || null,
        arete_ani: data.arete_ani || null,
        peso_ani: data.peso_ani || null,
        precio_ani: data.precio_ani || null,
        // Asegurarse de que status_ani sea un número si la API lo requiere (viene como string del select)
        status_ani: parseInt(data.status_ani, 10),

        // Campos condicionales: solo enviar si el sexo es 'Hembra' y el campo tiene valor
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

      // Realizar la petición PUT a la API
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal/${params.id}`,
        dataToSend
      );

      // Manejar la respuesta de la API
      if (res.status >= 200 && res.status < 300) {
        // Éxito (códigos 2xx)
        Swal.fire({
          title: "Actualización Exitosa",
          text: "El animal ha sido actualizado exitosamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          showConfirmButton: true, // Asegurar que el botón OK se muestre
        }).then(() => {
          router.push(`/auth/dashboard/animal`); // Redirigir al listado
          router.refresh(); // Opcional: recargar datos en la página de destino si es necesario (Next.js 13+)
        });
      } else {
        // Manejar otros códigos de estado que no sean 2xx
        console.error("Actualización no exitosa:", res.status, res.data);
        Swal.fire({
          title: "Error en la respuesta del servidor",
          text: `El servidor respondió con estado ${res.status}. Intente de nuevo.`,
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error(
        "Error en onSubmit (actualización):",
        error.response?.data || error.message || error
      );
      // Mostrar un error más amigable al usuario
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Ocurrió un error al intentar actualizar el animal.";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  });

  // --- Renderizado de Estados de Carga y Error Iniciales ---

  // Mostrar un mensaje de error si la carga inicial falló
  if (loadingError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center text-red-600 max-w-md w-full">
          <p className="text-lg font-semibold mb-4">Error al cargar datos:</p>
          <p className="text-gray-700 mb-4">{loadingError}</p>
          <button
            onClick={() => window.location.reload()} // Permite al usuario intentar recargar la página
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Mostrar un spinner mientras se cargan los datos iniciales (animal y grupos)
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

  // --- Renderizado del Formulario (Una vez que los datos iniciales están cargados) ---
  return (
    <div className="flex items-center justify-center  bg-gray-100">
      {/* Contenedor principal del formulario */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Campo CODIGO ANIMAL (Read Only) */}
            <div>
              <label
                htmlFor="codigo_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Código Animal
              </label>
              <div className="relative">
                {/* Icono */}
                <LuHash
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Input (Read Only, no necesita required/validation rules si no se edita) */}
                <input
                  id="codigo_ani"
                  type="text"
                  readOnly
                  disabled={isSubmitting} // Deshabilitar si se está enviando el formulario
                  className={inputClass("codigo_ani", errors)} // Usar la clase helper
                  {...register("codigo_ani")} // Registrar el campo
                />
                {/* No esperamos errores para un campo readOnly, pero la lógica de errorClass podría mantenerse */}
              </div>
            </div>

            {/* Campo NOMBRE ANIMAL */}
            <div>
              <label
                htmlFor="nombre_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre 
              </label>
              <div className="relative">
                {/* Icono */}
                <LuBrush
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Input */}
                <input
                  id="nombre_ani"
                  type="text"
                  placeholder="Nombre Animal"
                  className={inputClass("nombre_ani", errors)}
                  disabled={isSubmitting}
                  {...register("nombre_ani", {
                    // Registrar y añadir reglas de validación
                    required: "El nombre del animal es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener mínimo 2 caracteres",
                    },
                  })}
                />
                {/* Mostrar mensaje de error si existe */}
                {errors.nombre_ani && (
                  <p role="alert" className={errorClass}>
                    {" "}
                    {/* role="alert" para accesibilidad */}
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
                Sexo 
              </label>
              <div className="relative">
                {/* Icono */}
                <LuVenetianMask
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Select */}
                <select
                  id="sexo_ani"
                  className={selectClass("sexo_ani", errors, sexoAniWatched)}
                  disabled={isSubmitting}
                  {...register("sexo_ani", {
                    // Registrar y añadir regla de validación
                    required: "Debe seleccionar el sexo",
                  })}
                >
                  <option value="">-- Seleccione Sexo --</option>
                  <option value="Hembra">Hembra</option>
                  <option value="Macho">Macho</option>
                </select>
                {/* Flecha decorativa para el select */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none">
                  <LuArrowRight size={20} />
                </div>
                {/* Mostrar mensaje de error si existe */}
                {errors.sexo_ani && (
                  <p role="alert" className={errorClass}>
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
                {/* Icono */}
                <LuScanLine
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Input */}
                <input
                  id="chip_ani"
                  type="text"
                  placeholder="Chip (Opcional)"
                  className={inputClass("chip_ani", errors)}
                  disabled={isSubmitting}
                  {...register("chip_ani")} // Registrar (sin required)
                />
                {/* Mensaje de error (solo si hay validaciones custom, no hay aquí) */}
              </div>
            </div>

            {/* Campo GRUPO ANIMAL */}
            <div>
              <label
                htmlFor="id_gru"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Grupo Animal 
              </label>
              <div className="relative">
                {/* Icono */}
                <LuUsers
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Select */}
                <select
                  id="id_gru"
                  className={selectClass("id_gru", errors, idGruWatched)}
                  // Deshabilitar si se está enviando o si los grupos no se cargaron (aunque el spinner inicial ya cubre esto)
                  disabled={isSubmitting || !grupos.length}
                  {...register("id_gru", {
                    // Registrar y añadir regla de validación
                    required: "Debe seleccionar un grupo",
                    // La carga de familias se activa automáticamente por el useEffect cuando este valor cambia
                  })}
                >
                  <option value="">-- Seleccione Grupo --</option>
                  {grupos.map((grupo) => (
                    <option key={grupo.id_gru} value={grupo.id_gru}>
                      {grupo.name_gru}
                    </option>
                  ))}
                </select>
                {/* Spinner opcional mientras se cargan los grupos inicialmente */}
                {/* No es estrictamente necesario si isLoadingInitialData bloquea todo, pero puede ser útil */}
                {/* {isLoadingInitialData && !grupos.length && (
                   <LuLoader2 className="absolute right-10 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin z-10" size={20} />
                 )} */}
                {/* Flecha decorativa */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none">
                  <LuArrowRight size={20} />
                </div>
                {/* Mostrar mensaje de error si existe */}
                {errors.id_gru && (
                  <p role="alert" className={errorClass}>
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
                Familia Animal 
              </label>
              <div className="relative">
                {/* Icono */}
                <LuGitBranch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Select */}
                <select
                  id="codigo_fam"
                  className={selectClass(
                    "codigo_fam",
                    errors,
                    watch("codigo_fam")
                  )}
                  disabled={
                    isSubmitting ||
                    !idGruWatched || // Deshabilitar si no hay grupo seleccionado
                    isLoadingFamilias || // Deshabilitar mientras se cargan las familias para el grupo actual
                    (idGruWatched &&
                      familyOptions.length === 0 &&
                      !isLoadingFamilias) // Deshabilitar si el grupo está seleccionado pero no hay familias cargadas (y no están cargando)
                  }
                  {...register("codigo_fam", {
                    // Registrar y añadir regla de validación
                    required: "Debe seleccionar una familia",
                  })}
                >
                  <option value="">-- Seleccione Familia --</option>
                  {/* Renderizar opciones SOLO si hay un grupo seleccionado */}
                  {/* familyOptions contendrá las opciones cargadas por el useEffect dependiente */}
                  {familyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {/* Spinner de carga para familias, visible cuando se cargan */}
                {isLoadingFamilias && (
                  <LuLoader2
                    className="absolute right-10 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin z-10"
                    size={20}
                  />
                )}
                {/* Flecha decorativa */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none">
                  <LuArrowRight size={20} />
                </div>
                {/* Mostrar mensaje de error si existe */}
                {errors.codigo_fam && (
                  <p role="alert" className={errorClass}>
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
                {/* Icono */}
                <LuTag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Input */}
                <input
                  id="arete_ani"
                  type="text"
                  placeholder="Arete (Opcional)"
                  className={inputClass("arete_ani", errors)}
                  disabled={isSubmitting}
                  {...register("arete_ani")} // Registrar (sin required)
                />
                {/* Mensaje de error (si aplica) */}
              </div>
            </div>

            {/* Campo PESO ANIMAL (Opcional, Numérico) */}
            <div>
              <label
                htmlFor="peso_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Peso (Kg) (Opcional)
              </label>
              <div className="relative">
                {/* Icono */}
                <LuScale
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Input */}
                <input
                  id="peso_ani"
                  type="number"
                  step="0.01" // Permite decimales
                  placeholder="Peso (Kg) (Opcional)"
                  className={inputClass("peso_ani", errors)}
                  disabled={isSubmitting}
                  {...register("peso_ani", {
                    valueAsNumber: true, // Convierte el input a número o NaN
                    // Puedes añadir min/max si quieres
                  })}
                />
                {/* Mostrar mensaje de error si existe */}
                {errors.peso_ani && (
                  <p role="alert" className={errorClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.peso_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo FECHA PALPACION (condicional - solo para Hembras) */}
            {/* Aplicar clases condicionales al div contenedor para deshabilitar/opacar */}
            <div
              className={clsx({
                "opacity-50 pointer-events-none": sexoAniWatched !== "Hembra",
              })}
            >
              <label
                htmlFor="fechaPalpacion_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha Palpación
                {sexoAniWatched === "Hembra" }
                {/* Requerido solo si es hembra */}
              </label>
              <div className="relative mt-1">
                {/* Icono */}
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                {/* Input */}
                <input
                  id="fechaPalpacion_ani"
                  type="date"
                  className={inputClass("fechaPalpacion_ani", errors)}
                  disabled={isSubmitting || sexoAniWatched !== "Hembra"} // Deshabilitar si se envía o no es hembra
                  {...register("fechaPalpacion_ani", {
                    required:
                      sexoAniWatched === "Hembra" // Requerido solo si es hembra
                        ? "La fecha de palpación es requerida para hembras"
                        : false,
                    validate: (value) => {
                      // Validar fecha futura solo si el campo está visible y tiene valor
                      if (sexoAniWatched === "Hembra" && value) {
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Ignorar la hora del día actual
                        selectedDate.setHours(0, 0, 0, 0); // Ignorar la hora de la fecha seleccionada
                        if (isNaN(selectedDate.getTime()))
                          return "Formato de fecha inválido";
                        return (
                          selectedDate <= today ||
                          "La fecha de palpación no puede ser futura"
                        );
                      }
                      return true; // No validar si no es hembra o si no hay valor (ya cubierto por required)
                    },
                  })}
                />
              </div>
              {/* Mostrar mensaje de error si existe Y es hembra */}
              {errors.fechaPalpacion_ani && sexoAniWatched === "Hembra" && (
                <p role="alert" className={errorClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.fechaPalpacion_ani.message}
                </p>
              )}
            </div>

            {/* Campo TIEMPO DE GESTACION (condicional - solo para Hembras) */}
            {/* Aplicar clases condicionales al div contenedor para deshabilitar/opacar */}
            <div
              className={clsx({
                "opacity-50 pointer-events-none": sexoAniWatched !== "Hembra",
              })}
            >
              <label
                htmlFor="tiempoGestacion_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tiempo de Gestación{" "}
                {sexoAniWatched === "Hembra"}
                {/* Requerido solo si es hembra */}
              </label>
              <div className="relative mt-1">
                {/* Icono */}
                <LuHourglass
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                {/* Input */}
                <input
                  id="tiempoGestacion_ani"
                  type="text" // Usamos text para permitir "días", "meses", etc.
                  placeholder="Gestación (ej: 60 días)"
                  className={inputClass("tiempoGestacion_ani", errors)}
                  disabled={isSubmitting || sexoAniWatched !== "Hembra"} // Deshabilitar si se envía o no es hembra
                  {...register("tiempoGestacion_ani", {
                    required:
                      sexoAniWatched === "Hembra" // Requerido solo si es hembra
                        ? "El tiempo de gestación es requerido para hembras"
                        : false,
                  })}
                />
              </div>
              {/* Mostrar mensaje de error si existe Y es hembra */}
              {errors.tiempoGestacion_ani && sexoAniWatched === "Hembra" && (
                <p role="alert" className={errorClass}>
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
                Fecha de Nacimiento 
              </label>
              <div className="relative mt-1">
                {/* Icono (Puede que tu custom component ya lo tenga, o lo puedes poner aquí) */}
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                {/* Usar Controller para integrar FechaNacimientoInput con React Hook Form */}
                <Controller
                  name="fechaNacimiento_ani" // Nombre del campo en el formulario
                  control={control} // Objeto control de useForm
                  rules={{
                    // Reglas de validación
                    required: "La fecha de nacimiento es requerida",
                    validate: (value) => {
                      if (!value) return true; // Ya cubierto por required
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      selectedDate.setHours(0, 0, 0, 0);
                      if (isNaN(selectedDate.getTime()))
                        return "Formato de fecha inválido";
                      return (
                        selectedDate <= today ||
                        "La fecha de nacimiento no puede ser futura"
                      );
                    },
                  }}
                  render={(
                    { field } // Render function recibe 'field' props (value, onChange, onBlur)
                  ) => (
                    <FechaNacimientoInput
                     // Tu componente custom
                      IconComponent={LuCalendar} // Icono opcional (puedes usar el de tu componente)
                      {...field} // Pasa automáticamente value, onChange, onBlur
                      id="fechaNacimiento_ani" // Necesario para la label
                      
                      disabled={isSubmitting}
                      // Pasar error y errorMessage si tu componente los acepta para mostrar el feedback visual interno
                      error={!!errors.fechaNacimiento_ani}
                      errorMessage={errors.fechaNacimiento_ani?.message}
                    />
                  )}
                />
              </div>
              {/* Mostrar mensaje de error de React Hook Form si existe */}
              {/* Esto asegura que el mensaje de error estándar se muestre consistentemente */}
              {errors.fechaNacimiento_ani && (
                <p role="alert" className={errorClass}>
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
                Fecha Última Vacunación 
              </label>
              <div className="relative mt-1">
                {/* Icono */}
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                {/* Input */}
                <input
                  id="fechaVacunacion_ani"
                  type="date"
                  className={inputClass("fechaVacunacion_ani", errors)}
                  disabled={isSubmitting}
                  {...register("fechaVacunacion_ani", {
                    // Registrar y añadir reglas de validación
                    required: "La fecha de vacunación es requerida",
                    validate: (value) => {
                      if (!value) return true; // Ya cubierto por required
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Ignorar la hora del día actual
                      selectedDate.setHours(0, 0, 0, 0); // Ignorar la hora de la fecha seleccionada
                      if (isNaN(selectedDate.getTime()))
                        return "Formato de fecha inválido";
                      return (
                        selectedDate <= today ||
                        "La fecha de vacunación no puede ser futura"
                      );
                    },
                  })}
                />
              </div>
              {/* Mostrar mensaje de error si existe */}
              {errors.fechaVacunacion_ani && (
                <p role="alert" className={errorClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.fechaVacunacion_ani.message}
                </p>
              )}
            </div>

            {/* Campo STATUS ANIMAL */}
            <div>
              <label
                htmlFor="status_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status 
              </label>
              <div className="relative mt-1">
                {/* Icono */}
                <LuActivity
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Select */}
                <select
                  id="status_ani"
                  className={selectClass(
                    "status_ani",
                    errors,
                    watch("status_ani") // Usar watch para el estilo de texto gris/negro
                  )}
                  disabled={isSubmitting}
                  {...register("status_ani", {
                    // Registrar y añadir regla de validación
                    required: "El status es requerido",
                  })}
                >
                  {/* Opciones con valor como string para el select */}
                  <option value="1">Activo</option>
                  <option value="2">Inactivo</option>
                </select>
                {/* Flecha decorativa */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none">
                  <LuArrowRight size={20} />
                </div>
                {/* Mostrar mensaje de error si existe */}
                {errors.status_ani && (
                  <p role="alert" className={errorClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.status_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo PRECIO ANIMAL (Opcional, Numérico) */}
            <div>
              <label
                htmlFor="precio_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Precio (Opcional)
              </label>
              <div className="relative mt-1">
                {/* Icono */}
                <LuDollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                {/* Input */}
                <input
                  id="precio_ani"
                  type="number"
                  step="0.01" // Permite decimales
                  placeholder="Precio (Opcional)"
                  className={inputClass("precio_ani", errors)}
                  disabled={isSubmitting}
                  {...register("precio_ani", {
                    valueAsNumber: true, // Convierte el input a número o NaN
                    // Puedes añadir min/max si quieres
                  })}
                />
                {/* Mostrar mensaje de error si existe */}
                {errors.precio_ani && (
                  <p role="alert" className={errorClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.precio_ani.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botón de Envío: Ocupa las 2 columnas en md+ */}
          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting} // Deshabilitar mientras se envía
            >
              {isSubmitting ? (
                // Mostrar spinner y texto mientras se envía
                <>
                  <LuLoader2 className="animate-spin mr-2" size={20} />
                  Actualizando...
                </>
              ) : (
                // Texto e icono normal cuando no se está enviando
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
