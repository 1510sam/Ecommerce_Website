const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  createOrderCtrl,
  getAllOrderDetailCtrl,
  getOrderDetailCtrl,
  cancelOrderCtrl,
  getAllOrderCtrl,
} = require("../controllers/orderCtrl");

const router = express.Router();

router.post("/create", authMiddleware.protectRoute, createOrderCtrl);

router.get("/get-all", authMiddleware.protectRoute, getAllOrderCtrl);

router.get(
  "/get-all-order/:id",
  authMiddleware.protectRoute,
  getAllOrderDetailCtrl
);

router.get(
  "/get-detail-order/:id",
  authMiddleware.protectRoute,
  getOrderDetailCtrl
);

router.delete(
  "/cancel-order/:id",
  authMiddleware.protectRoute,
  cancelOrderCtrl
);

module.exports = router;
