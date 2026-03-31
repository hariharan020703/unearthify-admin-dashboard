import api from "./axios";
import { API } from "./api";

export const getApplicationApi = () =>
  api.get(API.APPLICATIONS);

export const deleteApplicationApi = (id: string) => 
    api.delete(`${API.APPLICATIONS}/${id}`)