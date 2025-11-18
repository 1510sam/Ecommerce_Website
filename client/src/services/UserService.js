import axios from "axios";
import { store } from "~/store/store";
import { resetUser } from "~/store/userSlice";

export const axiosJWT = axios.create();

axiosJWT.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      store.dispatch(resetUser());
      localStorage.removeItem("access_token");
      window.location.href = "/login"; // redirect về login
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (data) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL_BACKEND}/auth/signin`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  return res.data;
};

export const registerUser = async (data) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL_BACKEND}/auth/signup`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  return res.data;
};

export const getAllUsers = async (accessToken) => {
  const res = await axiosJWT.get(
    `${import.meta.env.VITE_API_URL_BACKEND}/auth/users`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    }
  );
  return res.data;
};

export const getDetailUser = async (id, accessToken) => {
  const res = await axiosJWT.get(
    `${import.meta.env.VITE_API_URL_BACKEND}/auth/user/${id}`,
    {
      headers: {
        token: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    }
  );
  return res.data;
};

export const updateUser = async (id, accessToken, data) => {
  const res = await axiosJWT.put(
    `${import.meta.env.VITE_API_URL_BACKEND}/auth/update-user/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};

export const deleteUser = async (id, accessToken) => {
  const res = await axiosJWT.delete(
    `${import.meta.env.VITE_API_URL_BACKEND}/user/delete/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};

export const deleteManyUsers = async (token, data) => {
  const res = await axiosJWT.post(
    `${import.meta.env.VITE_API_URL_BACKEND}/auth/delete-many`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const refreshUserToken = async () => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL_BACKEND}/auth/refresh-token`,
    {},
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const logoutUserToken = async () => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL_BACKEND}/auth/logout`,
    {},
    {
      withCredentials: true,
    }
  );
  return res.data;
};

export const updateUserToken = async (id, data) => {
  try {
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL_BACKEND}/auth/update-user/${id}`,
      data,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Update user error:", error.response?.data || error.message);
    throw error;
  }
};
