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
