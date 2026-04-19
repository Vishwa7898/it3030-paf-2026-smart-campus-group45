import axios from 'axios';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://localhost:8080';

// Ensure credentials are sent for all requests
axios.defaults.withCredentials = true;

const API_URL = `${API_BASE_URL}/api/users`;

export const userService = {
  getAllUsers: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  updateUserRoles: async (userId, roles) => {
    const response = await axios.put(`${API_URL}/${userId}/roles`, roles);
    return response.data;
  }
};
