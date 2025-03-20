import axios from 'axios';

export const fetchCollections = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/collection");
    return res.data.data.get_all_collections || [];
  } catch (err) {
    console.error("Error fetching collections:", err);
    throw err;
  }
};

export const fetchCollectionData = async (collectionName) => {
  try {
    const res = await axios.get(`http://localhost:3000/api/collection/data/${collectionName}`);
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching collection data:", error);
    throw error;
  }
};

export const insertData = async (data) => {
  try {
    const response = await axios.post("http://localhost:3000/api/collection/insert", data);
    return response.data;
  } catch (err) {
    console.error("Error inserting data:", err);
    throw err;
  }
};

export const updateData = async (data) => {
  try {
    const response = await axios.post("http://localhost:3000/api/collection/update", data);
    return response.data;
  } catch (err) {
    console.error("Error updating data:", err);
    throw err;
  }
};

export const deleteData = async (data) => {
  try {
    const response = await axios.post("http://localhost:3000/api/collection/delete", data);
    return response.data;
  } catch (err) {
    console.error("Error deleting data:", err);
    throw err;
  }
};