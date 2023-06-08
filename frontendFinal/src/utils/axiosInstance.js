import axios from "axios";

export const axiosAuthInstance = axios.create({
  baseURL: "http://192.168.43.210:5000",
});

export const axiosAppInstance = axios.create({
  baseURL: "http://localhost:5001",
});

export const axiosModuleHealthInstance = axios.create({
  baseURL: "http://20.173.88.38:8070",
});

export const axiosLocationInstance = axios.create({
  baseURL: "http://20.173.88.141:8060",
});
