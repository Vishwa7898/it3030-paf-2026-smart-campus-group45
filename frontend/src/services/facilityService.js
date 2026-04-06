import axios from 'axios';

const API_URL = 'http://localhost:8080/api/resources';

export const facilityService = {
  getAll: async (params) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  
  create: async (data, role = 'ADMIN') => {
    const response = await axios.post(API_URL, data, {
      headers: { 'X-Role': role }
    });
    return response.data;
  },
  
  update: async (id, data, role = 'ADMIN') => {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: { 'X-Role': role }
    });
    return response.data;
  },
  
  delete: async (id, role = 'ADMIN') => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { 'X-Role': role }
    });
    return response.data;
  }
};
