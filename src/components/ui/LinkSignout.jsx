"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { IoLogOut } from "react-icons/io5";
import Swal from "sweetalert2";

const LinkSignout = () => {
  return (
    <Link
      href="/api/auth/signout"
      onClick={(e) => {
        e.preventDefault();
        Swal.fire({
          title: "¿Estás seguro?",
          text: "Esta acción cerrará tu sesión.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, cerrar sesión",
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("signout", result.isConfirmed);
            signOut();
          }
        });
      }}
      className="flex flex-col items-center justify-center"
    >
      <i className="text-2xl text-center hover:text-red-700">
        <IoLogOut />
      </i>
      <p className="text-sm hover:text-red-700"> Cerrar Sesion </p>
    </Link>
  );
};

export default LinkSignout;
