"use client";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  // Encabezado
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottom: "2px solid #2563EB",
    paddingBottom: 15,
  },
  headerLeft: {
    width: "60%",
  },
  headerRight: {
    width: "35%",
    textAlign: "right",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563EB",
  },
  companyInfo: {
    fontSize: 9,
    color: "#555",
    marginTop: 4,
  },
  facturaTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563EB",
  },
  facturaNumber: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  fecha: {
    fontSize: 9,
    marginTop: 4,
  },
  // Información del cliente
  clienteSection: {
    marginBottom: 15,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#2563EB",
  },
  clienteInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clienteCampo: {
    fontSize: 9,
    marginBottom: 2,
  },
  clienteLabel: {
    fontWeight: "bold",
  },
  // Tabla
  table: {
    display: "table",
    width: "100%",
    marginTop: 10,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
  },
  tableHeaderRow: {
    backgroundColor: "#2563EB",
    borderBottom: "2px solid #1d4ed8",
  },
  colCodigo: { width: "15%", padding: 6, fontSize: 9, textAlign: "center" },
  colNombre: { width: "35%", padding: 6, fontSize: 9, textAlign: "left" },
  colCantidad: { width: "15%", padding: 6, fontSize: 9, textAlign: "center" },
  colPrecio: { width: "17.5%", padding: 6, fontSize: 9, textAlign: "right" },
  colSubtotal: { width: "17.5%", padding: 6, fontSize: 9, textAlign: "right" },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 9,
  },
  // Totales
  totalesSection: {
    marginTop: 15,
    borderTop: "1px solid #ccc",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  totalLabel: {
    width: "30%",
    textAlign: "right",
    paddingRight: 10,
    fontSize: 10,
  },
  totalValue: {
    width: "20%",
    textAlign: "right",
    fontSize: 10,
  },
  totalFinal: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#2563EB",
    color: "#fff",
    padding: 8,
    borderRadius: 4,
  },
  // Observaciones
  observacionesSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: "1px solid #ccc",
  },
  observacionesText: {
    fontSize: 9,
    color: "#555",
    marginTop: 4,
  },
  // Pie de página
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: "1px solid #ccc",
    paddingTop: 10,
    textAlign: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#999",
  },
  thankYou: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "bold",
    marginTop: 5,
  },
});

const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `$${num.toFixed(2)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleDateString("es-ES");
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const FacturaPDF = ({
  numeroFactura = "",
  cliente = {},
  animales = [],
  total = 0,
  observaciones = "",
}) => {
  const nombreEmpresa = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA || "Sistema Ganadero";
  const direccionEmpresa = process.env.NEXT_PUBLIC_DIRECCION_EMPRESA || "Dirección de la empresa";
  const telefonoEmpresa = process.env.NEXT_PUBLIC_TELEFONO_EMPRESA || "";
  const rifEmpresa = process.env.NEXT_PUBLIC_RIF_EMPRESA || "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{nombreEmpresa}</Text>
            {rifEmpresa && <Text style={styles.companyInfo}>RIF: {rifEmpresa}</Text>}
            {direccionEmpresa && <Text style={styles.companyInfo}>{direccionEmpresa}</Text>}
            {telefonoEmpresa && <Text style={styles.companyInfo}>Tel: {telefonoEmpresa}</Text>}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.facturaTitle}>FACTURA</Text>
            <Text style={styles.facturaNumber}>N° {numeroFactura}</Text>
            <Text style={styles.fecha}>Fecha: {formatDate(new Date())}</Text>
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={styles.clienteSection}>
          <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
          <View style={styles.clienteInfo}>
            <View>
              <Text style={styles.clienteCampo}>
                <Text style={styles.clienteLabel}>Código: </Text>
                {cliente.codigo_cli || "N/A"}
              </Text>
              <Text style={styles.clienteCampo}>
                <Text style={styles.clienteLabel}>Nombre: </Text>
                {cliente.nombre || "N/A"}
              </Text>
            </View>
            <View>
              {cliente.rif_cli && (
                <Text style={styles.clienteCampo}>
                  <Text style={styles.clienteLabel}>RIF: </Text>
                  {cliente.rif_cli}
                </Text>
              )}
              {cliente.telefono_cli && (
                <Text style={styles.clienteCampo}>
                  <Text style={styles.clienteLabel}>Teléfono: </Text>
                  {cliente.telefono_cli}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Tabla de Animales */}
        <View style={styles.table}>
          {/* Cabecera */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.colCodigo, styles.headerText]}>Código</Text>
            <Text style={[styles.colNombre, styles.headerText]}>Descripción</Text>
            <Text style={[styles.colCantidad, styles.headerText]}>Cant.</Text>
            <Text style={[styles.colPrecio, styles.headerText]}>P. Unitario</Text>
            <Text style={[styles.colSubtotal, styles.headerText]}>Subtotal</Text>
          </View>

          {/* Filas de animales */}
          {animales.length > 0 ? (
            animales.map((animal, idx) => (
              <View
                key={animal.codigo_ani || idx}
                style={[
                  styles.tableRow,
                  { backgroundColor: idx % 2 === 0 ? "#fff" : "#f8fafc" },
                ]}
              >
                <Text style={styles.colCodigo}>{animal.codigo_ani}</Text>
                <Text style={styles.colNombre}>{animal.nombre_ani}</Text>
                <Text style={styles.colCantidad}>1</Text>
                <Text style={styles.colPrecio}>
                  {formatCurrency(animal.precio_ani || animal.precio)}
                </Text>
                <Text style={styles.colSubtotal}>
                  {formatCurrency(animal.precio_ani || animal.precio)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={{ ...styles.colNombre, width: "100%", textAlign: "center", padding: 12 }}>
                No hay animales en esta factura
              </Text>
            </View>
          )}
        </View>

        {/* Totales */}
        <View style={styles.totalesSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (0%):</Text>
            <Text style={styles.totalValue}>$0.00</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={[styles.totalLabel, { fontWeight: "bold" }]}>TOTAL:</Text>
            <Text style={[styles.totalValue, styles.totalFinal]}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Observaciones */}
        {observaciones && (
          <View style={styles.observacionesSection}>
            <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
            <Text style={styles.observacionesText}>{observaciones}</Text>
          </View>
        )}

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este documento es una representación impresa de una factura electrónica.
          </Text>
          <Text style={styles.thankYou}>¡Gracias por su compra!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default FacturaPDF;