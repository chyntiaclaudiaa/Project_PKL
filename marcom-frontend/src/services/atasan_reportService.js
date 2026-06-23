import API from "../api/axios";

export const getReportData = (
  startDate,
  endDate
) => {
  return API.get(
    `/report?startDate=${startDate}&endDate=${endDate}`
  );
};