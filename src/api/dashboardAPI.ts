import api from "./axios";
import { API } from "./api";

export const getDashboardApi = () =>
  api.get(API.DASHBOARD);
