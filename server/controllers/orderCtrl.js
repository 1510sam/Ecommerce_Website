const OrderModel = require("../models/Order");
const ProductModel = require("../models/Product");
const { sendEmailCreateOrder } = require("./emailCtrl");

const createOrderCtrl = async (req, res) => {
  try {
    const {
      orderItems,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      fullname,
      address,
      city,
      phone,
      user,
      email,
      isPaid,
      paidAt,
    } = req.body; // ✅ Sửa tại đây

    const promises = orderItems.map(async (order) => {
      const productData = await ProductModel.findOneAndUpdate(
        {
          _id: order.product,
          countInStock: { $gte: order.amount },
        },
        {
          $inc: {
            countInStock: -order.amount,
            selled: +order.amount,
          },
        },
        { new: true }
      );

      if (!productData) {
        return { id: order.product };
      }
    });

    const results = await Promise.all(promises);

    const failedProducts = results.filter((item) => item !== undefined);
    if (failedProducts.length > 0) {
      const arrId = failedProducts.map((item) => item.id);
      return res.status(400).json({
        status: "ERR",
        message: `Sản phẩm ${arrId.join(", ")} không đủ hàng`,
      });
    }

    // Tạo mã đơn hàng
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderCodeId = `DH${datePart}-${randomPart}`;

    // Tạo mới đơn hàng
    const newOrder = await OrderModel.create({
      orderCodeId,
      orderItems,
      shippingAddress: { fullName: fullname, address, city, phone },
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      user,
      isPaid,
      paidAt,
    });

    await sendEmailCreateOrder(email, orderItems);

    return res.status(201).json({
      status: "OK",
      message: "Đặt hàng thành công!",
      orderCodeId,
      order: newOrder,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      status: "ERR",
      message: error.message || "Server error",
    });
  }
};

const getAllOrderCtrl = async (req, res) => {
  try {
    // Tìm đơn hàng theo ID và populate thông tin user
    const orders = await OrderModel.find();
    if (!orders) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng!",
      });
    }
    return res.status(200).json({
      message: "Lấy tất cả đơn hàng thành công",
      data: orders,
    });
  } catch (e) {
    console.error("Lỗi khi lấy đơn hàng:", e);
    return res.status(500).json({
      message: e.message || "Lỗi server khi lấy đơn hàng",
    });
  }
};

const getAllOrderDetailCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm đơn hàng theo ID và populate thông tin user
    const order = await OrderModel.find({ user: id });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng!",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin đơn hàng thành công",
      data: order,
    });
  } catch (e) {
    console.error("Lỗi khi lấy đơn hàng:", e);
    return res.status(500).json({
      message: e.message || "Lỗi server khi lấy đơn hàng",
    });
  }
};

const getOrderDetailCtrl = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Tìm đơn hàng theo ID và populate thông tin user
    const order = await OrderModel.findById({ _id: orderId });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng!",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin đơn hàng thành công",
      data: order,
    });
  } catch (e) {
    console.error("Lỗi khi lấy đơn hàng:", e);
    return res.status(500).json({
      message: e.message || "Lỗi server khi lấy đơn hàng",
    });
  }
};

const cancelOrderCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let order = [];

    // ✅ Giảm tồn kho sau khi kiểm tra
    const promises = data.map(async (order) => {
      const productData = await ProductModel.findOneAndUpdate(
        {
          _id: order.product,
          selled: { $gte: order.amount },
        },
        {
          $inc: {
            countInStock: +order.amount,
            selled: -order.amount,
          },
        },
        { new: true }
      );
      //console.log("productData: ", productData);

      if (productData) {
        const deleteOrder = await OrderModel.findByIdAndDelete(id);
        if (deleteOrder === null) {
          return res.status(400).json({ message: "Mã đơn hàng ko tồn tại" });
        }
        if (deleteOrder) {
          res.status(200).json({
            message: "Xóa đơn hàng thành công",
          });
        }
      }
    });
    const results = await Promise.all(promises);
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

module.exports = {
  createOrderCtrl,
  getAllOrderCtrl,
  getAllOrderDetailCtrl,
  getOrderDetailCtrl,
  cancelOrderCtrl,
};
