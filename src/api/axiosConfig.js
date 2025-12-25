import axios from 'axios';

const api = axios.create({
  baseURL: 'https://iocl-backend-production-2894.up.railway.app/api'
  // ...existing code...
});

export default api;