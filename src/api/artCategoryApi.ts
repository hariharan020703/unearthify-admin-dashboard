import api from "./axios";

export const getAllCategoriesApi = () => api.get("/categories");

export const createCategoryApi = (data: FormData) =>
  api.post("/categories", data);

export const deleteCategoryApi = (id: string) =>
  api.delete(`/categories/${id}`);

export const updateCategoryApi = (id: string, data: FormData) =>
  api.put(`/categories/${id}`, data);

export const updateArtTypeApi = (
  categoryId: string,
  artTypeId: string,
  data: FormData
) => api.put(`/categories/${categoryId}/arttype/${artTypeId}`, data);

export const deleteArtTypeApi = (categoryId: string, artTypeId: string) =>
  api.delete(`/categories/${categoryId}/arttype/${artTypeId}`);

export const addArtTypeApi = (categoryId: string, data: FormData) =>
  api.post(`/categories/${categoryId}/arttype`, data);
