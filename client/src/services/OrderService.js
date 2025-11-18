import axios from "axios";
export const axiosJWT = axios.create();
// OrderService.js
export const createOrder = async (token, data) => {
  const res = await axiosJWT.post(
    `${import.meta.env.VITE_API_URL_BACKEND}/order/create`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getAllOrderByUserId = async (token, id) => {
  const res = await axiosJWT.get(
    `${import.meta.env.VITE_API_URL_BACKEND}/order/get-all-order/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const getOrderDetail = async (token, id) => {
  const res = await axiosJWT.get(
    `${import.meta.env.VITE_API_URL_BACKEND}/order/get-detail-order/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const cancelOrder = async (token, id, orderItems) => {
  const res = await axiosJWT.delete(
    `${import.meta.env.VITE_API_URL_BACKEND}/order/cancel-order/${id}`,
    {
      data: orderItems,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
