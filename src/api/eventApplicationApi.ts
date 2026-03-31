import api from "./axios";
import { API } from "./api";

export const getEventApplicationApi = () =>
  api.get(API.EVENT_APPLICATIONS);

export const deletEventApplicationApi = (id: string) => 
    api.delete(`${API.EVENT_APPLICATIONS}/${id}`)