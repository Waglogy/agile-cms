/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { useNavigate } from "react-router-dom";

import { MdOutlinePowerSettingsNew } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";

function Header() {
  const navigate = useNavigate();

  const signOut = async () => {
    // localStorage.removeItem("roleid");
    navigate("/");
  };

  return (
    <>
      {/* Desktops and tablets */}
      <section className="hidden md:block">
        <header className="sticky top-0  bg-opacity-50 backdrop-blur-md border-b z-20 text-slate-700 rounded-lg m-4">
          <div className="grid grid-cols-2 px-6 py-2">
            <div className="font-semibold text-2xl">
           Headless-CMS
            </div>

            <div className="flex justify-end items-center gap-x-9">
              <div className="flex justify-end items-center gap-x-3">
                <div className="text-primary">
                  <FaUserCircle size={34} />
                </div>
                <div className="">
                  <p className="text-sm font-medium text-slate-800">Content-Admin</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div
                  onClick={() => signOut()}
                  className="cursor-pointer text-lg hover:text-red-500"
                >
                  <MdOutlinePowerSettingsNew size={20} />
                </div>
              </div>
            </div>
          </div>
        </header>
      </section>
    </>
  );
}

export default Header;
