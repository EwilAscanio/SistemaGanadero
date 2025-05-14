"use client";
import { useForm } from "react-hook-form";
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
} from "react-icons/lu";
import { FaExclamationCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import FechaNacimientoInput from "@/components/FechaNacimientoInput";

// Clase común para inputs y selects
const inputClass = (fieldName, errors) => `
  w-full pl-10 pr-3 py-2 border rounded-lg
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  ${errors[fieldName] ? "border-red-500" : "border-gray-300"}
  text-gray-700 text-sm
  disabled:bg-gray-100 disabled:cursor-not-allowed
`;

// Clase común para selects con flecha
const selectClass = (fieldName, errors, watchValue) => `
  ${inputClass(fieldName, errors)}
  pr-10 appearance-none
  ${watchValue ? "text-gray-700" : "text-gray-400"}
`;

const errorClass = "flex items-center mt-1 text-red-600 text-xs";
const RequiredAsterisk = () => <span className="text-red-500 ml-1">*</span>;

const UpdateAnimal = ({ params }) => {
  const router = useRouter();
  const [grupos, setGrupos] = useState([]);
  const [familyOptions, setFamilyOptions] = useState([]);

  // Estados de carga para mejorar UX
  const [isLoadingAnimal, setIsLoadingAnimal] = useState(true);
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(true);
  const [isLoadingFamilias, setIsLoadingFamilias] = useState(false);
  const [loadingError, setLoadingError] = useState(null); // Para errores iniciales de carga

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    clearErrors,
  } = useForm();

  // Watch para campos condicionales y dependientes
  const idGruWatched = watch("id_gru");
  const sexoAniWatched = watch("sexo_ani");

  // UseEffect para cargar los grupos de animales al inicio
  useEffect(() => {
    const cargarGrupo = async () => {
      setIsLoadingGrupos(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/grupoAnimales`
        );
        if (response.status === 200) {
          setGrupos(response.data);
        } else {
          setLoadingError(
            "No se pudieron cargar los grupos. Código: " + response.status
          );
        }
      } catch (error) {
        console.error("Error al cargar grupos:", error);
        setLoadingError(
          "No se pudieron cargar los grupos. Verifique la conexión o la API."
        );
        setGrupos([]);
      } finally {
        setIsLoadingGrupos(false);
      }
    };
    cargarGrupo();
  }, []);

  // UseEffect para cargar las familias de animales basado en el grupo seleccionado (watched)
  useEffect(() => {
    const cargarFamilias = async () => {
      if (idGruWatched) {
        setIsLoadingFamilias(true);
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familia/${idGruWatched}`
          );
          if (response.status === 200) {
            const options = response.data.map((fam) => ({
              value: fam.codigo_fam,
              label: fam.name_fam,
            }));
            setFamilyOptions(options);
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
        setValue("codigo_fam", "");
        clearErrors("codigo_fam");
      }
    };
    cargarFamilias();
  }, [idGruWatched, setValue, clearErrors]);

  // UseEffect para cargar los datos del animal específico y prellenar el formulario
  useEffect(() => {
    setIsLoadingAnimal(true);
    setLoadingError(null);
    axios
      .get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal/${params.id}`)
      .then((res) => {
        if (res.status === 200) {
          const animalData = res.data;

          // Formatear fechas a YYYY-MM-DD para input type="date"
          const formattedData = {
            ...animalData,
            codigo_ani: animalData.codigo_ani || "",
            nombre_ani: animalData.nombre_ani || "",
            chip_ani: animalData.chip_ani || "",
            id_gru: animalData.id_gru || "", // Importante para que se dispare el useEffect de familias
            codigo_fam: animalData.codigo_fam || "",
            sexo_ani: animalData.sexo_ani || "",
            fechaPalpacion_ani: animalData.fechaPalpacion_ani
              ? formatDateToYYYYMMDD(animalData.fechaPalpacion_ani)
              : "",
            tiempoGestacion_ani: animalData.tiempoGestacion_ani || "",
            peso_ani: animalData.peso_ani ?? null,
            arete_ani: animalData.arete_ani || "",
            fechaNacimiento_ani: animalData.fechaNacimiento_ani
              ? formatDateToYYYYMMDD(animalData.fechaNacimiento_ani)
              : "",
            fechaVacunacion_ani: animalData.fechaVacunacion_ani
              ? formatDateToYYYYMMDD(animalData.fechaVacunacion_ani)
              : "",
            status_ani: String(animalData.status_ani),
            precio_ani: animalData.precio_ani ?? null,
          };

          // reset prellena el formulario con los datos
          reset(formattedData);
        } else {
          setLoadingError(
            "No se pudieron obtener los datos del animal. Código: " + res.status
          );
        }
      })
      .catch((error) => {
        console.error("Error al cargar datos del animal:", error);
        setLoadingError(
          "No se pudieron cargar los datos del animal. Verifique el ID o la API."
        );
      })
      .finally(() => {
        setIsLoadingAnimal(false);
      });
  }, [params.id, reset]);

  // Función para formatear la fecha de la api (YYYY-MM-DD HH:MM:SS) a (YYYY-MM-DD)
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return ""; // Devolver string vacío si no hay fecha
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error("Fecha inválida recibida:", dateString);
        return ""; // Devolver vacío si la fecha no es válida
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Error formateando fecha:", dateString, e);
      return ""; // Devolver vacío en caso de error
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    Swal.close(); // Cerrar SweetAlerts anteriores

    try {
      const dataToSend = {
        ...data,
        peso_ani: data.peso_ani || null,
        precio_ani: data.precio_ani || null,
        status_ani: parseInt(data.status_ani, 10),
        chip_ani: data.chip_ani || null,
        arete_ani: data.arete_ani || null,
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
      if (res.status === 200) {
        Swal.fire({
          title: "Actualización Exitosa",
          text: "El animal ha sido actualizado exitosamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          showConfirmButton: true,
        }).then(() => {
          router.push(`/auth/dashboard/animal`);
          router.refresh();
        });
      } else {
        Swal.fire({
          title: "Actualización Exitosa (Estado: " + res.status + ")",
          text: "El animal ha sido actualizado, pero la respuesta del servidor no fue Exitosa.",
          icon: "error",
          confirmButtonColor: "#3085d6",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error(
        "Error en onSubmit (actualización):",
        error.response?.data || error.message || error
      );
    }
  });

  // --- Renderizado ---

  if (loadingError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center text-red-600">
          <p className="text-lg font-semibold mb-4">Error al cargar datos:</p>
          <p>{loadingError}</p>
          <button
            onClick={() => window.location.reload()} // Opción simple para recargar
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingAnimal || isLoadingGrupos) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">
            Cargando datos del animal y opciones...
          </p>
        </div>
      </div>
    );
  }

  // Una vez que los datos básicos están cargados, renderizar el formulario
  return (
    <>
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Actualizar Animal
            </h1>
            <p className="text-gray-600 text-sm">
              Modifique los datos necesarios
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Campo CODIGO ANIMAL */}
              <div>
                <label
                  htmlFor="codigo_ani"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Código Animal <RequiredAsterisk />
                </label>
                <div className="relative mt-1">
                  <LuHash
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="codigo_ani"
                    type="text"
                    readOnly
                    disabled={isSubmitting}
                    className={inputClass("codigo_ani", errors)}
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
                <div className="relative mt-1">
                  <LuBrush
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="nombre_ani"
                    type="text"
                    placeholder="Nombre Animal *"
                    className={inputClass("nombre_ani", errors)}
                    disabled={isSubmitting}
                    {...register("nombre_ani", {
                      required: "El nombre del animal es requerido",
                      minLength: {
                        value: 2,
                        message: "El nombre debe tener mínimo 2 caracteres",
                      },
                    })}
                  />
                  {errors.nombre_ani && (
                    <p className={errorClass}>
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
                <div className="relative mt-1">
                  <LuVenetianMask
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <select
                    id="sexo_ani"
                    className={selectClass("sexo_ani", errors, sexoAniWatched)}
                    disabled={isSubmitting}
                    {...register("sexo_ani", {
                      required: "Debe seleccionar el sexo",
                    })}
                  >
                    <option value="">-- Seleccione Sexo --</option>
                    <option value="Hembra">Hembra</option>
                    <option value="Macho">Macho</option>
                  </select>
                  <LuArrowRight
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none z-10"
                    size={20}
                  />
                  {errors.sexo_ani && (
                    <p className={errorClass}>
                      <FaExclamationCircle className="mr-1" />
                      {errors.sexo_ani.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Campo CHIP ANIMAL */}
              <div>
                <label
                  htmlFor="chip_ani"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chip (Opcional)
                </label>
                <div className="relative mt-1">
                  <LuScanLine
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <input
                    id="chip_ani"
                    type="text"
                    placeholder="Chip (Opcional)"
                    className={inputClass("chip_ani", errors)}
                    disabled={isSubmitting}
                    {...register("chip_ani")}
                  />
                  {errors.chip_ani && (
                    <p className={errorClass}>
                      <FaExclamationCircle className="mr-1" />
                      {errors.chip_ani.message}
                    </p>
                  )}
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
                <div className="relative mt-1">
                  <LuUsers
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={20}
                  />
                  <select
                    id="id_gru"
                    className={selectClass("id_gru", errors, idGruWatched)}
                    {...register("id_gru", {
                      required: "Debe seleccionar un grupo",
                      onChange: (e) => {
                        setValue("codigo_fam", "");
                        clearErrors("codigo_fam");
                      },
                    })}
                    disabled={isSubmitting || isLoadingGrupos}
                  >
                    <option value="">-- Seleccione Grupo --</option>
                    {grupos.map((grupo) => (
                      <option key={grupo.id_gru} value={grupo.id_gru}>
                        {grupo.name_gru}
                      </option>
                    ))}
                  </select>
                  <LuArrowRight
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none z-10"
                    size={20}
                  />
                </div>
                {errors.id_gru && (
                  <p className={errorClass}>
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
              <div className="relative mt-1">
                <LuGitBranch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                <select
                  id="codigo_fam"
                  className={selectClass(
                    "codigo_fam",
                    errors,
                    watch("codigo_fam")
                  )}
                  {...register("codigo_fam", {
                    required: "Debe seleccionar una familia",
                  })}
                  disabled={
                    isSubmitting ||
                    !idGruWatched ||
                    familyOptions.length === 0 ||
                    isLoadingFamilias
                  }
                >
                  <option value="">-- Seleccione Familia --</option>
                  {familyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <LuArrowRight
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none z-10"
                  size={20}
                />
                {errors.codigo_fam && (
                  <p className={errorClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.codigo_fam.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo ARETE ANIMAL */}
            <div>
              <label
                htmlFor="arete_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Arete (Opcional)
              </label>
              <div className="relative mt-1">
                <LuTag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                <input
                  id="arete_ani"
                  type="text"
                  placeholder="Arete (Opcional)"
                  className={inputClass("arete_ani", errors)}
                  disabled={isSubmitting}
                  {...register("arete_ani")}
                />
                {errors.arete_ani && (
                  <p className={errorClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.arete_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo PESO ANIMAL */}
            <div>
              <label
                htmlFor="peso_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Peso (Kg) (Opcional)
              </label>
              <div className="relative mt-1">
                <LuScale
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                <input
                  id="peso_ani"
                  type="number"
                  step="0.01"
                  placeholder="Peso (Kg) (Opcional)"
                  className={inputClass("peso_ani", errors)}
                  disabled={isSubmitting}
                  {...register("peso_ani", {
                    valueAsNumber: true,
                  })}
                />
                {errors.peso_ani && (
                  <p className={errorClass}>
                    <FaExclamationCircle className="mr-1" />
                    {errors.peso_ani.message}
                  </p>
                )}
              </div>
            </div>

            {/* Campo FECHA PALPACION (condicional) */}
            <div
              className={`${sexoAniWatched !== "Hembra" ? "opacity-50" : ""}`}
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
                  className={`${inputClass("fechaPalpacion_ani", errors)} ${
                    isSubmitting || sexoAniWatched !== "Hembra"
                      ? "disabled:opacity-50"
                      : ""
                  }`}
                  disabled={isSubmitting || sexoAniWatched !== "Hembra"}
                  {...register("fechaPalpacion_ani", {
                    required:
                      sexoAniWatched === "Hembra"
                        ? "La fecha de palpación es requerida para hembras"
                        : false,
                  })}
                />
              </div>
              {errors.fechaPalpacion_ani && sexoAniWatched === "Hembra" && (
                <p className={errorClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.fechaPalpacion_ani.message}
                </p>
              )}
            </div>

            {/* Campo TIEMPO DE GESTACION (condicional) */}
            <div
              className={`${sexoAniWatched !== "Hembra" ? "opacity-50" : ""}`}
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
                  placeholder="Gestación (días/meses)"
                  className={`${inputClass("tiempoGestacion_ani", errors)} ${
                    isSubmitting || sexoAniWatched !== "Hembra"
                      ? "disabled:opacity-50"
                      : ""
                  }`}
                  disabled={isSubmitting || sexoAniWatched !== "Hembra"}
                  {...register("tiempoGestacion_ani", {
                    required:
                      sexoAniWatched === "Hembra"
                        ? "El tiempo de gestación es requerido para hembras"
                        : false,
                  })}
                />
              </div>
              {errors.tiempoGestacion_ani && sexoAniWatched === "Hembra" && (
                <p className={errorClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.tiempoGestacion_ani.message}
                </p>
              )}
            </div>

            {/* Campo FECHA NACIMIENTO */}
            <div>
              <label
                htmlFor="fechaNacimiento_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de Nacimiento <RequiredAsterisk />
              </label>
              <FechaNacimientoInput
                name="fechaNacimiento_ani"
                className={`${inputClass("fechaNacimiento_ani", errors)} ${
                  isSubmitting ? "disabled:opacity-50" : ""
                }`}
                disabled={isSubmitting}
                error={!!errors.fechaNacimiento_ani}
                errorMessage={errors.fechaNacimiento_ani?.message}
                {...register("fechaNacimiento_ani", {
                  required: "La fecha de nacimiento es requerida",
                  validate: (value) => {
                    if (!value) return true;
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
                })}
              />
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
                  className={`${inputClass("fechaVacunacion_ani", errors)} ${
                    isSubmitting ? "disabled:opacity-50" : ""
                  }`}
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
                        return "Formato de fecha inválido";
                      return (
                        selectedDate <= today ||
                        "La fecha de vacunación no puede ser futura"
                      );
                    },
                  })}
                />
              </div>
              {errors.fechaVacunacion_ani && (
                <p className={errorClass}>
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
                Status <RequiredAsterisk />
              </label>
              <div className="relative mt-1">
                <LuActivity
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                <select
                  id="status_ani"
                  className={selectClass(
                    "status_ani",
                    errors,
                    watch("status_ani")
                  )}
                  disabled={isSubmitting}
                  {...register("status_ani", {
                    required: "El status es requerido",
                  })}
                >
                  <option value="1">Activo</option>
                  <option value="2">Inactivo</option>
                </select>
                <LuArrowRight
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none z-10"
                  size={20}
                />
              </div>
              {errors.status_ani && (
                <p className={errorClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.status_ani.message}
                </p>
              )}
            </div>

            {/* Campo PRECIO ANIMAL */}
            <div>
              <label
                htmlFor="precio_ani"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Precio (Opcional)
              </label>
              <div className="relative mt-1">
                <LuDollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={20}
                />
                <input
                  id="precio_ani"
                  type="number"
                  step="0.01"
                  placeholder="Precio (Opcional)"
                  className={inputClass("precio_ani", errors)}
                  disabled={isSubmitting}
                  {...register("precio_ani", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              {errors.precio_ani && (
                <p className={errorClass}>
                  <FaExclamationCircle className="mr-1" />
                  {errors.precio_ani.message}
                </p>
              )}
            </div>

            {/* Botón de Envío: Ocupa las 2 columnas en md+ */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Actualizando..." : "Actualizar Animal"}
                {!isSubmitting && <LuArrowRight className="ml-2" size={20} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateAnimal;
