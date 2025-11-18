import axios from "axios";
export const axiosJWT = axios.create();

export const getAllProducts = async (search = "", limit = 10) => {
  let res = {};
  if (search?.length > 0) {
    res = await axiosJWT.get(
      `${
        import.meta.env.VITE_API_URL_BACKEND
      }/product/all?keyword=${search}&limit=${limit}`
    );
  } else {
    res = await axiosJWT.get(
      `${import.meta.env.VITE_API_URL_BACKEND}/product/all?limit=${limit}`
    );
  }
  return res.data;
};

export const getTypeProduct = async (type, page, limit) => {
  if (type) {
    const res = await axiosJWT.get(
      `${
        import.meta.env.VITE_API_URL_BACKEND
      }/product/all?filter=${type}&limit=${limit}&page=${page}`
    );
    return res.data;
  }
  return null;
};

export const getProductById = async (id) => {
  const res = await axiosJWT.get(
    `${import.meta.env.VITE_API_URL_BACKEND}/product/detail/${id}`,
    {
      withCredentials: true,
    }
  );

  return res.data;
};

export const createProduct = async (data, token) => {
  const res = await axiosJWT.post(
    `${import.meta.env.VITE_API_URL_BACKEND}/product/create`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const updateProduct = async (id, accessToken, data) => {
  const res = await axiosJWT.put(
    `${import.meta.env.VITE_API_URL_BACKEND}/product/update/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};

export const deleteProduct = async (id, accessToken) => {
  const res = await axiosJWT.delete(
    `${import.meta.env.VITE_API_URL_BACKEND}/product/delete/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return res.data;
};

export const deleteManyProducts = async (token, data) => {
  const res = await axiosJWT.post(
    `${import.meta.env.VITE_API_URL_BACKEND}/product/delete-many`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const getAllTypeProduct = async () => {
  const res = await axiosJWT.get(
    `${import.meta.env.VITE_API_URL_BACKEND}/product/get-all-type`
  );
  return res.data;
};
