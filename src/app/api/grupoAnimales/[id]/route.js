import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
  try {
    console.log("params", params);
    if (!params.id) {
      return NextResponse.json(
        {
          message: "ID de familia no proporcionado",
        },
        {
          status: 400,
        }
      );
    }

    const result = await conn.query(`
          SELECT * FROM grupo where id_gru = "${params.id}"`);

    if (result.lenght === 0 || result == []) {
      return NextResponse(
        {
          message: "Familia no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message || "Error al obtener el grupo de animales",
      },
      {
        status: 500,
      }
    );
  }
};
