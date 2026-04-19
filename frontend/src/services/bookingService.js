import axios from 'axios';

const base =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8080';

const client = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
});

function extractErrorMessage(err) {
  const d = err?.response?.data;
  if (!d) return err?.message || 'Request failed';
  if (typeof d.message === 'string') return d.message;
  const first = Object.values(d).find((v) => typeof v === 'string');
  return first || 'Request failed';
}

export const bookingService = {
  create: async (payload) => {
    try {
      const { data } = await client.post('/bookings', payload);
      return data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  getMine: async () => {
    try {
      const { data } = await client.get('/bookings/my');
      return data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  getById: async (id) => {
    try {
      const { data } = await client.get(`/bookings/${encodeURIComponent(id)}`);
      return data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  update: async (id, payload) => {
    try {
      const { data } = await client.put(`/bookings/${encodeURIComponent(id)}`, payload);
      return data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  review: async (id, payload) => {
    try {
      const { data } = await client.patch(`/bookings/${encodeURIComponent(id)}/review`, payload);
      return data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  cancel: async (id) => {
    try {
      await client.delete(`/bookings/${encodeURIComponent(id)}`);
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },

  listAllForAdmin: async (params = {}) => {
    try {
      const { data } = await client.get('/bookings', { params });
      return data;
    } catch (e) {
      throw new Error(extractErrorMessage(e));
    }
  },
};
