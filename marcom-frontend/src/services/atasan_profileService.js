import API from "../api/axios";

export const getProfile =
  async () => {

    const res =
      await API.get(
        "/profile"
      );

    return res.data;
  };

export const changePassword =
  async (data) => {

    const res =
      await API.put(
        "/profile/change-password",
        data
      );

    return res.data;
  };

export const changeEmail =
  async (data) => {

    const res =
      await API.put(
        "/profile/change-email",
        data
      );

    return res.data;
  };