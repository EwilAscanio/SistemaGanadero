import React from "react";
import axios from "axios";
import Image from "next/image";
import ImagenProfile from "@/images/8380015.jpg";
import ButtonDelete from "@/components/ButtonDelete";

const loadUser = async (user_id) => {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/users/${user_id}`
  );
  return data;
};

const UserPage = async ({ params }) => {
  const user = await loadUser(params.id);

  return (
    <div className="w-full flex justify-center items-center flex-wrap gap-8 ">
      <section className="flex font-medium items-center justify-center  hover:rounded-2xl ">
        <section className="w-80 mx-auto rounded-2xl px-8 py-6 shadow-lg">
          <div className="flex items-center justify-between"></div>
          <div className="mt-6 w-fit mx-auto">
            <Image
              src={ImagenProfile}
              className="rounded-full w-28 shadow-sm "
              alt="profile picture"
            />
          </div>

          <div className="mt-8 ">
            <h4 className="text-blue-600 font-bold text-2xl tracking-wide">
              {user.name_usr} <br /> {user.login_usr}
            </h4>
          </div>
          <p className="text-blue-400 font-semibold mt-2.5">{user.email_usr}</p>

          <div className="flex flex-col items-center justify-center mt">
            <ButtonDelete content={"Delete"} user_id={params.id} />
          </div>
        </section>
      </section>
    </div>
  );
};

export default UserPage;
