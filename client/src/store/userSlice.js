import { createSlice } from "@reduxjs/toolkit";

// Khởi tạo state
const initialState = {
  email: "",
  username: "",
  phone: "",
  address: "",
  avatar: "",
  accessToken: "",
  id: "",
  city: "",
  isAdmin: false,
};

// Định nghĩa userSlice nhận 3 giá trị
export const userSlice = createSlice({
  // Định nghĩa namespace cho slice
  name: "user",
  // State ban đầu
  initialState,
  // Reducer con
  reducers: {
    // Cập nhật user
    updateUser: (state, action) => {
      const {
        email,
        username,
        phone,
        address,
        avatar,
        accessToken,
        _id,
        city,
        isAdmin,
      } = action.payload;
      state.email = email;
      state.username = username;
      state.phone = phone;
      state.address = address;
      state.avatar = avatar;
      state.accessToken = accessToken;
      state.id = _id;
      state.city = city;
      state.isAdmin = isAdmin;
      //Object.assign(state, userData);
    },
    // Reset state về trạng thái ban đầu (logout)
    resetUser: (state) => {
      state.username = "";
      state.email = "";
      state.phone = "";
      state.address = "";
      state.avatar = "";
      state.accessToken = "";
      state.id = "";
      state.city = "";
      state.isAdmin = "";
    },
  },
});

// Tự động tạo action creators
export const { updateUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
