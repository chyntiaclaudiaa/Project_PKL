import API from "../api/axios";

export const getAllRequests = (params) =>
  API.get("/atasan", {
    params,
  });

export const getRequestById = (id) =>
  API.get(`/atasan/${id}`);

export const togglePriority = (id) =>
  API.patch(`/atasan/${id}/priority`);