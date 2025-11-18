const express = require("express");
const {
  createProductCtrl,
  updateProductCtrl,
  getDetailProductCtrl,
  deleteProductCtrl,
  getAllProductCtrl,
  deleteManyProductCtrl,
  getAllTypeCtrl,
} = require("../controllers/productCtrl");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post(
  "/create",
  authMiddleware.protectRoute,
  authMiddleware.requireAdmin,
  createProductCtrl
);
router.get("/detail/:id", getDetailProductCtrl);
router.get("/all", getAllProductCtrl);
router.put(
  "/update/:id",
  authMiddleware.protectRoute,
  authMiddleware.requireAdmin,
  updateProductCtrl
);
router.delete(
  "/delete/:id",
  authMiddleware.protectRoute,
  authMiddleware.requireAdmin,
  deleteProductCtrl
);
router.post(
  "/delete-many",
  authMiddleware.protectRoute,
  authMiddleware.requireAdmin,
  deleteManyProductCtrl
);
router.get("/get-all-type", getAllTypeCtrl);

module.exports = router;
