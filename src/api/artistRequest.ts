import api from "./axios";
import { API } from "./api";

export const getPendingArtistRequestsApi = () =>
  api.get(`${API.ARTIST_REQUEST}/pending`);

export const approveArtistRequestApi = (id: string) =>
  api.put(`${API.ARTIST_REQUEST}/approve/${id}`);

export const rejectArtistRequestApi = (id: string) =>
  api.put(`${API.ARTIST_REQUEST}/reject/${id}`);

export const getAllArtistRequestsApi = () =>
  api.get(`${API.ARTIST_REQUEST}/all`);