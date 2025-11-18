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
      isPaid,
      paidAt,
      email,
    } = req.body;

    //await sendEmailCreateOrder(user.email, orderItems);
    // ✅ Kiểm tra dữ liệu đầu vào
    if (
      !paymentMethod ||
      !itemsPrice ||
      !shippingPrice ||
      !totalPrice ||
      !fullname ||
      !address ||
      !city ||
      !phone ||
      !user
    ) {
      return res.status(400).json({ message: "Yêu cầu nhập đủ thông tin!" });
    }

    // ✅ Kiểm tra tồn kho từng sản phẩm
    for (const order of orderItems) {
      const productData = await ProductModel.findById(order.product);
      if (!productData || productData.countInStock < order.amount) {
        return res.status(400).json({
          status: "ERR",
          message: `Sản phẩm ${order.product} không đủ hàng`,
        });
      }
    }

    // ✅ Giảm tồn kho sau khi kiểm tra
    for (const order of orderItems) {
      await ProductModel.findByIdAndUpdate(order.product, {
        $inc: { countInStock: -order.amount, selled: order.amount },
      });
    }

    // ✅ Tạo mã đơn hàng ngẫu nhiên
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderCodeId = `DH${datePart}-${randomPart}`;

    // ✅ Tạo mới đơn hàng
    const newOrder = await OrderModel.create({
      orderCodeId, // ✅ thêm thẳng vào đây
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

    // ✅ Trả về dữ liệu cho frontend
    return res.status(201).json({
      status: "OK",
      message: "Đặt hàng thành công!",
      orderCodeId: newOrder.orderCodeId, // Trả về mã đơn hàng chính xác
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
  getAllOrderDetailCtrl,
  getOrderDetailCtrl,
  cancelOrderCtrl,
};
