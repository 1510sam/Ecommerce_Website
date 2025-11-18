import React from "react";
import { Box, Typography } from "@mui/material";
import CardOrder from "~/components/CardOrder";
import * as OrderService from "~/services/OrderService";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import Loading from "~/components/Loading";
import { useLocation } from "react-router-dom";

const MyOrderPage = () => {
  //const user = useSelector((state) => state.user);
  const location = useLocation();
  console.log("location: ", location);

  const { state } = location;
  console.log("state: ", state);

  // 🧠 Lấy danh sách đơn hàng bằng react-query
  const { isPending, data, error } = useQuery({
    queryKey: ["myOrders"],
    queryFn: () => OrderService.getAllOrderByUserId(state?.token, state?.id),
    enabled: !!state?.id && !!state?.token, // chỉ fetch khi có user
  });

  // Xử lý dữ liệu trả về từ API
  const orders = data?.data || [];
  console.log("orders:", orders);

  return (
    <Loading isPending={isPending}>
      <Box className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <Typography variant="h5" className="font-bold mb-4 text-gray-800">
          Đơn hàng của tôi
        </Typography>

        {/* Danh sách đơn hàng */}
        {orders.length > 0 ? (
          orders.map((order) => (
            <CardOrder
              key={order._id}
              order={order}
              totalPrice={order?.totalPrice}
              shippingPrice={order?.shippingPrice}
              isDelivered={order?.isDelivered}
              isPaid={order?.isPaid}
              userState={state}
            />
          ))
        ) : (
          <Box className="text-center text-gray-500 mt-10">
            Không có đơn hàng nào
          </Box>
        )}
      </Box>
    </Loading>
  );
};

export default MyOrderPage;
