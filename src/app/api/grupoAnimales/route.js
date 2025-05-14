import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const result = await conn.query("SELECT * FROM grupo");

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
