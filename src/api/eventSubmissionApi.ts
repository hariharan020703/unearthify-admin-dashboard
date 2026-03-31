import api from "./axios";

export const getMyEventSubmissionsApi = () =>
  api.get("/event-submissions/my");  // ← use /my not /

export const createEventSubmissionApi = (data: FormData) =>
  api.post("/event-submissions", data);

export const getAllEventSubmissionsApi = () =>
  api.get("/event-submissions/all");

export const getEventSubmissionsByStatusApi = (status: string) =>
  api.get(`/event-submissions/all?status=${status}`);

export const getDeletedEventSubmissionsApi = () =>
  api.get("/event-submissions/deleted");

export const approveEventApi = (id: string) =>
  api.patch(`/event-submissions/${id}/approve`);

export const rejectEventApi = (id: string) =>
  api.patch(`/event-submissions/${id}/reject`);

export const deleteEventSubmissionApi = (id: string) =>
  api.patch(`/event-submissions/${id}/soft-delete`);  // ← fixed

export const recoverEventSubmissionApi = (id: string) =>
  api.patch(`/event-submissions/${id}/recover`);

export const permanentDeleteEventSubmissionApi = (id: string) =>
  api.delete(`/event-submissions/${id}/permanent`);

export const updateEventSubmissionApi = (id: string, data: FormData) =>
  api.patch(`/event-submissions/${id}/update`, data); 