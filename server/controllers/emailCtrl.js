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

  let attachImages = [];

  // Thêm index vào .map
  let listItem = orderItems
    .map((order, index) => {
      const cid = `product_${index}@electro`;

      attachImages.push({
        filename: `product_${index}.jpg`,
        path: order.image, // URL hoặc đường dẫn ảnh
        cid: cid,
      });

      return `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">

            <img src="cid:${cid}" alt="product image" style="width: 120px; height: auto; margin-bottom: 10px;" />
            
            <div>
                <div>Số lượng: <b>${order.amount}</b></div>
                <div>Giá: <b>${order.price.toLocaleString()} VNĐ</b></div>
            </div>
        </div>
      `;
    })
    .join("");

  const info = await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Bạn đã đặt hàng thành công tại Electro Tech",
    html: `
      <h2>Chi tiết đơn hàng của bạn</h2>
      ${listItem}
      <p>Cảm ơn bạn đã tin tưởng mua sắm tại Electro Tech!</p>
    `,
    attachments: attachImages,
  });

  console.log("Message sent:", info.messageId);
};

module.exports = {
  sendEmailCreateOrder,
};
