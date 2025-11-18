const dayjs = require("dayjs");
const ProductModel = require("../models/Product");

const createProductCtrl = async (req, res) => {
  try {
    const {
      name,
      productName,
      image,
      type,
      price,
      countInStock,
      rating,
      discount,
      description,
    } = req.body;
    const finalName = name || productName;

    if (
      !finalName ||
      !image ||
      !type ||
      !price ||
      !countInStock ||
      !rating ||
      !description
    ) {
      return res.status(400).json({ message: "Yêu cầu nhập đủ thông tin!" });
    }

    // Kiểm tra xem sp đã tồn tại chưa
    const checkProduct = await ProductModel.findOne({ name: finalName });
    if (checkProduct) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại!" });
    }
    const newProduct = new ProductModel({
      name: finalName,
      image,
      type,
      price,
      countInStock: Number(countInStock),
      rating,
      discount: Number(discount),
      description,
    });
    if (newProduct) {
      await newProduct.save();
      return res.status(201).json({
        _id: newProduct._id,
        name: newProduct.name,
        type: newProduct.type,
        price: newProduct.price,
        countInStock: newProduct.countInStock,
        rating: newProduct.rating,
        discount: newProduct.discount,
        description: newProduct.description,
        message: "Thêm sản phẩm thành công",
      });
    }
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const getAllProductCtrl = async (req, res) => {
  try {
    const sortParam = (req.query.sort || "desc").toLowerCase();
    const orderParam = (req.query.order || "").toLowerCase();

    const keyword = req.query.keyword || ""; // tìm theo tên
    const filterType = req.query.filter || ""; // lọc theo type

    let sortField = "createdAt";
    let sortOrder = -1;

    if (sortParam === "asc" || sortParam === "desc") {
      sortOrder = sortParam === "asc" ? 1 : -1;
    } else {
      sortField = sortParam;
      sortOrder = orderParam === "asc" ? 1 : -1;
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;

    const filter = {};

    // Nếu có keyword thì ưu tiên search theo name
    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }
    if (filterType) {
      filter.type = { $regex: filterType, $options: "i" };
    }

    const totalProduct = await ProductModel.countDocuments(filter);
    const allProducts = await ProductModel.find(filter)
      .limit(limit)
      .skip(page * limit)
      .sort({ [sortField]: sortOrder });

    const formattedProducts = allProducts.map((product) => ({
      ...product._doc,
      createdAt: dayjs(product.createdAt).format("DD/MM/YYYY HH:mm"),
      updatedAt: dayjs(product.updatedAt).format("DD/MM/YYYY HH:mm"),
    }));

    res.status(200).json({
      data: formattedProducts,
      total: totalProduct,
      currentPage: Number(page + 1),
      totalPage: Math.ceil(totalProduct / limit),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const getDetailProductCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = await ProductModel.findById(id);
    if (!productData) {
      return res.status(400).json({ message: "Sp ko tồn tại" });
    }
    res.status(200).json({
      productData,
      message: "Xem thông tin sản phẩm thành công",
    });
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const updateProductCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    if (!productData) {
      return res.status(400).json({ message: "Sp ko tồn tại" });
    }
    const updatePro = await ProductModel.findByIdAndUpdate(id, productData, {
      new: true,
    });
    res.status(200).json({
      updatePro,
      message: "Cập nhật thông tin sản phẩm thành công",
    });
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const deleteProductCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const checkPro = await ProductModel.findOne({ _id: id });
    if (!checkPro) {
      return res.status(400).json({ message: "Mã sp ko tồn tại" });
    }
    await ProductModel.findByIdAndDelete(id);
    res.status(200).json({
      message: "Xóa sản phẩm thành công",
    });
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const deleteManyProductCtrl = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Danh sách ID không hợp lệ" });
    }

    const result = await ProductModel.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy sản phẩm nào để xóa" });
    }

    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} sản phẩm`,
    });
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

const getAllTypeCtrl = async (req, res) => {
  try {
    const productData = await ProductModel.distinct("type");
    if (!productData) {
      return res.status(400).json({ message: "Sp ko tồn tại" });
    }
    res.status(200).json({
      productData,
      message: "Xem loại sản phẩm thành công",
    });
  } catch (e) {
    console.error(e); // in lỗi chi tiết ra console
    return res.status(500).json({ message: e.message || "Server error" });
  }
};

module.exports = {
  createProductCtrl,
  updateProductCtrl,
  getAllProductCtrl,
  getDetailProductCtrl,
  deleteProductCtrl,
  deleteManyProductCtrl,
  getAllTypeCtrl,
};
