/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";
import { API } from "./api";

export const getAllArtistsApi = () =>
  api.get(API.ARTIST);

export const createArtistApi = (data: FormData) =>
  api.post("/artists", data);

export const updateArtistApi = (id: string, data: FormData) =>
  api.put(`/artists/${id}`, data);

export const deleteArtistApi = (id: string) =>
  api.delete(`/artists/${id}`);

export const softDeleteArtistApi = (id: string) =>
  api.patch(`/artists/${id}/delete`);

export const permanentDeleteArtistApi = (id: string) =>
  api.delete(`/artists/${id}/permanent`);

export const getDeletedArtistsApi = () =>
  api.get(`/artists?deleted=true`);

export const recoverArtistApi = (id: string) =>
  api.patch(`/artists/${id}/recover`);

export const bulkCreateArtistsApi = (data: any) =>
  api.post("/artists/bulk", data);