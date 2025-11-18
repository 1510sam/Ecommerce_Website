const jwt = require("jsonwebtoken");
const generateAcessToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h", // token hết hạn sau 1 giờ
  });
  res.cookie("access_token", token, {
    maxAge: 60 * 60 * 1000, // 1 giờ
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};

const generateRefreshToken = (userId, res) => {
  //console.log(">> Req cookie: ", req.cookies);
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "365d", // hoặc "1y"
  });

  res.cookie("refresh_token", refreshToken, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 năm
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return refreshToken;
};

const refreshTokenSevice = (userId, res) => {
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

  res.cookie("refresh_token", refreshToken, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: false, // lưu ý
  });

  return refreshToken;
};

const setAutoLogout = (dispatch, navigate) => {
  const timeout = 60 * 60 * 1000; // 1 giờ
  setTimeout(() => {
    dispatch({ type: "user/resetUser" });
    localStorage.removeItem("access_token");
    navigate("/login");
  }, timeout);
};

module.exports = {
  generateAcessToken,
  generateRefreshToken,
  refreshTokenSevice,
  setAutoLogout,
};
