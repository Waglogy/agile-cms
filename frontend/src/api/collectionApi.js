import axios from 'axios'
import API_BASE_URL from './config'

export const createCollection = async (payload) => {
  return axios.post(`${API_BASE_URL}/collection/create`, payload)
}

export const insertCollectionData = async (payload) => {
  return axios.post(`${API_BASE_URL}/collection/insert`, payload)
}

export const alterCollection = async (payload) => {
  return axios.post(`${API_BASE_URL}/collection/alter/column`, payload)
}

// ✅ Use GET for collections listing (no payload)
export const getAllCollections = async () => {
  return axios.get(`${API_BASE_URL}`)
}

export const fetchLogs = async () => {
  const res = await axios.get(`${API_BASE_URL}/collection/logs`)
  return res.data
}

// ✅ Dynamic GET for specific collection data
export const getCollectionData = async (tableName) => {
  return axios.get(`${API_BASE_URL}/collection/data/${tableName}`)
}

export const deleteCollection = async (collectionName) => {
  return axios.post(`${API_BASE_URL}/collection/collection/delete-collection`, {
    collectionName,
  })
}

export const insertDataToCollection = async (collectionName, payload) => {
  return axios.post(`${API_BASE_URL}/collection/insert`, {
    collectionName,
    ...payload,
  })
}

export const getCollectionByName = async (tableName) => {
  return axios.get(`http://localhost:8000/api/collection/${tableName}`)
}

export const getAvailableDatabases = async () => {
  const data = await axios.get(`${API_BASE_URL}/list-databases`)
  return data
}
