import { NextResponse } from "next/server";
import { conn } from "@/libs/mariadb";

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
