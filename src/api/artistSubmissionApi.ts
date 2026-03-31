import api from "./axios";

export const getArtistSubmissionsApi = () =>
  api.get("/artist-submissions");

export const approveSubmissionApi = (id: string) =>
  api.patch(`/artist-submissions/${id}/approve`);

export const rejectSubmissionApi = (id: string) =>
  api.patch(`/artist-submissions/${id}/reject`);

export const createAdminSubmissionApi = (formData: FormData) =>
  api.post("/artist-submissions/admin", formData);

export const deleteSubmissionApi = (id: string) =>
  api.patch(`/artist-submissions/${id}/soft-delete`);

export const getDeletedSubmissionsApi = () =>
  api.get(`/artist-submissions/deleted`);

export const recoverSubmissionApi = (id: string) =>
  api.patch(`/artist-submissions/${id}/recover`);

export const permanentDeleteSubmissionApi = (id: string) =>
  api.delete(`/artist-submissions/${id}/permanent`);