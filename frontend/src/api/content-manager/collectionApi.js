import axios from 'axios';
import {
  CONTENT_MANAGER_GET_COLLECTIONS,
  CONTENT_MANAGER_GET_COLLECTION_DATA,
  CONTENT_MANAGER_INSERT_DATA,
  CONTENT_MANAGER_UPDATE_DATA,
  CONTENT_MANAGER_DELETE_DATA
} from '../api_routing_urls';

export const fetchCollections = async () => {
  try {
    const res = await axios.get(CONTENT_MANAGER_GET_COLLECTIONS);
    console.log('API Response:', res.data); // Debug log
    // Handle empty or invalid response
    if (!res.data || !Array.isArray(res.data)) {
      console.warn('Invalid collections data received');
      return [];
    }
    return res.data;
  } catch (err) {
    console.error("Error fetching collections:", err);
    throw err;
  }
};

export const fetchCollectionData = async (collectionName) => {
  try {
    const res = await axios.get(`${CONTENT_MANAGER_GET_COLLECTION_DATA}/${collectionName}`);
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching collection data:", error);
    throw error;
  }
};

export const insertData = async (data) => {
  try {
    const response = await axios.post(CONTENT_MANAGER_INSERT_DATA, data);
    return response.data;
  } catch (err) {
    console.error("Error inserting data:", err);
    throw err;
  }
};

export const updateData = async (data) => {
  try {
    const response = await axios.post(CONTENT_MANAGER_UPDATE_DATA, data);
    return response.data;
  } catch (err) {
    console.error("Error updating data:", err);
    throw err;
  }
};

export const deleteData = async (data) => {
  try {
    const response = await axios.post(CONTENT_MANAGER_DELETE_DATA, data);
    return response.data;
  } catch (err) {
    console.error("Error deleting data:", err);
    throw err;
  }
};