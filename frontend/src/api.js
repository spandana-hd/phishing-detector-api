<<<<<<< HEAD
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictEmail = async (emailText) => {
  const res = await api.post("/v1/predict/", { text: emailText });
  return res.data;
};
=======
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// The "export const" is the important part that makes this function available
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// This exports the 'api' object as the default
export default api;
>>>>>>> cd7b4de2c825b18386b879087938c5f72947fda6
