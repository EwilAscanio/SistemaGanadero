import Button from "./Button";

import { MdDashboardCustomize } from "react-icons/md";
import {
  FaCow,
  FaUsers,
  FaUserShield,
  FaBriefcaseMedical,
  FaWeightScale,
  FaHeart,
  FaHorseHead,
  FaPercent,
  FaChartLine,
} from "react-icons/fa6";
import { RiUserStarFill } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";
import Link from "next/link";

const loadUser = async (email) => {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/users/${email}`);

  return data;
};
const Sidebar = async () => {
  const sesion = await getServerSession(authOptions);
  const user = sesion.user;
  const user_rol = await loadUser(user.email);

  return (
    <>
      <div className="flex flex-col gap-2 items-center mt-4">
        <h2 className="font-bold underline text-blue-800 drop-shadow-lg text-lg">
          Menu de Usuarios
        </h2>
        {user_rol.name_rol == "Administrador" ? (
          <>
            <Button
              url={"/auth/dashboard"}
              content="Dashboard"
              icono={<MdDashboardCustomize />}
            />
            <Button
              url={"/auth/dashboard/listusers"}
              content="Usuarios"
              icono={<TbReportAnalytics />}
            />

            <Button
              url={"/auth/dashboard/cliente"}
              content="Clientes"
              icono={<RiUserStarFill />}
            />
          </>
        ) : (
          <>
            <Button
              url={"/dashboard"}
              content="Dashboard"
              icono={<MdDashboardCustomize />}
            />
            <Button
              url={"/auth/dashboard/users"}
              content="Listar Usuarios"
              icono={<TbReportAnalytics />}
            />
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 items-center">
        <h2 className="mt-2 font-bold underline text-blue-800 drop-shadow-lg text-lg">
          Procesos
        </h2>
        <Button
          url={"/auth/dashboard/animal"}
          content="Ficha Animal"
          icono={<FaHorseHead />}
        />
        <Button
          url={"/auth/dashboard/vacunacion"}
          content="Vacunacion"
          icono={<FaBriefcaseMedical />}
        />
        <Button
          url={"/auth/dashboard/peso"}
          content="Pesaje"
          icono={<FaWeightScale />}
        />
        <Button
          url={"/auth/dashboard/palpacion"}
          content="Palpacion"
          icono={<FaHeart />}
        />
        <Button
          url={"/auth/dashboard/nacimiento"}
          content="Nacimientos"
          icono={<FaCow />}
        />
        <Button
          url={"/auth/dashboard/produccionleche"}
          content="Produccion"
          icono={<FaPercent />}
        />
        <Button
          url={"/auth/dashboard/factura"}
          content="Ventas"
          icono={<FaChartLine />}
        />
        <Button
          url={"/auth/dashboard/reportes"}
          content="Reportes"
          icono={<FaChartLine />}
        />

        
      </div>
    </>
  );
};

export default Sidebar;
