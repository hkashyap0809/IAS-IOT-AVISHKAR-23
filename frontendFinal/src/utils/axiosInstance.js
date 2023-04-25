import axios from "axios";

export const axiosAuthInstance = axios.create({
  baseURL: "http://192.168.128.210:5000",
});

export const axiosAppInstance = axios.create({
  baseURL: "http://localhost:5001",
});

export const axiosModuleHealthInstance = axios.create({
  baseURL: "http://20.173.88.141:8070",
});

export const axiosLocationInstance = axios.create({
  baseURL: "http://20.21.102.175:2041",
});
