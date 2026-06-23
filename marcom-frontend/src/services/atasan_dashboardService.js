import API from "../api/axios";

// 1. Pastikan fungsi menerima (startDate, endDate)
export const getSummary = async (startDate, endDate) => {
  const res = await API.get("/dashboard/summary", {
    params: { startDate, endDate }
  });
  return res.data;
};

// 2. KELURUSAN: Kemarin mungkin fungsi ini tidak menerima parameter (startDate, endDate)
export const getStatusDistribution = async (startDate, endDate) => {
  const res = await API.get("/dashboard/status-distribution", {
    params: { startDate, endDate } 
  });
  return res.data;
};

// 3. Tambahkan parameter juga di sini
export const getWorkload = async (startDate, endDate) => {
  const res = await API.get("/dashboard/workload", {
    params: { startDate, endDate } 
  });
  return res.data;
};

// 4. Tambahkan parameter juga di sini
export const getPriorityRequests = async (startDate, endDate) => {
  const res = await API.get("/dashboard/priority", {
    params: { startDate, endDate } 
  });
  return res.data;
};

export const getRequestDetail = async (id) => {
  const res = await API.get(`/dashboard/request/${id}`);
  return res.data;
};