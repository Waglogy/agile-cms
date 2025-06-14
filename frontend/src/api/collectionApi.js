import axios from 'axios'
import API_BASE_URL from './config'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // 👈 required for sessions
})

export const createCollection = async (payload) => {
  return axios.post(`${API_BASE_URL}/collection/create`, payload, {
    headers: {
      'auth-token': localStorage.getItem('token'),
    },
  })
}

export const insertCollectionData = async (payload) => {
  return axios.post(`${API_BASE_URL}/collection/insert`, payload, {
    headers: {
      'auth-token': localStorage.getItem('token'),
    },
  })
}

export const alterCollection = async (payload) => {
  return axios.post(`${API_BASE_URL}/collection/alter/column`, payload, {
    headers: {
      'auth-token': localStorage.getItem('token'),
    },
  })
}

export const getAllCollections = async () => {
  return api.get(`/collection`, {
    headers: {
      'auth-token': localStorage.getItem('token'),
    },
  })
}

export const fetchLogs = async () => {
  const res = await axios.get(`${API_BASE_URL}/collection/logs`, {
    headers: {
      'auth-token': localStorage.getItem('token'),
    },
  })
  return res.data
}

export const getCollectionData = async (tableName) => {
  return axios.get(`${API_BASE_URL}/collection/data/${tableName}`, {
    headers: {
      'auth-token': localStorage.getItem('token'),
    },
  })
}

export const deleteCollection = async (collectionName) => {
  return axios.post(
    `${API_BASE_URL}/collection/collection/delete-collection`,
    { collectionName },
    { withCredentials: true }
  )
}

export const insertDataToCollection = async (collectionName, payload) => {
  return axios.post(
    `${API_BASE_URL}/collection/insert`,
    {
      collectionName,
      ...payload,
    },
    {
      headers: {
        'auth-token': localStorage.getItem('token'),
      },
    }
  )
}

export const getCollectionByName = async (tableName) => {
  return axios.get(`${API_BASE_URL}/collection/${tableName}`, {
    headers: {
      'auth-token': localStorage.getItem('token'),
    },
  })
}

export const getAvailableDatabases = async () => {
  return axios.get(`${API_BASE_URL}/list-databases`, {
    // withCredentials: true,
  })
}
