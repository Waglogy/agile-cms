import axios from "./axios";
import {
  CONTENT_ADMIN_CREATE_COLLECTION,
  CONTENT_ADMIN_VIEW_COLLECTIONS,
  CONTENT_ADMIN_UPDATE_COLLECTION,
  CONTENT_MANAGER_GET_CONTENT,
  CONTENT_MANAGER_UPDATE_CONTENT,
  CONTENT_MANAGER_DELETE_CONTENT
} from "./api_routing_urls";

// Content Admin APIs
export const createCollection = async (data) => {
  return axios.post(CONTENT_ADMIN_CREATE_COLLECTION, data);
};

export const getCollections = async () => {
  return axios.get(CONTENT_ADMIN_VIEW_COLLECTIONS);
};

export const updateCollection = async (id, data) => {
  return axios.put(`${CONTENT_ADMIN_UPDATE_COLLECTION}/${id}`, data);
};

// Content Manager APIs
export const getContent = async (collectionId) => {
  return axios.get(`${CONTENT_MANAGER_GET_CONTENT}/${collectionId}`);
};

export const updateContent = async (contentId, data) => {
  return axios.put(`${CONTENT_MANAGER_UPDATE_CONTENT}/${contentId}`, data);
};

export const deleteContent = async (contentId) => {
  return axios.delete(`${CONTENT_MANAGER_DELETE_CONTENT}/${contentId}`);
};