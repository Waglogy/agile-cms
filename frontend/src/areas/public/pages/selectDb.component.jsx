/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "../../../api/axios";

import bbLogo from "../../../assets/bbLogo.png";

import Spinner from "../../../reusable-components/spinner/spinner.component";

const SelectDbForm = () => {
  const navigate = useNavigate();
  const [databases, setDatabases] = useState([]); // Ensure initial state is an empty array
  const [selectedDb, setSelectedDb] = useState(''); // State for selected database
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
  const [newDbName, setNewDbName] = useState(''); // State for new database name

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/list-databases', {
          timeout: 5000, 
        });
        console.log('Fetched databases:', response.data.data); 
        setDatabases(Array.isArray(response.data.data) ? response.data.data : []); 
      } catch (error) {
        console.error('Error fetching databases:', error);
      }
    };

    fetchDatabases();
  }, []);

  const handleDbSelect = async () => {
    const dbToInit = selectedDb || newDbName; // Determine which database to initialize
    if (!dbToInit) return;
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/init', {
        db_name: dbToInit,
      });
      navigate("/system-admin/dashboard");
    } catch (error) {
      console.error('Error initializing database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-[80%] lg:w-[60%] mx-auto min-h-screen mt-24">
      <div className="flex justify-center w-40 md:w-56 lg:w-full mx-auto mb-5">
        <img src={bbLogo} className="h-12" alt="BytesBerry Logo" />
      </div>

      <div className="p-1 md:p-5">
        <div className="flex flex-col justify-center">
          <div className="text-center text-primary text-base md:text-lg lg:text-xl font-semibold mb-3">
            Select or Create Database
          </div>
        </div>

        <section className="mt-4 mx-auto max-w-[80%] md:max-w-[65%]">
          <div className="mt-5">
            <select
              value={selectedDb}
              onChange={(e) => {
                setSelectedDb(e.target.value);
                setNewDbName(''); // Clear newDbName when selecting existing database
              }}
              className="w-full p-2 border rounded-md"
              disabled={isLoading || newDbName}
            >
              <option value="">Select a database</option>
              {databases.map((db) => (
                <option key={db.datname} value={db.datname}>
                  {db.datname}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <input
              type="text"
              value={newDbName}
              onChange={(e) => {
                setNewDbName(e.target.value);
                setSelectedDb(''); // Clear selectedDb when entering new database name
              }}
              placeholder="Enter new database name"
              className="w-full p-2 border rounded-md"
              disabled={isLoading || selectedDb}
            />
          </div>

          <div className="mt-10 flex flex-col flex-grow">
            <button
              onClick={handleDbSelect}
              disabled={!(selectedDb || newDbName) || isLoading}
              className="bg-primary text-white text-sm px-3 py-1 lg:px-5 lg:py-3 uppercase disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex gap-x-1 justify-center items-center">
                  <span>Connecting</span>
                  <span className="pl-1">
                    <Spinner />
                  </span>
                </div>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};

export default SelectDbForm;
