import { NextResponse } from "next/server";
import { conn } from "@/libs/mariadb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || new Date().getFullYear();

    // Consulta para obtener la suma de litros de leche por mes del año seleccionado
    const query = `
      SELECT 
        MONTH(fecha_lec) as mes,
        SUM(litros_lec) as total_litros
      FROM produccionleche
      WHERE YEAR(fecha_lec) = ?
      GROUP BY MONTH(fecha_lec)
      ORDER BY mes ASC
    `;

    const result = await conn.query(query, [year]);

    // Nombres de los meses en español
    const nombresMeses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Crear array con todos los meses del año (inicializados en 0)
    const produccionMensual = nombresMeses.map((nombre, index) => {
      const mesNumero = index + 1;
      const datoEncontrado = result.find(row => row.mes === mesNumero);
      return {
        mes: nombre,
        total_litros: datoEncontrado ? parseFloat(datoEncontrado.total_litros) : 0
      };
    });

    return NextResponse.json(produccionMensual);
  } catch (error) {
    console.error("Error al obtener producción mensual:", error);
    return NextResponse.json(
      { message: "Error al obtener la producción mensual de leche" },
      { status: 500 }
    );
  }
}