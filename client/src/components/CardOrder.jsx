import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import { convertPrice } from "~/util";
import { Button, Tag, Space } from "antd";
import {
  EyeOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as OrderService from "~/services/OrderService";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Loading from "./Loading";

const CardOrder = ({
  order,
  totalPrice,
  shippingPrice,
  isDelivered,
  isPaid,
  userState,
}) => {
  //console.log("user state: ", userState);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // Xác định trạng thái giao hàng
  const getDeliveryStatus = () => {
    if (isDelivered) {
      return {
        text: "Đã giao hàng",
        color: "success",
        icon: <CheckCircleOutlined />,
        bgColor: "bg-green-50",
        textColor: "text-green-700",
      };
    }
    return {
      text: "Đang giao hàng",
      color: "processing",
      icon: <TruckOutlined />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    };
  };

  const deliveryStatus = getDeliveryStatus();

  const handleToOrderDetail = () => {
    navigate(`/order-detail/${order._id}`, {
      state: { user: userState, order },
    });
  };

  const mutationCancelOrder = useMutationHook((data) => {
    const { id, token, orderItems } = data;
    const res = OrderService.cancelOrder(token, id, orderItems);
    return res;
  });
  const queryOrder = useQuery({
    queryKey: ["orders"],
  });

  const { isPending, data } = queryOrder;

  const handleCancelOrder = (order) => {
    Swal.fire({
      title: "Bạn có chắc muốn hủy đơn hàng này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff393b",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Có, hủy ngay!",
      cancelButtonText: "Không",
    }).then((result) => {
      if (result.isConfirmed) {
        mutationCancelOrder.mutate(
          {
            id: order._id,
            token: userState.token,
            orderItems: order?.orderItems,
          },
          {
            onSuccess: (data) => {
              queryClient.invalidateQueries(["myOrders"]);
              Swal.fire({
                icon: "success",
                title: data?.message || "Hủy thành công",
                text: "Đơn hàng đã được hủy!",
                confirmButtonText: "OK",
                confirmButtonColor: "#ff393b",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: true,
                allowOutsideClick: false,
              });
            },
            onError: (error) => {
              Swal.fire({
                icon: "error",
                title: error.response?.data?.message || "Hủy thất bại",
                text: "Đã xảy ra lỗi khi hủy đơn hàng",
                confirmButtonColor: "#ff393b",
              });
            },
          }
        );
      }
    });
  };

  const { isPending: isPendingCancel } = mutationCancelOrder;

  return (
    <Loading isPending={isPending || isPendingCancel}>
      <Card
        elevation={0}
        className="rounded-2xl mb-6 overflow-hidden border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
        sx={{
          background: "linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        {/* Header với gradient */}
        <Box
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-4"
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Box className="flex items-center gap-3">
            <Box
              className="w-10 h-10 rounded-full flex items-center justify-center"
              sx={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <ShoppingOutlined className="text-white text-xl" />
            </Box>
            <Box>
              <Typography
                variant="subtitle2"
                className="text-white opacity-90 text-xs"
              >
                Mã đơn hàng
              </Typography>
              <Typography variant="body1" className="text-white font-bold">
                {order?.orderCodeId}
              </Typography>
            </Box>
          </Box>

          <Tag
            color={deliveryStatus.color}
            icon={deliveryStatus.icon}
            className="text-sm font-semibold px-4 py-1.5 rounded-full border-0"
            style={{ backgroundColor: "white", color: "#667eea" }}
          >
            {deliveryStatus.text}
          </Tag>
        </Box>

        <CardContent className="p-6 space-y-5">
          {/* Danh sách sản phẩm */}
          <Box className="space-y-4">
            {order?.orderItems?.map((item, index) => (
              <React.Fragment key={item?._id || index}>
                <Box className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:shadow-md transition-all duration-300">
                  <Box className="relative">
                    <CardMedia
                      component="img"
                      image={item?.image}
                      alt={item?.name}
                      className="!w-24 !h-24 object-cover rounded-xl shadow-md border-2 border-white"
                    />
                    <Box className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                      {item?.amount}
                    </Box>
                  </Box>

                  <Box className="flex-1 min-w-0">
                    <Typography
                      variant="subtitle1"
                      className="font-bold text-gray-900 mb-2 line-clamp-2"
                    >
                      {item?.name}
                    </Typography>

                    <Space size="middle" wrap>
                      <Chip
                        label={`SL: ${item?.amount}`}
                        size="small"
                        className="bg-blue-100 text-blue-700 font-semibold"
                      />
                      <Chip
                        label={`${convertPrice(item?.price)}đ`}
                        size="small"
                        className="bg-purple-100 text-purple-700 font-semibold"
                      />
                    </Space>
                  </Box>

                  <Box className="text-right ml-4">
                    <Typography
                      variant="caption"
                      className="text-gray-500 block mb-1"
                    >
                      Thành tiền
                    </Typography>
                    <Typography
                      variant="h6"
                      className="font-bold text-gray-900"
                    >
                      {convertPrice(item?.price * item?.amount)}đ
                    </Typography>
                  </Box>
                </Box>

                {index < order.orderItems.length - 1 && (
                  <Divider className="!my-2" />
                )}
              </React.Fragment>
            ))}
          </Box>

          {/* Thông tin thanh toán và vận chuyển */}
          <Box className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-5 space-y-3">
            <Box className="flex items-center justify-between">
              <Typography
                variant="body2"
                className="text-gray-700 flex items-center gap-2"
              >
                <ClockCircleOutlined className="text-blue-600" />
                Trạng thái thanh toán:
              </Typography>
              <Chip
                label={isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                size="small"
                className={
                  isPaid
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "bg-red-100 text-red-700 font-semibold"
                }
                icon={
                  isPaid ? <CheckCircleOutlined /> : <CloseCircleOutlined />
                }
              />
            </Box>

            <Divider className="!my-2" />

            <Box className="flex justify-between items-center">
              <Typography variant="body2" className="text-gray-600">
                Phí vận chuyển
              </Typography>
              <Typography
                variant="body1"
                className="font-semibold text-gray-800"
              >
                {convertPrice(shippingPrice)}đ
              </Typography>
            </Box>

            <Box className="flex justify-between items-center pt-2 border-t-2 border-dashed border-gray-300">
              <Typography variant="h6" className="font-bold text-gray-900">
                Tổng đơn hàng
              </Typography>
              <Typography
                variant="h5"
                className="font-bold"
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {convertPrice(totalPrice)}đ
              </Typography>
            </Box>
          </Box>

          {/* Nút hành động */}
          <Box className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button
              onClick={() => handleCancelOrder(order)}
              icon={<CloseCircleOutlined />}
              danger
              size="large"
              className="rounded-xl font-semibold hover:scale-105 transition-transform"
              style={{
                borderWidth: "2px",
              }}
            >
              Hủy đơn hàng
            </Button>

            <Button
              onClick={handleToOrderDetail}
              icon={<EyeOutlined />}
              type="primary"
              size="large"
              className="rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            >
              Xem chi tiết
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Loading>
  );
};

export default CardOrder;
