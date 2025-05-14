import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export const GET = async () => {
  try {
    const result = await conn.query("SELECT * FROM users");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error.message); // Agregar log para el error
    return NextResponse.json(
      {
        message: error.message, // Cambiar 'result.error' por 'error.message'
      },
      {
        status: 500,
      }
    );
  }
};

export const POST = async (req) => {
  try {
    const data = await req.json();

    let { name_usr, login_usr, email_usr, password_usr, id_rol } = data;

    // Verificar si el usuario ya está registrado
    const existingUser = await conn.query(
      "SELECT * FROM users WHERE email_usr = ? OR login_usr = ?",
      [email_usr, login_usr]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          message: "El usuario ya está registrado.",
        },
        {
          status: 400,
        }
      );
    }

    password_usr = await bcrypt.hash(password_usr, 5);

    const result = await conn.query("INSERT INTO users SET ?", {
      name_usr,
      login_usr,
      email_usr,
      password_usr,
      id_rol,
    });

    return NextResponse.json(result);
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
