import API from "../api/axios";

export const getComments = (requestId) =>
  API.get(`/comments/${requestId}`);

export const addComment = (payload) =>
  API.post("/comments", payload);