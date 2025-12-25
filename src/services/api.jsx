import axios from 'axios';

const API_BASE_URL = 'http://iocl-backend-production-2894.up.railway.app/api/';

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