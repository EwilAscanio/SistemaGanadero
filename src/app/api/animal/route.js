import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const result = await conn.query("SELECT * FROM animal");

    // Consulta para obtener el conteo total de animales
    const [countResult] = await conn.query(
      "SELECT COUNT(*) AS cantidad FROM animal"
    );

    // Verifica que countResult tenga resultados
    if (!countResult || countResult.length === 0) {
      throw new Error("No se pudo obtener el conteo de animales.");
    }

    // Obtiene el valor de cantidad de animales
    const cantidadAnimales = countResult.cantidad;

    return NextResponse.json(
      { infoAnimales: result, total: cantidadAnimales },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message || "Error al obtener los animales",
      },
      {
        status: 500,
      }
    );
  }
};


export const POST = async (req) => {
  try {
    // 1. Obtener los datos del request
    const data = await req.json();
    console.log("Datos recibidos:", data);

    // 2. Validación de campos requeridos básicos (opcional pero recomendado)
    if (
      !data.codigo_ani ||
      !data.nombre_ani ||
      !data.id_gru ||
      !data.codigo_fam ||
      !data.sexo_ani ||
      !data.fechaNacimiento_ani ||
      !data.fechaVacunacion_ani ||
      !data.status_ani
    ) {
      return NextResponse.json(
        { message: "Faltan campos requeridos." },
        { status: 400 }
      );
    }

    // 3. Verificar si el Animal ya está registrado
    const existingAnimal = await conn.query(
      "SELECT codigo_ani FROM animal WHERE codigo_ani = ?",
      [data.codigo_ani]
    );

    if (existingAnimal.length > 0) {
      return NextResponse.json(
        {
          message: "El código del animal ya está registrado.",
        },
        {
          status: 409, 
        }
      );
    }

    // 4. Chequeo de campos y asignación de valores por defecto
    data.arete_ani = data.arete_ani || "Sin Arete"; // Si es "", null o undefined -> "Sin Arete"
    data.chip_ani = data.chip_ani === "" ? 0 : data.chip_ani;
    data.precio_ani = data.precio_ani ?? 0; // Si es null o undefined -> 0
    data.peso_ani = data.peso_ani ?? 0; // Si es null o undefined -> 0
    data.tiempoGestacion_ani =
    data.tiempoGestacion_ani === "" ? 0 : data.tiempoGestacion_ani; // Si es null o undefined -> null (o 0 si prefieres). Asume que puede ser texto o número.
    data.fechaPalpacion_ani =
    data.fechaPalpacion_ani === "" ? "1900-01-01" : data.fechaPalpacion_ani; // Si es "", null o undefined -> null


    // 5. Preparar el objeto final para la inserción
    const dataToInsert = {
      codigo_ani: data.codigo_ani,
      nombre_ani: data.nombre_ani,
      chip_ani: data.chip_ani, // Valor con default aplicado
      id_gru: parseInt(data.id_gru, 10), // Asegurar que sea número si es INT en DB
      codigo_fam: data.codigo_fam, // Asumir que llega bien, podría necesitar parseo si es número
      sexo_ani: data.sexo_ani,
      fechaPalpacion_ani: data.fechaPalpacion_ani, // Valor con default aplicado (null)
      tiempoGestacion_ani: data.tiempoGestacion_ani, // Valor con default aplicado
      peso_ani: data.peso_ani, // Valor con default aplicado
      arete_ani: data.arete_ani, // Valor con default aplicado
      fechaNacimiento_ani: data.fechaNacimiento_ani, // Requerido, sin default aquí
      fechaVacunacion_ani: data.fechaVacunacion_ani, // Requerido, sin default aquí
      status_ani: parseInt(data.status_ani, 10), // Asegurar que sea número
      precio_ani: data.precio_ani, // Valor con default aplicado
      existencia: 1, // Valor fijo añadido aquí
    };

    // 6. Realizar la inserción
    const result = await conn.query("INSERT INTO animal SET ?", dataToInsert);

    // 7. Responder con éxito
    
    return NextResponse.json({
      message: "Animal registrado exitosamente.",
      id: result.insertId, // Asegúrate que tu librería/driver devuelva insertId
      ...dataToInsert, // Opcional: devolver los datos insertados
    });
  } catch (error) {
    // 8. Manejo de errores
    console.error("Error en API POST /api/animal:", error); // Loguear el error completo en el servidor

    // Enviar un mensaje genérico al cliente por seguridad
    return NextResponse.json(
      {
        message: "Error interno del servidor al registrar el animal.",
        // error: error.message // Evita enviar detalles del error al cliente en producción
      },
      {
        status: 500,
      }
    );
  }
};
