import API from "../api/axios";

/**
 * 1. Mengambil data summary dashboard (Total, Menunggu, Diproses, Selesai, dll)
 * @param {string} startDate - Format: YYYY-MM-DD
 * @param {string} endDate - Format: YYYY-MM-DD
 */
export const getSummary = async (startDate, endDate) => {
  const res = await API.get("/dashboard/summary", {
    params: { startDate, endDate }
  });
  return res.data;
};

/**
 * 2. Mengambil data distribusi status untuk Pie Chart
 * @param {string} startDate - Format: YYYY-MM-DD
 * @param {string} endDate - Format: YYYY-MM-DD
 */
export const getStatusDistribution = async (startDate, endDate) => {
  const res = await API.get("/dashboard/status-distribution", {
    params: { startDate, endDate } 
  });
  return res.data;
};

/**
 * 3. Mengambil data beban kerja (workload) setiap anggota/user
 * @param {string} startDate - Format: YYYY-MM-DD
 * @param {string} endDate - Format: YYYY-MM-DD
 */
export const getWorkload = async (startDate, endDate) => {
  const res = await API.get("/dashboard/workload", {
    params: { startDate, endDate } 
  });
  return res.data;
};

/**
 * 4. Mengambil data request yang memiliki prioritas tinggi (is_priority = true)
 * @param {string} startDate - Format: YYYY-MM-DD
 * @param {string} endDate - Format: YYYY-MM-DD
 */
export const getPriorityRequests = async (startDate, endDate) => {
  const res = await API.get("/dashboard/priority", {
    params: { startDate, endDate } 
  });
  return res.data;
};

/**
 * 5. Mengambil detail spesifik dari satu request berdasarkan ID
 * @param {number|string} id - ID Content Request
 */
export const getRequestDetail = async (id) => {
  const res = await API.get(`/dashboard/request/${id}`);
  return res.data;
};

/**
 * 6. Mengambil daftar riwayat komentar terbaru untuk Atasan
 */
export const getCommentNotifications = async () => {
  const res = await API.get("/dashboard/notifications");
  return res.data;
};

/**
 * 7. Mengubah status baca komentar menjadi sudah dibaca (is_read = true)
 * @param {number|string} commentId - ID dari Komentar terkait
 */
export const markNotificationAsRead = async (commentId) => {
  // Tambahkan kembali '/read' di ujung URL agar cocok dengan router backend kamu
  const res = await API.put(`/dashboard/notifications/${commentId}/read`);
  return res.data;
};