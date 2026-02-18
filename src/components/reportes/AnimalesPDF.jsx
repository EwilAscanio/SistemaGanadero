import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const ITEMS_PER_PAGE = 22;

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 16,
    textAlign: "center",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  address: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  date: {
    fontSize: 9,
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 12,
    color: "#555",
  },
  // Resumen de conteo por categoría
  summaryBox: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  summaryItem: {
    border: "1px solid #ccc",
    borderRadius: 4,
    padding: "4 10",
    textAlign: "center",
    fontSize: 9,
    marginHorizontal: 4,
  },
  summaryLabel: {
    fontWeight: "bold",
    fontSize: 9,
  },
  // Tabla
  table: {
    display: "table",
    width: "auto",
    marginTop: 8,
    border: "1px solid #ccc",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fff",
  },
  tableHeaderRow: {
    backgroundColor: "#2563EB",
    borderBottom: "2px solid #1d4ed8",
  },
  // Anchos de columnas (deben sumar 100%)
  colCodigo:        { width: "10%", padding: 6, fontSize: 8, textAlign: "center" },
  colNombre:        { width: "18%", padding: 6, fontSize: 8, textAlign: "center" },
  colArete:         { width: "12%", padding: 6, fontSize: 8, textAlign: "center" },
  colSexo:          { width: "8%",  padding: 6, fontSize: 8, textAlign: "center" },
  colFechaNac:      { width: "14%", padding: 6, fontSize: 8, textAlign: "center" },
  colPeso:          { width: "9%",  padding: 6, fontSize: 8, textAlign: "center" },
  colPrecio:        { width: "11%", padding: 6, fontSize: 8, textAlign: "center" },
  colStatus:        { width: "8%",  padding: 6, fontSize: 8, textAlign: "center" },
  colCategoria:     { width: "10%", padding: 6, fontSize: 8, textAlign: "center" },

  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 8,
  },
  noData: {
    width: "100%",
    padding: 12,
    textAlign: "center",
    fontSize: 10,
    color: "#555",
  },
  total: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "right",
    paddingRight: 10,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 9,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#999",
  },
});

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const paginate = (data, perPage) => {
  const pages = [];
  for (let i = 0; i < data.length; i += perPage) {
    pages.push(data.slice(i, i + perPage));
  }
  if (pages.length === 0) pages.push([]);
  return pages;
};

const AnimalesPDF = ({ animales = [], conteo = [], categoria = "Todos", total = 0 }) => {
  const nombreEmpresa = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA || "Sistema Ganadero";
  const direccionEmpresa = process.env.NEXT_PUBLIC_DIRECCION_EMPRESA || "";
  const pages = paginate(animales, ITEMS_PER_PAGE);

  return (
    <Document>
      {pages.map((pageData, pageIndex) => (
        <Page size="A4" orientation="landscape" style={styles.page} key={`page-${pageIndex}`}>
          {/* Encabezado solo en la primera página */}
          {pageIndex === 0 && (
            <>
              <View style={styles.header}>
                <Text style={styles.companyName}>{nombreEmpresa}</Text>
                {direccionEmpresa ? (
                  <Text style={styles.address}>{direccionEmpresa}</Text>
                ) : null}
                <Text style={styles.date}>
                  Fecha de generación: {new Date().toLocaleDateString("es-ES")}
                </Text>
              </View>

              <Text style={styles.title}>Reporte de Animales</Text>
              <Text style={styles.subtitle}>
                Categoría: {categoria}  |  Total: {total} animales
              </Text>

              {/* Resumen de conteo */}
              {conteo.length > 0 && (
                <View style={styles.summaryBox}>
                  {conteo.map((item, idx) => (
                    <View key={idx} style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>{item.categoria}</Text>
                      <Text style={{ fontSize: 9 }}>{item.total}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Tabla */}
          <View style={styles.table}>
            {/* Cabecera */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.colCodigo,    styles.headerText]}>Código</Text>
              <Text style={[styles.colNombre,    styles.headerText]}>Nombre</Text>
              <Text style={[styles.colArete,     styles.headerText]}>Arete</Text>
              <Text style={[styles.colSexo,      styles.headerText]}>Sexo</Text>
              <Text style={[styles.colFechaNac,  styles.headerText]}>Fec. Nacimiento</Text>
              <Text style={[styles.colPeso,      styles.headerText]}>Peso (kg)</Text>
              <Text style={[styles.colPrecio,    styles.headerText]}>Precio</Text>
              <Text style={[styles.colStatus,    styles.headerText]}>Status</Text>
              <Text style={[styles.colCategoria, styles.headerText]}>Categoría</Text>
            </View>

            {/* Filas */}
            {pageData.length > 0 ? (
              pageData.map((animal, idx) => (
                <View
                  key={animal.codigo_ani || `${pageIndex}-${idx}`}
                  style={[
                    styles.tableRow,
                    { backgroundColor: idx % 2 === 0 ? "#fff" : "#f8fafc" },
                  ]}
                >
                  <Text style={styles.colCodigo}>{animal.codigo_ani}</Text>
                  <Text style={styles.colNombre}>{animal.nombre_ani}</Text>
                  <Text style={styles.colArete}>{animal.arete_ani || "Sin Arete"}</Text>
                  <Text style={styles.colSexo}>{animal.sexo_ani}</Text>
                  <Text style={styles.colFechaNac}>{formatDate(animal.fechaNacimiento_ani)}</Text>
                  <Text style={styles.colPeso}>{animal.peso_ani ?? 0}</Text>
                  <Text style={styles.colPrecio}>{animal.precio_ani ?? 0}</Text>
                  <Text style={styles.colStatus}>{animal.status_ani === 1 ? "Activo" : "Inactivo"}</Text>
                  <Text style={styles.colCategoria}>{animal.categoria}</Text>
                </View>
              ))
            ) : (
              pageIndex === 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.noData}>No se encontraron animales para la categoría seleccionada.</Text>
                </View>
              )
            )}
          </View>

          {/* Total al final */}
          {pageIndex === pages.length - 1 && animales.length > 0 && (
            <Text style={styles.total}>Total de animales: {total}</Text>
          )}

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
          />
        </Page>
      ))}
    </Document>
  );
};

export default AnimalesPDF;
