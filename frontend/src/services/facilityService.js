import axios from 'axios';

const API_URL = 'http://localhost:8080/api/resources';
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
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
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
    const response = await axios.put(`${API_URL}/${id}`, toFormData(data, file), {
      headers: {
        Authorization: ADMIN_AUTH
      }
    });
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: ADMIN_AUTH
      }
    });
    return response.data;
  }
};
