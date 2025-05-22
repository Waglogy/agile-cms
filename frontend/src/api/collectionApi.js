import axios from 'axios'
import API_BASE_URL from './config'

export const createCollection = async (payload) => {
  return axios.post(`${API_BASE_URL}/create`, payload)
}

export const insertCollectionData = async (payload) => {
  return axios.post(`${API_BASE_URL}/insert`, payload)
}

export const alterCollection = async (payload) => {
  return axios.post(`${API_BASE_URL}/alter`, payload)
}

// ✅ Use GET for collections listing (no payload)
export const getAllCollections = async () => {
  return axios.get(`${API_BASE_URL}`)
}

// ✅ Dynamic GET for specific collection data
export const getCollectionData = async (tableName) => {
  return axios.get(`${API_BASE_URL}/data/${tableName}`)
}
