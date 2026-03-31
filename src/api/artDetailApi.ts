/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

export const getAllArtDetailsApi = () => api.get("/details");

export const createArtDetailApi = (data: any) => api.post("/details", data);

export const updateArtDetailApi = (id: string, data: any) =>
  api.put(`/details/${id}`, data);

export const deleteArtDetailApi = (id: string) =>
  api.delete(`/details/${id}`);

export default api;
