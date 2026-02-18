import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const ITEMS_PER_PAGE = 20;

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 14,
    textAlign: "center",
  },
  companyName: { fontSize: 20, fontWeight: "bold" },
  address:     { fontSize: 10, marginBottom: 4, textAlign: "center" },
  date:        { fontSize: 9,  marginBottom: 8, textAlign: "center" },
  title:       { fontSize: 14, fontWeight: "bold", marginBottom: 4, textAlign: "center" },
  subtitle:    { fontSize: 10, textAlign: "center", marginBottom: 12, color: "#555" },

  // Bloque de familia (separador entre grupos)
  familiaHeader: {
    backgroundColor: "#2563EB",
    padding: "5 8",
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  familiaNombre: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  familiaGrupo:  { color: "#dbeafe", fontSize: 9 },
  familiaTotal:  { color: "#fff", fontSize: 9, alignSelf: "center" },

  // Tabla
  table: {
    display: "table",
    width: "auto",
    border: "1px solid #e2e8f0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
  },
  tableHeaderRow: {
    backgroundColor: "#eff6ff",
    borderBottom: "2px solid #93c5fd",
  },

  // Columnas
  colCodigo:    { width: "12%", padding: 5, fontSize: 7, textAlign: "center" },
  colNombre:    { width: "22%", padding: 5, fontSize: 7, textAlign: "left" },
  colArete:     { width: "13%", padding: 5, fontSize: 7, textAlign: "center" },
  colSexo:      { width: "9%",  padding: 5, fontSize: 7, textAlign: "center" },
  colFechaNac:  { width: "14%", padding: 5, fontSize: 7, textAlign: "center" },
  colPeso:      { width: "10%", padding: 5, fontSize: 7, textAlign: "center" },
  colPrecio:    { width: "11%", padding: 5, fontSize: 7, textAlign: "center" },
  colStatus:    { width: "9%",  padding: 5, fontSize: 7, textAlign: "center" },

  headerText: { fontWeight: "bold", fontSize: 7, color: "#1d4ed8" },
  noAnimals:  { padding: 8, fontSize: 8, color: "#888", textAlign: "center" },

  total: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 12,
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
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

// Aplana las familias en "filas" para paginar manteniendo el bloque de encabezado junto
const buildPages = (familias, perPage) => {
  const allItems = []; // { type: 'header'|'row'|'empty', data }
  for (const fam of familias) {
    allItems.push({ type: "header", data: fam });
    if (fam.animales.length === 0) {
      allItems.push({ type: "empty", data: fam });
    } else {
      for (const a of fam.animales) {
        allItems.push({ type: "row", data: a, familia: fam });
      }
    }
  }
  const pages = [];
  for (let i = 0; i < allItems.length; i += perPage) {
    pages.push(allItems.slice(i, i + perPage));
  }
  if (pages.length === 0) pages.push([]);
  return pages;
};

const FamiliaAnimalPDF = ({
  familias = [],
  conteo = [],
  familia = "Todos",
  totalAnimales = 0,
}) => {
  const nombreEmpresa  = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA  || "Sistema Ganadero";
  const direccionEmpresa = process.env.NEXT_PUBLIC_DIRECCION_EMPRESA || "";
  const pages = buildPages(familias, ITEMS_PER_PAGE);

  return (
    <Document>
      {pages.map((pageItems, pageIndex) => (
        <Page size="A4" orientation="landscape" style={styles.page} key={`page-${pageIndex}`}>

          {/* Encabezado solo en la primera página */}
          {pageIndex === 0 && (
            <>
              <View style={styles.header}>
                <Text style={styles.companyName}>{nombreEmpresa}</Text>
                {direccionEmpresa ? <Text style={styles.address}>{direccionEmpresa}</Text> : null}
                <Text style={styles.date}>
                  Fecha de generación: {new Date().toLocaleDateString("es-ES")}
                </Text>
              </View>
              <Text style={styles.title}>Reporte de Familias de Animales</Text>
              <Text style={styles.subtitle}>
                Familia: {familia}  |  Total animales: {totalAnimales}
              </Text>
            </>
          )}

          {/* Contenido de la página */}
          {pageItems.map((item, idx) => {
            if (item.type === "header") {
              const totalFam = conteo.find(
                (c) => c.codigo_fam === item.data.codigo_fam
              )?.total ?? 0;
              return (
                <View key={`h-${idx}`} style={styles.familiaHeader}>
                  <Text style={styles.familiaNombre}>{item.data.nombre_fam}</Text>
                  <Text style={styles.familiaGrupo}>Grupo: {item.data.grupo}</Text>
                  <Text style={styles.familiaTotal}>Animales: {totalFam}</Text>
                </View>
              );
            }

            if (item.type === "empty") {
              return (
                <View key={`e-${idx}`} style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={styles.noAnimals}>
                      Esta familia no tiene animales registrados.
                    </Text>
                  </View>
                </View>
              );
            }

            // Fila de animal — mostrar cabecera de tabla si la fila anterior fue un header
            const prevItem = pageItems[idx - 1];
            const showTableHeader = prevItem && prevItem.type === "header";

            return (
              <View key={`r-${idx}`}>
                {showTableHeader && (
                  <View style={[styles.tableRow, styles.tableHeaderRow]}>
                    <Text style={[styles.colCodigo,   styles.headerText]}>Código</Text>
                    <Text style={[styles.colNombre,   styles.headerText]}>Nombre</Text>
                    <Text style={[styles.colArete,    styles.headerText]}>Arete</Text>
                    <Text style={[styles.colSexo,     styles.headerText]}>Sexo</Text>
                    <Text style={[styles.colFechaNac, styles.headerText]}>Fec. Nacim.</Text>
                    <Text style={[styles.colPeso,     styles.headerText]}>Peso (kg)</Text>
                    <Text style={[styles.colPrecio,   styles.headerText]}>Precio</Text>
                    <Text style={[styles.colStatus,   styles.headerText]}>Status</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: idx % 2 === 0 ? "#fff" : "#f8fafc" },
                  ]}
                >
                  <Text style={styles.colCodigo}>{item.data.codigo_ani}</Text>
                  <Text style={styles.colNombre}>{item.data.nombre_ani}</Text>
                  <Text style={styles.colArete}>{item.data.arete_ani || "Sin Arete"}</Text>
                  <Text style={styles.colSexo}>{item.data.sexo_ani}</Text>
                  <Text style={styles.colFechaNac}>{formatDate(item.data.fechaNacimiento_ani)}</Text>
                  <Text style={styles.colPeso}>{item.data.peso_ani ?? 0}</Text>
                  <Text style={styles.colPrecio}>{item.data.precio_ani ?? 0}</Text>
                  <Text style={styles.colStatus}>
                    {item.data.status_ani === 1 ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Total al final */}
          {pageIndex === pages.length - 1 && totalAnimales > 0 && (
            <Text style={styles.total}>Total de animales: {totalAnimales}</Text>
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

export default FamiliaAnimalPDF;
