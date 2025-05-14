import Sidebar from "@/components/Sidebar";
import NavRight from "@/components/NavRight";
import Image from "next/image";
import Logo from "@/images/Logo.png";

export default function Layout({ children }) {
  return (
    <>
      {/* Contenedor principal del Layout usando Grid */}
      {/* Define 3 columnas: 20% para logo/sidebar, 1fr y 1fr para nav/contenido (se fusionarán con col-span-2) */}
      {/* Define 2 filas: 10% para la fila superior (logo/nav), 1fr para la fila inferior (sidebar/contenido) */}
      {/* h-[100vh] asegura que el grid ocupe toda la altura de la ventana */}
      {/* overflow-hidden en el contenedor principal previene scrollbars no deseados en el layout general */}
      <div className="grid grid-cols-[18%,1fr,1fr] grid-rows-[10%,1fr] h-[100vh] overflow-hidden bg-gray-100"> {/* Cambiado bg-white a bg-gray-100 para el fondo general */}

        {/* Área del Logo (Celda: Columna 1, Fila 1) */}
        {/* Centrado vertical y horizontalmente */}
        <div className="flex items-center justify-center bg-white shadow-sm"> {/* Añadido fondo y sombra para la barra superior */}
          <Image
            src={Logo}
            className="object-contain w-36 h-16" // Ajusta tamaño si es necesario
            alt="Logo Dashboard"
            priority
          />
        </div>

        {/* Área de Navegación Superior (Celda: Columnas 2 y 3, Fila 1) */}
        {/* col-span-2 hace que ocupe las dos columnas de la derecha */}
        {/* Flexbox para alinear contenido (NavRight) a la derecha y centrado verticalmente */}
        <div className="col-span-2 flex items-center justify-end px-6 bg-white shadow-sm"> {/* Añadido fondo, sombra, padding y alineación a la derecha */}
          <NavRight />
        </div>

        {/* Área del Sidebar (Celda: Columna 1, Fila 2) */}
        {/* row-start-2 lo posiciona en la segunda fila. No necesitas row-span-6. */}
        {/* Añadido fondo, color de texto, padding y overflow-y-auto para scroll si el contenido es largo */}
        <aside className="row-start-2 bg-white overflow-y-auto px-4">
          <Sidebar/>
        </aside>

        {/* Área del Contenido Principal (Celda: Columnas 2 y 3, Fila 2) */}
        {/* col-span-2 y row-start-2 lo posicionan correctamente en la segunda fila, ocupando las columnas de la derecha */}
        {/* Añadido fondo, padding y overflow-y-auto para scroll del contenido */}
        {/* rounded-tl-3xl para un borde redondeado en la esquina superior izquierda (común en dashboards) */}
        <main className="col-span-2 row-start-2 bg-slate-100 overflow-y-auto p-6 rounded-tl-3xl"> {/* Ajustado padding a p-6 */}
          {/* Los children (el contenido de la página) se renderizarán directamente aquí */}
          {children}
        </main>

      </div>
    </>
  );
}