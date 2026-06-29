import API from "../api/axios";

export const getAllRequests = (params) =>
  API.get("/requests", {
    params,
  });

export const getRequestById = (id) =>
  API.get(`/requests/${id}`);

export const togglePriority = (id) =>
  API.patch(`/requests/${id}/priority`);