const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

// Middleware kiểm tra đăng nhập cơ bản
const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await UserModel.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Tài khoản ko tồn tại!" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware kiểm tra quyền admin
const requireAdmin = async (req, res, next) => {
  try {
    //console.log(">> Check user login: ", req.user);

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - Please login first",
      });
    }
    if (!req.user.isAdmin) {
      return res.status(403).json({
        message: "Forbidden - Chỉ admin mới có quyền thực hiện chức năng này!",
      });
    }
    //console.log("Admin access granted:", req.user.email || req.user.username);
    next();
  } catch (error) {
    console.log("Error in requireAdmin middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  protectRoute,
  requireAdmin,
};
