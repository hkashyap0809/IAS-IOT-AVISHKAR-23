import axios from "axios";

export const axiosAuthInstance = axios.create({
  baseURL: "http://192.168.43.27:5000",
});

export const axiosAppInstance = axios.create({
  baseURL: "http://localhost:5001",
});

export const axiosModuleHealthInstance = axios.create({
  baseURL: "http://20.173.88.141:8070",
});
