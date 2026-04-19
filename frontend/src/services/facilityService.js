import axios from 'axios';

/** Base URL for API and uploaded media (override with VITE_API_BASE_URL in .env). */
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

// Enable sending cookies for cross-origin requests
axios.defaults.withCredentials = true;

const API_URL = `${API_BASE_URL}/api/resources`;
const ADMIN_AUTH = `Basic ${btoa('admin:admin123')}`;

const toFormData = (data, file) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
      return;
    }
    formData.append(key, value);
  });
  if (file) {
    formData.append('file', file);
  }
  return formData;
};

export const facilityService = {
  getAll: async (params) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
  },

  search: async (keyword) => {
    const response = await axios.get(`${API_URL}/search`, {
      params: keyword ? { keyword } : {}
    });
    return response.data;
  },

  getByLocation: async (location) => {
    const encoded = encodeURIComponent(location);
    const response = await axios.get(`${API_URL}/location/${encoded}`);
    return response.data;
  },

  getByStatus: async (status) => {
    const response = await axios.get(`${API_URL}/status/${status}`);
    return response.data;
  },

  getActive: async () => {
    const response = await axios.get(`${API_URL}/status/active`);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${encodeURIComponent(id)}`);
    return response.data;
  },

  create: async (data, file) => {
    const response = await axios.post(API_URL, toFormData(data, file), {
      headers: {
        Authorization: ADMIN_AUTH
      }
    });
    return response.data;
  },

  update: async (id, data, file) => {
    const url = `${API_URL}/${encodeURIComponent(id)}`;
    const payload = file ? toFormData(data, file) : data;
    const response = await axios.put(url, payload, {
      headers: {
        Authorization: ADMIN_AUTH
      }
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: ADMIN_AUTH
      }
    });
    return response.data;
  }
};
