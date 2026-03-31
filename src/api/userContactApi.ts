import api from "./axios";
import { API } from "./api";

export const getContactRequestsApi = () =>
  api.get(API.Contact_REQUESTS);

export const deleteContactRequestApi = (id: string) =>
  api.delete(`${API.Contact_REQUESTS}/${id}`);