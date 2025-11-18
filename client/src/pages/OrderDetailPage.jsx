import React, { useMemo, useState } from "react";
import { Steps, Tag, Timeline, Divider, Button, Card, Avatar } from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CarOutlined,
  InboxOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PrinterOutlined,
  CloseOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as OrderService from "~/services/OrderService";
import { useSelector } from "react-redux";

const OrderDetail = () => {
  const location = useLocation();
  const user = useSelector((state) => state.user);
  console.log("user state: ", user);
  const { state } = location;
  console.log("state: ", state);
  //console.log("token gửi lên:", state.user.token);
  const params = useParams();
  const { id } = params;
  console.log("params: ", params);

  const fetchOrdersDetail = async () => {
    const res = await OrderService.getOrderDetail(id, user?.accessToken);
    return res.data;
  };

  const queryOrder = useQuery({
    queryKey: ["order-details", id],
    queryFn: fetchOrdersDetail,
    enabled: !!id, // chỉ fetch khi có id
  });

  const { isPending, data } = queryOrder;
  const orderData = data || state?.order;
  console.log("orderData:", orderData);

  // const [order] = useState({
  //   orderId: "ORD-2024-001234",
  //   orderDate: "15/03/2024",
  //   orderTime: "14:30",
  //   status: "shipping",
  //   totalAmount: 2850000,
  //   shippingFee: 30000,
  //   discount: 150000,
  //   finalAmount: 2730000,
  //   paymentMethod: "Thanh toán khi nhận hàng (COD)",
  //   customer: {
  //     name: "Nguyễn Văn A",
  //     phone: "0901234567",
  //     email: "nguyenvana@email.com",
  //     address: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
  //   },
  //   items: [
  //     {
  //       id: 1,
  //       name: "iPhone 15 Pro Max 256GB",
  //       image:
  //         "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop",
  //       quantity: 1,
  //       price: 1500000,
  //       total: 1500000,
  //     },
  //     {
  //       id: 2,
  //       name: "Apple Watch Series 9 GPS",
  //       image:
  //         "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=200&h=200&fit=crop",
  //       quantity: 1,
  //       price: 800000,
  //       total: 800000,
  //     },
  //     {
  //       id: 3,
  //       name: "AirPods Pro (Gen 2)",
  //       image:
  //         "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=200&h=200&fit=crop",
  //       quantity: 1,
  //       price: 550000,
  //       total: 550000,
  //     },
  //   ],
  //   trackingHistory: [
  //     {
  //       status: "Đã đặt hàng",
  //       time: "15/03/2024 14:30",
  //       description: "Đơn hàng đã được đặt thành công",
  //       color: "blue",
  //     },
  //     {
  //       status: "Đã xác nhận",
  //       time: "15/03/2024 15:00",
  //       description: "Shop đã xác nhận đơn hàng",
  //       color: "green",
  //     },
  //     {
  //       status: "Đang chuẩn bị",
  //       time: "15/03/2024 16:30",
  //       description: "Đơn hàng đang được đóng gói",
  //       color: "orange",
  //     },
  //     {
  //       status: "Đang giao",
  //       time: "16/03/2024 09:00",
  //       description: "Đơn hàng đang trên đường giao đến bạn",
  //       color: "purple",
  //     },
  //   ],
  // });

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: "warning", text: "Chờ xác nhận" },
      confirmed: { color: "processing", text: "Đã xác nhận" },
      shipping: { color: "purple", text: "Đang giao hàng" },
      delivered: { color: "success", text: "Đã giao hàng" },
      cancelled: { color: "error", text: "Đã hủy" },
    };
    return configs[status] || { color: "default", text: "Không xác định" };
  };

  const getCurrentStep = (order) => {
    if (!order) return 0;

    switch (true) {
      // Nếu đơn hàng đã giao xong
      case order.isDelivered:
        return 3;

      // Nếu đơn hàng đã thanh toán xong (kể cả tt bằng paypal)
      case order.isPaid:
        return 3;

      // Nếu đơn hàng đã giao xong
      case order.isShipped:
        return 2;

      // Nếu đơn hàng đã đc xác nhận
      case order.isConfirmed:
        return 1;

      default:
        return 0;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const provisionalPrice = () => {
    const result =
      orderData?.orderItems[0].price * orderData?.orderItems[0].amount;
    return result;
  };
  //const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6 rounded-2xl shadow-lg border-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-3">
                Chi tiết đơn hàng
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-600 text-base">
                  Mã đơn:{" "}
                  <strong className="text-gray-900">
                    {orderData.orderCodeId}
                  </strong>
                </span>
                {/* <Tag
                  color={statusConfig.color}
                  className="text-sm font-semibold px-3 py-1"
                >
                  {statusConfig.text}
                </Tag> */}
              </div>
            </div>
            <div className="flex gap-3">
              <Button icon={<PrinterOutlined />} type="default" size="large">
                In đơn hàng
              </Button>
              <Button
                icon={<CloseOutlined />}
                type="primary"
                danger
                size="large"
              >
                Hủy đơn
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Progress */}
            <Card className="rounded-2xl shadow-lg border-0">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <InboxOutlined className="text-blue-600 text-2xl" />
                Trạng thái đơn hàng
              </h2>
              <Steps
                current={getCurrentStep(orderData)}
                className="mb-4"
                items={[
                  {
                    title: "Đặt hàng",
                    icon: <ShoppingCartOutlined />,
                  },
                  {
                    title: "Xác nhận",
                    icon: <CheckCircleOutlined />,
                  },
                  {
                    title: "Vận chuyển",
                    icon: <CarOutlined />,
                  },
                  {
                    title: "Hoàn thành",
                    icon: <InboxOutlined />,
                  },
                ]}
              />
            </Card>

            {/* Order Items */}
            <Card className="rounded-2xl shadow-lg border-0">
              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Sản phẩm đã đặt ({orderData?.orderItems[0].amount} sản phẩm)
              </h2>
              <div className="space-y-4">
                {orderData?.orderItems?.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2 text-base">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600 text-sm">
                          Số lượng: <strong>{item.amount}</strong>
                        </span>
                        <span className="text-blue-600 font-bold">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-1">Thành tiền</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.price * item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Divider />
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính</span>
                  <span className="font-semibold">
                    {formatCurrency(provisionalPrice())}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">
                    {formatCurrency(orderData?.shippingPrice)}
                  </span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-800">Tổng cộng</span>
                  <span className="text-blue-600">
                    {formatCurrency(orderData?.totalPrice)}
                  </span>
                </div>
              </div>
              ;
            </Card>

            {/* Tracking History */}
            {/* <Card className="rounded-2xl shadow-lg border-0">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <ClockCircleOutlined className="text-blue-600 text-2xl" />
                Lịch sử theo dõi đơn hàng
              </h2>
              <Timeline
                items={order.trackingHistory.map((track) => ({
                  color: track.color,
                  children: (
                    <div className="pb-2">
                      <p className="font-semibold text-gray-900 text-base">
                        {track.status}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{track.time}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {track.description}
                      </p>
                    </div>
                  ),
                }))}
              />
            </Card> */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card className="rounded-2xl shadow-lg border-0">
              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Thông tin khách hàng
              </h2>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Avatar
                    size={48}
                    style={{ backgroundColor: "#1890ff" }}
                    icon={<UserOutlined />}
                  />
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {orderData?.shippingAddress?.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Khách hàng thân thiết
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <PhoneOutlined className="text-blue-600 text-lg flex-shrink-0" />
                  <span className="text-sm">
                    {orderData?.shippingAddress?.phone}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-gray-700 p-3 bg-gray-50 rounded-lg">
                  <EnvironmentOutlined className="text-blue-600 text-lg flex-shrink-0 mt-1" />
                  <span className="text-sm">
                    {orderData?.shippingAddress?.address},{" "}
                    {orderData?.shippingAddress?.city}
                  </span>
                </div>
              </div>
            </Card>

            {/* Payment & Delivery Info */}
            <Card className="rounded-2xl shadow-lg border-0">
              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Thông tin thanh toán & giao hàng
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <CreditCardOutlined className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      Phương thức thanh toán
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {orderData.paymentMethod === "cod"
                        ? "Thanh toán khi nhận hàng (COD)"
                        : ""}
                      {orderData.paymentMethod === "bank"
                        ? "Chuyển khoản ngân hàng"
                        : ""}
                      {orderData.paymentMethod === "paypal"
                        ? "Chuyển khoản qua paypal"
                        : ""}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CalendarOutlined className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Ngày đặt hàng</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.orderDate}
                    </p>
                  </div>
                </div> */}

                {/* <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <ClockCircleOutlined className="text-purple-600 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Thời gian đặt</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.orderTime}
                    </p>
                  </div>
                </div> */}
              </div>
            </Card>

            {/* Support Card */}
            <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CustomerServiceOutlined className="text-white text-4xl" />
                </div>
                <h3 className="text-lg font-bold mb-2">Cần hỗ trợ?</h3>
                <p className="text-sm mb-5 opacity-90">
                  Liên hệ với chúng tôi để được giải đáp thắc mắc về đơn hàng
                </p>
                <Button
                  type="primary"
                  size="large"
                  block
                  className="bg-white text-blue-600 font-semibold hover:bg-gray-100 border-0"
                  icon={<PhoneOutlined />}
                >
                  Liên hệ hỗ trợ ngay
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
