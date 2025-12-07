const {
  generateAcessToken,
  generateRefreshToken,
  refreshTokenSevice,
} = require("../libs/util");
const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signupCtrl = async (req, res) => {
  try {
    const { email, username, password, confirmPassword, phone } = req.body;
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: "Yêu cầu nhập đủ thông tin!" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email ko hợp lệ!" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password phải có 6 ký tự!" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password ko trùng nhau!" });
    }
    // Kiểm tra xem email đã tồn tại chưa
    const emailExist = await UserModel.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }
    const usernameExist = await UserModel.findOne({ username });
    if (usernameExist) {
      return res.status(400).json({ message: "Username đã tồn tại!" });
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new UserModel({
      email,
      username,
      password: hashedPassword,
      phone,
    });
    if (newUser) {
      generateAcessToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        phone,
        message: "Đăng ký tài khoản thành công",
      });
    }
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const signinCtrl = async (req, res) => {
  //console.log("req.body:", req.body); // Debug line
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter your information" });
  }
  try {
    const checkUser = await UserModel.findOne({ email });
    if (!checkUser) {
      return res.status(400).json({ message: "Email ko tồn tại!" });
    }
    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Mật khẩu ko chính xác!" });
    }
    // Lấy accessToken & refreshToken
    const accessToken = generateAcessToken(checkUser._id, res);
    const refreshToken = generateRefreshToken(checkUser._id, res);
    const responseData = {
      _id: checkUser._id,
      email: checkUser.email,
      username: checkUser.username,
      phone: checkUser.phone,
      message: "Đăng nhập tài khoản thành công!!!",
      accessToken,
      refreshToken,
    };
    //console.log("Response: ", responseData);
    // Tách refreshToken ra: Lấy refreshToken từ responseData & gán vào biến token
    const { refreshToken: token, ...newResponse } = responseData;

    // Gửi response ko có refreshToken
    return res.status(200).json(newResponse, refreshToken);
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const getAllUserCtrl = async (req, res) => {
  const allUsers = await UserModel.find().select("-password");
  if (!allUsers) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  res.status(200).json({
    data: allUsers,
  });
};

const getUserByIdCtrl = async (req, res) => {
  const { id } = req.params;
  const checkUser = await UserModel.findById(id).select("-password");
  if (!checkUser) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  res.status(200).json({
    data: checkUser,
  });
};

const updateUserCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    if (!userData) {
      return res.status(400).json({ message: "Please fill your information" });
    }
    const updateUser = await UserModel.findByIdAndUpdate(id, userData, {
      new: true,
    });

    res.status(200).json({
      updateUser,
      message: "Update user info successfully",
    });
  } catch (error) {
    console.log("Error in update user controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const refreshTokenCtrl = async (req, res) => {
  //console.log(">> token response: ", req.cookies.refresh_token);
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(400).json({ message: "Token ko tồn tại!" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const checkUser = await UserModel.findById(decoded.userId);
    //console.log(checkUser);

    if (!checkUser) {
      return res.status(401).json({ message: "User không tồn tại!" });
    }
    const newToken = refreshTokenSevice(checkUser._id, res);
    const responseData = {
      _id: checkUser._id,
      email: checkUser.email,
      username: checkUser.username,
      phone: checkUser.phone,
      message: "Làm mới token thành công!",
      accessToken: newToken,
    };

    return res.status(200).json(responseData);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Refresh token không hợp lệ!" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token đã hết hạn!" });
    }
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const logoutCtrl = async (req, res) => {
  try {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.status(200).json({ message: "Đăng xuất tài khoản thành công!" });
  } catch (err) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const deleteManyCtrl = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
    }

    const result = await UserModel.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy user nào để xóa" });
    }

    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} người dùng`,
    });
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

module.exports = {
  signupCtrl,
  signinCtrl,
  getAllUserCtrl,
  getUserByIdCtrl,
  updateUserCtrl,
  deleteManyCtrl,
  refreshTokenCtrl,
  logoutCtrl,
};
