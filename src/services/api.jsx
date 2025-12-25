import axios from 'axios';

// Determine backend base URL (env var wins). Default kept for local/dev.
const defaultBackend = 'http://iocl-backend-production-2894.up.railway.app/api';
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultBackend;

// If running in a browser over HTTPS, ensure backend URL uses HTTPS to avoid mixed-content errors.
if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
  if (API_BASE_URL.startsWith('http://')) {
    API_BASE_URL = API_BASE_URL.replace(/^http:\/\//i, 'https://');
  } else if (!/^https?:\/\//i.test(API_BASE_URL)) {
    API_BASE_URL = 'https://' + API_BASE_URL;
  }
}

// Normalize: remove trailing slashes
API_BASE_URL = API_BASE_URL.replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = (facility) => 
    api.get("/products",{
        params :facility ?{ facility  }: {}
    });

export const createProduct = (data) => api.post("/products", data);

export const downloadBill = async (items, meta = {}) => {
  try {
    const response = await api.post(
      "/bill/download",
      { items, meta },
      { responseType: "blob" }
    );
    return response.data;
  } catch (err) {
    const msg =
      err && err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : err.message || "Download failed";
    const e = new Error(msg);
    e.original = err;
    throw e;
  }
};

export const updateProduct = (id, data) => api.put(`/products/${id}`, data);