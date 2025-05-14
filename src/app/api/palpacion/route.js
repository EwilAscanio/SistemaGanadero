import { NextResponse } from "next/server";
import { conn } from "@/libs/mariadb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search');

    console.log("searchTerm:", searchTerm);

    if (!searchTerm) {
      return NextResponse.json([]);
    }

    const safeSearchTerm = searchTerm.substring(0, 50);

    // === CORRECCIÓN: Añade sexo_ani y id a la selección ===
    // El frontend necesita sexo_ani para validar
    const query = `
      SELECT codigo_ani, nombre_ani, sexo_ani
      FROM animal
      WHERE LOWER(codigo_ani) LIKE ?
      LIMIT 10
    `;

    const param = safeSearchTerm.toLowerCase() + '%';

    // === PASO DE DEPURACIÓN: Captura el resultado completo y LOGÉALO ===
    const queryResult = await conn.query(query, [param]);
    console.log("Resultado completo de la consulta:", queryResult);
    // === FIN PASO DE DEPURACIÓN ===

    // Ahora intenta acceder a las filas basándote en lo que veas en el log

    let rows;

    // === MODIFICACIÓN AQUÍ: Cómo obtener las filas depende de 'queryResult' ===
    // Hay varias posibilidades:
    // 1. Si queryResult es [filas, campos] (esperado con mysql2 promise):
    if (Array.isArray(queryResult) && Array.isArray(queryResult[0])) {
         rows = queryResult[0];
         console.log("Resultado parece ser [filas, campos]. Usando queryResult[0].");
    }
    // 2. Si queryResult es solo el array de filas directamente:
    else if (Array.isArray(queryResult)) {
         rows = queryResult;
         console.log("Resultado parece ser solo el array de filas. Usando queryResult.");
    }
    // 3. Si queryResult es un objeto con una propiedad 'results':
    else if (typeof queryResult === 'object' && queryResult !== null && Array.isArray(queryResult.results)) {
         rows = queryResult.results;
         console.log("Resultado parece ser un objeto con 'results'. Usando queryResult.results.");
    }
     // Agrega más checks si queryResult tiene otra estructura inesperada
    else {
        console.error("La Base de datos no retorna un array en un formato esperado:", queryResult);
        return NextResponse.json({ message: "Formato de datos inesperado de la base de datos." }, { status: 500 });
    }


    // Verificar si las filas obtenidas son un array válido (debería serlo si entraste a alguno de los ifs anteriores)
    if (!Array.isArray(rows)) {
       // Esto ya no debería pasar si la lógica anterior cubre los casos
       console.error("Algo salió mal después de obtener el resultado. 'rows' no es un array:", rows);
       return NextResponse.json({ message: "Error procesando datos de la base de datos." }, { status: 500 });
    }


    console.log("Filas obtenidas:", rows); // Loggea las filas antes de enviarlas


    // Devolver los resultados como JSON
    return NextResponse.json(rows);

  } catch (error) {
    console.error("Error en la consulta o búsqueda de animales:", error); // Mensaje de error más específico
    return NextResponse.json({ message: "Ocurrió un error al buscar animales." }, { status: 500 });
  } finally {
      // Asegúrate de no cerrar la conexión si usas un pool.
      // Si no usas pool y creas una conexión por cada request (no recomendado en producción),
      // entonces deberías cerrarla aquí.
      // if (conn && typeof conn.end === 'function') {
      //   await conn.end();
      // }
  }
}



export const POST = async (req) => {
  try {
    let { codigo_ani, fecha_pal, animalembarazado_pal, tiempogestacion_pal } =
      await req.json();

    // Validar que se haya proporcionado el código del animal, litros y fecha
    if (!codigo_ani || !fecha_pal) {
      return NextResponse.json(
        { message: "Los datos son requeridos." },
        { status: 400 }
      );
    }

    //Se cambian los valores que vienen undefined para registrarlos 0 en la base de datos
    if (animalembarazado_pal == null && tiempogestacion_pal == null) {
      animalembarazado_pal = 0;
      tiempogestacion_pal = 0;
    }

    // Insertar el proceso de palpacion
    const result = await conn.query(
      `INSERT INTO palpacion (codigo_ani, fecha_pal, animalembarazado_pal, tiempogestacion_pal) VALUES (?, ?, ?, ?)`,
      [codigo_ani, fecha_pal, animalembarazado_pal, tiempogestacion_pal]
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al registrar:", error.message);
    return NextResponse.json(
      { message: "Ocurrió un error al registrar el proceso de palpacion." },
      { status: 500 }
    );
  }
};
