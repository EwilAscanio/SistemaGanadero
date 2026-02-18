import { conn } from "@/libs/mariadb";
import { NextResponse } from "next/server";

/**
 * GET /api/reportes/familiaanimal?familia=Todos|<name_fam>
 * Devuelve las familias con los animales que pertenecen a cada una.
 */
export const GET = async (request) => {
  const { searchParams } = new URL(request.url);
  const familia = searchParams.get("familia") || "Todos";

  try {
    // Consulta principal: animales con su familia y grupo
    let query = `
      SELECT
        f.codigo_fam,
        f.name_fam AS nombre_fam,
        g.name_gru  AS grupo,
        a.codigo_ani,
        a.nombre_ani,
        a.arete_ani,
        a.sexo_ani,
        a.fechaNacimiento_ani,
        a.peso_ani,
        a.precio_ani,
        a.status_ani
      FROM familia f
      LEFT JOIN grupo g ON f.id_gru = g.id_gru
      LEFT JOIN animal a ON a.codigo_fam = f.codigo_fam AND a.existencia = 1
    `;

    const params = [];
    if (familia !== "Todos") {
      query += " WHERE f.name_fam = ?";
      params.push(familia);
    }

    query += " ORDER BY f.name_fam ASC, a.nombre_ani ASC";

    const rows = await conn.query(query, params);

    // Agrupar por familia
    const familiaMap = {};
    for (const row of rows) {
      const key = row.codigo_fam;
      if (!familiaMap[key]) {
        familiaMap[key] = {
          codigo_fam: row.codigo_fam,
          nombre_fam: row.nombre_fam,
          grupo: row.grupo,
          animales: [],
        };
      }
      // Solo agregar si el animal existe (LEFT JOIN puede traer null)
      if (row.codigo_ani) {
        familiaMap[key].animales.push({
          codigo_ani:         row.codigo_ani,
          nombre_ani:         row.nombre_ani,
          arete_ani:          row.arete_ani,
          sexo_ani:           row.sexo_ani,
          fechaNacimiento_ani: row.fechaNacimiento_ani,
          peso_ani:           row.peso_ani,
          precio_ani:         row.precio_ani,
          status_ani:         row.status_ani,
        });
      }
    }

    const familias = Object.values(familiaMap);

    // Conteo por familia (siempre devuelve todas para el selector)
    const conteo = await conn.query(`
      SELECT
        f.codigo_fam,
        f.name_fam AS nombre_fam,
        COUNT(a.codigo_ani) AS total
      FROM familia f
      LEFT JOIN animal a ON a.codigo_fam = f.codigo_fam AND a.existencia = 1
      GROUP BY f.codigo_fam, f.name_fam
      ORDER BY f.name_fam ASC
    `);

    const totalAnimales = familias.reduce((sum, f) => sum + f.animales.length, 0);

    return NextResponse.json(
      { familias, conteo, totalAnimales },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en GET /api/reportes/familiaanimal:", error);
    return NextResponse.json(
      { message: error.message || "Error al obtener el reporte de familias" },
      { status: 500 }
    );
  }
};
