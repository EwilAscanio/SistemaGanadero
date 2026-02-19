import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  try {
    const result = await conn.query(
      `SELECT * FROM animal WHERE codigo_ani = ?`,
      [params.id]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Animal no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
};

export const DELETE = async (req, { params }) => {
  try {
    const result = await conn.query(
      `DELETE FROM animal WHERE codigo_ani = ?`,
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Animal no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Animal eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
};

export const PUT = async (req, { params }) => {
  try {
    let {
      codigo_ani,
      nombre_ani,
      chip_ani,
      id_gru,
      codigo_fam,
      sexo_ani,
      fechaPalpacion_ani,
      tiempoGestacion_ani,
      peso_ani,
      arete_ani,
      fechaNacimiento_ani,
      fechaVacunacion_ani,
      status_ani,
      precio_ani,
    } = await req.json();


    // --- LÓGICA DE NORMALIZACIÓN ---
    
    // 1. Si el chip viene vacío, nulo o solo con espacios, lo dejamos como null (o "" si prefieres)
    if (!chip_ani || chip_ani.trim() === "") {
      chip_ani = 0; // O utiliza "" dependiendo de si tu DB acepta NULL
    }

    // 2. Si el peso es 0, menor a 0 o no es un número, le asignamos 1
    if (!peso_ani || parseFloat(peso_ani) <= 0) {
      peso_ani = 1;
    }
    // -------------------------------


    // Actualizar el animal en la base de datos
    const result = await conn.query(
      `
        UPDATE animal
        SET 
          codigo_ani = ?, 
          nombre_ani = ?, 
          chip_ani = ?, 
          id_gru = ?, 
          codigo_fam = ?, 
          sexo_ani = ?, 
          fechaPalpacion_ani = ?, 
          tiempoGestacion_ani = ?, 
          peso_ani = ?, 
          arete_ani = ?, 
          fechaNacimiento_ani = ?, 
          fechaVacunacion_ani = ?, 
          status_ani = ?, 
          precio_ani = ?
        WHERE codigo_ani = ?
      `,
      [
        codigo_ani,
        nombre_ani,
        chip_ani,
        id_gru,
        codigo_fam,
        sexo_ani,
        fechaPalpacion_ani,
        tiempoGestacion_ani,
        peso_ani,
        arete_ani,
        fechaNacimiento_ani,
        fechaVacunacion_ani,
        status_ani,
        precio_ani,
        params.id,
      ]
    );

    // Verificar si se actualizó algún registro
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No se encontró el animal para actualizar." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Animal actualizado exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
};
