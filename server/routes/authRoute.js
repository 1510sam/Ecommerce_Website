const express = require("express");
const {
  signupCtrl,
  signinCtrl,
  updateUserCtrl,
  getAllUserCtrl,
  getUserByIdCtrl,
  refreshTokenCtrl,
  logoutCtrl,
  deleteManyCtrl,
} = require("../controllers/authCtrl");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// CÁC ROUTE CỤ THỂ ĐẶT TRƯỚC
router.get("/users", authMiddleware.protectRoute, getAllUserCtrl);
router.post("/signup", signupCtrl);
router.post("/signin", signinCtrl);
router.post("/logout", logoutCtrl);
router.post("/refresh-token", refreshTokenCtrl);

// ROUTE /user/:id ĐẶT SAU CÙNG
router.get("/user/:id", getUserByIdCtrl);
router.put("/update-user/:id", updateUserCtrl);
router.post("/delete-many", authMiddleware.protectRoute, deleteManyCtrl);

module.exports = router;
