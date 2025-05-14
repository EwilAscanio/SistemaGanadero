import NavbarTransparent from "@/components/NavbarTransparent";
import Footer from "@/components/Footer";

export default function Layout({ children }) {
  return (
    <div className="h-screen grid grid-rows-[15vh,1fr] bg-gradient-to-br from-blue-500 to-purple-600">
      <NavbarTransparent />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
