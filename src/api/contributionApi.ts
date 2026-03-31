/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

export const createContributionApi = (data: any) =>
  api.post("/contribute", data);

export const getAllContributionsApi = () =>
  api.get("/contributions");

export const updateContributionApi = (id: string, data: any) =>
  api.patch(`/contributions/${id}`, data);

export const deleteContributionApi = (id: string) =>
  api.delete(`/contributions/${id}`);
