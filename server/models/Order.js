const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderCodeId: { type: String, unique: true },
    orderItems: [
      {
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      phone: { type: Number, required: true },
    },
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    // taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  if (!this.orderCodeId) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // ví dụ 20251104
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase(); // ví dụ ABC12
    this.orderCode = `DH${datePart}-${randomPart}`;
  }
  next();
});

const OrderModel = mongoose.model("Order", orderSchema);

module.exports = OrderModel;
