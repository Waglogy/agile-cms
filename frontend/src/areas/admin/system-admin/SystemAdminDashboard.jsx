/* eslint-disable no-unused-vars */
import React from "react";
import { useState, useEffect } from "react";
import Dashboard from "../common/dashboard-components/dashboard.component";

export default function SystemAdminDashboard() {
  const [table, setTable] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/collection")
      .then((res) => res.json())
      .then((response) => {
        console.log('Fetched response:', response);
        const { data } = response;
        const { get_all_collections } = data;
        if (Array.isArray(get_all_collections)) {
          setTable(get_all_collections);
        } else {
          console.error("Data is not an array:", get_all_collections);
          setTable([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setTable([]); // Reset table to an empty array on error
      });
  }, []);

  return (
    <>
      <section className="hidden lg:block">
        <Dashboard>
          <div className="flex items-center justify-center mt-9">
            <div className="text-center text-slate-700">
              <p className="text-4xl font-semibold text-[#124277]">
                Welcome System Admin!
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="p-6">
              <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden font-inter">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 border-b text-left text-lg font-semibold text-gray-700">
                      Tables
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((collection, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 border-b text-gray-800 font-medium">
                        {collection.collection_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Dashboard>
      </section>

      <section className="relative block lg:hidden w-[90%] mx-auto">
        <div className="mt-36 flex flex-col items-center justify-center">
          <p className="text-base font-semibold text-center">
            Bytesberry Technologies
          </p>
        </div>

        <div className="mt-10 text-center text-xs font-semibold">
          This dashboard is currently accessible only on Desktops and Laptops.
          Please visit us using a desktop device for the best experience.
        </div>
      </section>
    </>
  );
}
