const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendEmailCreateOrder = async (email, orderItems) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // Tạo HTML danh sách sản phẩm
  let listItem = orderItems
    .map(
      (order) => `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
        <img src="${order.image}" 
             alt="Sản phẩm" 
             style="width: 100px; height: auto; display: block; margin-bottom: 10px;" />
        <div>
            <div>Số lượng: <b>${order.amount}</b></div>
            <div>Giá: <b>${order.price.toLocaleString()} VNĐ</b></div>
        </div>
    </div>
  `
    )
    .join("");

  const info = await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: "quanq1510@gmail.com",
    subject: "Bạn đã đặt hàng thành công tại Electro Tech",
    html: `
      <h2>Chi tiết đơn hàng của bạn</h2>
      ${listItem}
      <p>Cảm ơn bạn đã tin tưởng mua sắm tại Electro Tech!</p>
    `,
  });

  console.log("Message sent:", info.messageId);
};

module.exports = {
  sendEmailCreateOrder,
};
