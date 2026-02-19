"use client";
import axios from "axios";
import Swal from "sweetalert2";
import { FaBarcode } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import FacturaPDF from "@/components/reportes/FacturaPDF";

const Factura = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();

  // Utilizo el hook useState para almacenar el numero de factura
  const [numeroFac, setNumeroFac] = useState("");

  //Utilizo el UseEffect para obtener el numero de factura
  useEffect(() => {
    const obtenerNumeroFactura = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/configuracion`
        );

        const config = res.data[0];

        if (res.status === 200) {
          setNumeroFac(parseInt(config.numero_fac, 10)); // Asumimos que el valor es un número
        }
      } catch (error) {
        console.error("Error al obtener el número de factura:", error);
      }
    };

    obtenerNumeroFactura();
  }, []);

//Estados de carga de cliente cargado, animales, total y cliente
  const [clienteCargado, setClienteCargado] = useState(false);
  const [animales, setAnimales] = useState([]);
  const [animal, setAnimal] = useState("");
  const [total, setTotal] = useState(0);
  const [cliente, setCliente] = useState("");
  const [clienteData, setClienteData] = useState({});
  const [imprimiendo, setImprimiendo] = useState(false);

//Funcion para buscar cliente
  const buscarCliente = async (codigo) => {
    if (!codigo) {
      setClienteCargado(false);
      setClienteData({});
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/cliente/${codigo}`
      );
      if (res.status === 200) {
        setClienteCargado(true);
        setClienteData(res.data);
        setCliente(res.data.nombre_cli);

        Swal.fire({
          title: "Éxito",
          text: "Cliente encontrado.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Cliente no encontrado.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setClienteCargado(false);
      setClienteData({});
    }
  };

  const buscarAnimal = async (codigo) => {
    if (!codigo) return;

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/animal/${codigo}`
      );

      console.log("Verificando la Respuesta del server",res.data); // Verificar la respuesta del servidor

      if (res.status === 200) {
        if (res.data.status_ani === "2") {
          Swal.fire({
            title: "Advertencia",
            text: "Este animal esta inactivo y no puede ser agregado a la factura.",
            icon: "warning",
            confirmButtonColor: "#d33",
          });
          //input.codigo_ani = "";
          return;
        }

        const animalExistente = animales.find(
          (animal) => animal.codigo_ani === res.data.codigo_ani
        );
        setAnimal(res.data.nombre_ani);

        if (animalExistente) {
          Swal.fire({
            title: "Advertencia",
            text: "Este animal ya ha sido agregado.",
            icon: "warning",
            confirmButtonColor: "#3085d6",
          });
          return;
        }

        // Creando variable para aegurar que el precio sea un número.
        const precio = parseFloat(res.data.precio_ani) || 0;

        setAnimales((prev) => [...prev, { ...res.data, precio }]);
        setTotal((prev) => prev + precio); // Sumar el precio del nuevo animal
        Swal.fire({
          title: "Éxito",
          text: "Animal agregado.",
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
    }
  };

  //Funcion para enviar formulario
  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/factura`,
        { ...data, numeroFac: numeroFac, animales, total }
      );

      if (res.status === 200) {
        // Actualizar solo el número de factura

        await axios.put(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/configuracion`,
          {
            numero_fac: numeroFac + 1, // Incrementar el número de factura
          }
        );

        // Obtener el nuevo número de factura
        const updatedConfig = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/configuracion`
        );
        setNumeroFac(parseInt(updatedConfig.data[0].numero_fac, 10));

        // Actualizar el estado de los animales a "inactivo"
        await Promise.all(
          animales.map(async (animal) => {
            await axios.put(
              `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/statusAnimal/${animal.codigo_ani}`,
              { status_ani: 2 }
            );
          })
        );

        Swal.fire({
          title: "Éxito",
          text: "Factura registrada correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        router.push("/auth/dashboard");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al registrar la factura.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  });

// Función para imprimir la factura en PDF
  const imprimirFactura = async () => {
    if (!clienteCargado) {
      Swal.fire({
        title: "Advertencia",
        text: "Debe buscar un cliente antes de imprimir la factura.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (animales.length === 0) {
      Swal.fire({
        title: "Advertencia",
        text: "Debe agregar al menos un animal a la factura.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setImprimiendo(true);

    try {
      const observaciones = getValues("observaciones_fac") || "";
      
      // Crear el documento PDF
      const doc = (
        <FacturaPDF
          numeroFactura={numeroFac}
          cliente={{
            codigo_cli: clienteData.codigo_cli || getValues("codigo_cli"),
            nombre: clienteData.nombre_cli || cliente,
            rif_cli: clienteData.rif_cli || "",
            telefono_cli: clienteData.telefono_cli || "",
          }}
          animales={animales}
          total={total}
          observaciones={observaciones}
        />
      );

      // Generar el blob del PDF
      const blob = await pdf(doc).toBlob();

      // Descargar el archivo
      saveAs(blob, `Factura_${numeroFac}.pdf`);

      Swal.fire({
        title: "Éxito",
        text: "Factura generada correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al generar la factura.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setImprimiendo(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 h-full">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full h-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Crear Factura</h1>
          <p className="text-gray-600 mt-2">
            Debe haber un cliente cargado para habilitar los campos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex items-center relative gap-4">
            <FaBarcode
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="number"
              placeholder="Número de Factura"
              value={numeroFac}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("numero_fac", {
                required: {
                  value: true,
                  message: "Campo requerido",
                },
              })}
              readOnly
            />
          </div>
          <div className="flex items-center relative gap-4">
            <FaBarcode
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Código del cliente"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("codigo_cli", {
                required: {
                  value: true,
                  message: "Campo requerido",
                },
              })}
            />

            <input
              type="text"
              placeholder="Nombre del cliente"
              defaultValue={cliente}
              //onChange={(e) => setCliente(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => buscarCliente(getValues("codigo_cli"))}
              className="ml-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 w-full"
            >
              Buscar Cliente
            </button>
            {errors.codigo_cli && (
              <span className="text-red-600 text-sm">
                {errors.codigo_cli.message}
              </span>
            )}
          </div>

          <div className="flex items-center relative gap-4">
            <FaBarcode
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Código del animal"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register("codigo_ani")}
            />
            <input
              type="text"
              placeholder="Nombre del Animal"
              defaultValue={animal}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => buscarAnimal(getValues("codigo_ani"))}
              className="ml-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 w-full"
            >
              Agregar Animal
            </button>
          </div>
          <input
            type="text"
            placeholder="Observaciones"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("observaciones_fac", {
              required: {
                value: true,
                message: "Campo requerido",
              },
            })}
          />
          <div>
            <h2 className="text-lg font-semibold">Animales Agregados:</h2>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-gray-200">Código</th>
                  <th className="py-2 px-4 bg-gray-200">Nombre</th>
                  <th className="py-2 px-4 bg-gray-200">Precio</th>
                  <th className="py-2 px-4 bg-gray-200">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {animales.map((animal, index) => (
                  <tr key={index} className="text-center border-t">
                    <td className="py-2 px-4">{animal.codigo_ani}</td>
                    <td className="py-2 px-4">{animal.nombre_ani}</td>
                    <td className="py-2 px-4">
                      {animal.precio_ani.toFixed(2)}$
                    </td>
                    <td className="py-2 px-4">
                      <button
                        type="button"
                        onClick={() => {
                          setAnimales(
                            animales.filter((a) => a.codigo !== animal.codigo)
                          );
                          setTotal((total - animal.precio_ani).toFixed(2));
                        }}
                        className="bg-red-500 text-white py-1 px-3 rounded"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="font-bold">Total: {total.toFixed(2)}$</h3>
          </div>

<button
            type="button"
            className="w-full bg-green-500 text-white rounded-lg p-2 disabled:bg-green-300 disabled:cursor-not-allowed"
            onClick={imprimirFactura}
            disabled={imprimiendo || !clienteCargado || animales.length === 0}
          >
            {imprimiendo ? "Generando PDF..." : "Imprimir Factura"}
          </button>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg p-2"
            disabled={!clienteCargado} // Deshabilita el botón si no hay cliente cargado
          >
            Registrar Factura
          </button>
        </form>
      </div>
    </div>
  );
};

export default Factura;
