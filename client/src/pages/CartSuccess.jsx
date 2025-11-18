import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Divider, Button } from "@mui/material";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as OrderService from "~/services/OrderService";
import Loading from "~/components/Loading";
import { useSelector } from "react-redux";
import { orderConstant } from "~/constant/constant";

const CartSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  //console.log("location: ", location);

  const { orderId } = useParams();
  const { state } = location;
  // console.log(state);

  const user = useSelector((state) => state.user);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (num) =>
    num ? num.toLocaleString("vi-VN") + " ₫" : "0 ₫";

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await OrderService.getAllOrderByUserId(
          user?.accessToken,
          user?.id
        );
        setOrderData(res?.data);
      } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && user?.accessToken) fetchOrder();
  }, [orderId, user?.accessToken]);

  if (loading) return <Loading isPending={true} />;

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Paper className="p-10 md:p-14 rounded-3xl shadow-lg bg-white max-w-3xl w-full text-center">
        <CheckCircleOutlined className="text-green-500 text-6xl mb-6" />
        <Typography
          variant="h4"
          fontWeight={700}
          className="text-gray-800 mb-3"
        >
          Cảm ơn bạn đã mua hàng!
        </Typography>
        <Typography variant="body1" className="text-gray-500 mb-1">
          Đơn hàng của bạn sẽ được giao trong 3-5 ngày làm việc.
        </Typography>

        <Typography variant="body2" className="text-gray-600 mb-2">
          Phương thức giao hàng:
          <span className="font-semibold text-gray-800 ml-1">
            {orderConstant.shipMethod[state?.shipMethod]}
          </span>
        </Typography>
        <Typography variant="body2" className="text-gray-600 mb-6">
          Phương thức thanh toán:
          <span className="font-semibold text-gray-800 ml-1">
            {orderConstant.paymentMethod[state?.paymentMethod]}
          </span>
        </Typography>

        {/* Thông tin đơn hàng */}
        <Paper className="p-6 rounded-2xl shadow-sm bg-gray-50 mb-6 text-left">
          <Typography variant="h6" fontWeight={600} className="mb-3">
            Tóm tắt đơn hàng
          </Typography>
          <Divider className="mb-3" />

          {state.order?.map((item) => (
            <>
              <Box
                key={item.product}
                className="flex justify-between items-center border-b border-gray-100 py-2"
              >
                <Box className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                  />
                  <Typography
                    variant="body1"
                    className="font-medium text-gray-800"
                  >
                    {item.name}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  className="text-gray-700"
                >
                  {formatCurrency(item.price * item.amount)}
                </Typography>
              </Box>
            </>
          ))}
          <Divider className="my-3" />

          <Box className="flex justify-between font-semibold text-gray-800">
            <Typography>Tổng cộng</Typography>
            <Typography color="error">
              {formatCurrency(state?.totalPrice)}
            </Typography>
          </Box>
        </Paper>

        {/* Buttons */}
        <Box className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="large"
            className="!border !border-orange-400 !text-orange-600 hover:!bg-orange-50 !rounded-xl !px-8 !py-2"
            onClick={() => navigate("/my-orders")}
          >
            Xem đơn hàng
          </Button>

          <Button
            type="primary"
            size="large"
            className="!bg-gradient-to-r !from-red-500 !to-orange-500 hover:!from-orange-500 hover:!to-red-500 !border-none !rounded-xl !px-8 !py-2 !text-white"
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CartSuccess;
