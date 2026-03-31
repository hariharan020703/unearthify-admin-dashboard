import api from "./axios";

// ==========================
// 🔥 PUBLIC
// ==========================

// GET ALL (non-deleted)
export const getAllEventsApi = () =>
  api.get("/events");

// UPCOMING
export const getUpcomingEventsApi = () =>
  api.get("/events/upcoming");

// SINGLE
export const getEventByIdApi = (id: string) =>
  api.get(`/events/${id}`);

// ==========================
// 🔥 ADMIN
// ==========================

// CREATE
export const createEventApi = (data: FormData) =>
  api.post("/events", data);

// UPDATE
export const updateEventApi = (id: string, data: FormData) =>
  api.put(`/events/${id}`, data);

// SOFT DELETE (🔥 renamed properly)
export const softDeleteEventApi = (id: string) =>
  api.delete(`/events/${id}`);

// GET DELETED
export const getDeletedEventsApi = () =>
  api.get("/events?deleted=true");

// RECOVER
export const recoverEventApi = (id: string) =>
  api.patch(`/events/${id}/recover`);

// PERMANENT DELETE
export const permanentDeleteEventApi = (id: string) =>
  api.delete(`/events/${id}/permanent`);