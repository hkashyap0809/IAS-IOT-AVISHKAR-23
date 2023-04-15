import axios from "axios";

export const axiosAuthInstance = axios.create({
  baseURL: "http://localhost:5000",
});

export const axiosDevInstance = axios.create({
  baseURL: "http://localhost:5001",
});
