import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

/**
 * GET /api/reportes/animales?categoria=Todos|Bufalinos|Bobinos|Equinos
 * Devuelve la lista de animales filtrada por categoría (grupo).
 */
export const GET = async (request) => {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get("categoria") || "Todos";

  try {
    let query = `
      SELECT
        a.codigo_ani,
        a.nombre_ani,
        a.arete_ani,
        a.sexo_ani,
        a.fechaNacimiento_ani,
        a.peso_ani,
        a.precio_ani,
        a.status_ani,
        g.name_gru AS categoria
      FROM animal a
      LEFT JOIN grupo g ON a.id_gru = g.id_gru
      WHERE a.existencia = 1
    `;

    const params = [];

    if (categoria !== "Todos") {
      query += " AND g.name_gru = ?";
      params.push(categoria);
    }

    query += " ORDER BY g.name_gru ASC, a.nombre_ani ASC";

    const animales = await conn.query(query, params);

    // Conteo por categoría
    const conteo = await conn.query(`
      SELECT g.name_gru AS categoria, COUNT(*) AS total
      FROM animal a
      LEFT JOIN grupo g ON a.id_gru = g.id_gru
      WHERE a.existencia = 1
      GROUP BY g.name_gru
      ORDER BY g.name_gru ASC
    `);

    return NextResponse.json(
      { animales, conteo, total: animales.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en GET /api/reportes/animales:", error);
    return NextResponse.json(
      { message: error.message || "Error al obtener el reporte de animales" },
      { status: 500 }
    );
  }
};
