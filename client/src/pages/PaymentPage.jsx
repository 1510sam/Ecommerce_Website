import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Tooltip,
} from "@mui/material";
import { Form, Input } from "antd";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as OrderService from "~/services/OrderService";
import * as PaymentService from "~/services/PaymentService";
import { removeAllOrderProduct } from "~/store/orderSlice";
import Loading from "~/components/Loading";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shipMethod, setShipMethod] = useState("grab");
  const [clientId, setClientId] = useState(null);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const order = useSelector((state) => state.order);
  const user = useSelector((state) => state.user);

  const mutationAddOrder = useMutationHook((data) => {
    const { token, ...rests } = data;
    return OrderService.createOrder(token, rests);
  });

  const { isPending } = mutationAddOrder;

  const subtotal = order?.orderItemsSelected?.reduce(
    (total, item) => total + item.price * item.amount,
    0
  );
  const shippingFee =
    order?.orderItemsSelected?.length > 0
      ? order?.orderItemsSelected?.reduce(
          (total, item) => total + item.amount,
          0
        ) >= 5
        ? 0
        : 30000
      : 0;

  const totalPrice = subtotal + shippingFee;

  const formatCurrency = (num) =>
    num ? num.toLocaleString("vi-VN") + " ₫" : "0 ₫";

  const handlePlaceOrder = () => {
    if (
      !user?.accessToken ||
      !order?.orderItemsSelected?.length ||
      !user?.username ||
      !user?.address ||
      !user?.phone ||
      !user?.city
    ) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng điền đầy đủ thông tin giao hàng.",
        confirmButtonColor: "#ff393b",
      });
      return;
    }

    mutationAddOrder.mutate(
      {
        token: user?.accessToken,
        orderItems: order?.orderItemsSelected,
        fullname: user?.username,
        address: user?.address,
        phone: user?.phone,
        city: user?.city,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shippingFee,
        totalPrice,
        user: user?.id,
        email: user?.email,
      },
      {
        onSuccess: (data) => {
          Swal.fire({
            icon: "success",
            title: "Đặt hàng thành công!",
            text: "Đơn hàng của bạn đã được đặt.",
            confirmButtonColor: "#ff393b",
          }).then(() => {
            const arrayOrdered = order?.orderItemsSelected?.map(
              (el) => el.product
            );
            dispatch(removeAllOrderProduct({ listChecked: arrayOrdered }));

            navigate(`/cart-success/${data?.newOrder?._id}`, {
              state: {
                shipMethod,
                paymentMethod,
                order: order?.orderItemsSelected,
                totalPrice: subtotal,
              },
            });
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: error.response?.data?.message || "Đã có lỗi xảy ra",
            text: "Không thể đặt hàng, vui lòng thử lại sau.",
            confirmButtonColor: "#ff393b",
          });
        },
      }
    );
  };

  // ✅ Lấy PayPal Client ID từ server
  useEffect(() => {
    const fetchPaypalConfig = async () => {
      try {
        const config = await PaymentService.getConfig();
        setClientId(config?.data || config); // tùy backend trả về {data: clientId} hay string
      } catch (error) {
        console.error("Lỗi khi tải PayPal config:", error);
      }
    };
    fetchPaypalConfig();
  }, []);

  const onApprovePaypal = (detail, data) => {
    mutationAddOrder.mutate(
      {
        token: user?.accessToken,
        orderItems: order?.orderItemsSelected,
        fullname: user?.username,
        address: user?.address,
        phone: user?.phone,
        city: user?.city,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shippingFee,
        totalPrice,
        user: user?.id,
        email: user?.email, // <-- FIX QUAN TRỌNG
        isPaid: true,
        paidAt: new Date(),
      },
      {
        onSuccess: (data) => {
          console.log("Data rendering: ", data);

          Swal.fire({
            icon: "success",
            title: "Đặt hàng thành công!",
            text: "Đơn hàng của bạn đã được đặt.",
            confirmButtonColor: "#ff393b",
          }).then(() => {
            const arrayOrdered = order?.orderItemsSelected?.map(
              (el) => el.product
            );
            dispatch(removeAllOrderProduct({ listChecked: arrayOrdered }));

            navigate("/");
          });
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: error.response?.data?.message || "Đã có lỗi xảy ra",
            text: "Không thể đặt hàng, vui lòng thử lại sau.",
            confirmButtonColor: "#ff393b",
          });
        },
      }
    );
    console.log("detail, data: ", detail, data);
  };

  return (
    <Box className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <Loading isPending={isPending}>
        <Typography variant="h5" fontWeight={600} mb={3} color="error">
          Thanh toán đơn hàng
        </Typography>

        <Grid container spacing={3}>
          {/* Bên trái */}
          <Grid item xs={12} md={8}>
            <Paper className="p-6 rounded-2xl shadow-sm">
              <Typography variant="h6" mb={2} fontWeight={600}>
                Thông tin giao hàng
              </Typography>

              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  username: user?.username || "",
                  phone: user?.phone || "",
                  address: user?.address || "",
                  city: user?.city || "",
                }}
              >
                <Form.Item
                  label="Tên người nhận"
                  name="username"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập tên người nhận" />
                </Form.Item>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Số nhà, tên đường, phường/xã..." />
                </Form.Item>
                <Form.Item
                  label="Thành phố"
                  name="city"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Thành phố / Tỉnh" />
                </Form.Item>
              </Form>

              <Divider className="my-4" />

              <Typography variant="h6" mb={2} fontWeight={600}>
                Phương thức giao hàng
              </Typography>
              <RadioGroup
                value={shipMethod}
                onChange={(e) => setShipMethod(e.target.value)}
              >
                <FormControlLabel
                  value="grab"
                  control={<Radio color="error" />}
                  label="Grab Express"
                />
                <FormControlLabel
                  value="fast"
                  control={<Radio color="error" />}
                  label="Fast Express"
                />
              </RadioGroup>

              <Divider className="my-4" />

              <Typography variant="h6" mb={2} fontWeight={600}>
                Phương thức thanh toán
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="cod"
                  control={<Radio color="error" />}
                  label="COD - Thanh toán khi nhận hàng"
                />
                <FormControlLabel
                  value="bank"
                  control={<Radio color="error" />}
                  label="Chuyển khoản ngân hàng"
                />
                <FormControlLabel
                  value="paypal"
                  control={<Radio color="error" />}
                  label="Thanh toán qua Paypal"
                />
              </RadioGroup>
            </Paper>
          </Grid>

          {/* Bên phải */}
          <Grid item xs={12} md={4}>
            <Paper className="p-6 rounded-2xl shadow-md border border-gray-200 bg-white sticky top-24">
              <Typography variant="h6" fontWeight={700} mb={2}>
                🧾 Tóm tắt đơn hàng
              </Typography>

              <Box className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                {order?.orderItemsSelected?.map((item) => (
                  <Box
                    key={item.product}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <Box className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                      />
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        className="truncate"
                      >
                        {item.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="error">
                      {formatCurrency(item.price * item.amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider className="my-3" />

              <Box className="space-y-1 text-gray-700">
                <Box className="flex justify-between text-sm">
                  <Typography>Tạm tính</Typography>
                  <Typography fontWeight={500}>
                    {formatCurrency(subtotal)}
                  </Typography>
                </Box>
                <Box className="flex justify-between text-sm">
                  <Typography>Phí giao hàng</Typography>
                  <Typography fontWeight={500}>
                    {formatCurrency(shippingFee)}
                  </Typography>
                </Box>
              </Box>

              <Divider className="my-3" />

              <Box className="flex justify-between items-center font-bold text-lg">
                <Typography>Tổng thanh toán</Typography>
                <Typography color="error">
                  {formatCurrency(totalPrice)}
                </Typography>
              </Box>

              {paymentMethod === "paypal" && clientId ? (
                <PayPalScriptProvider
                  options={{ "client-id": clientId, currency: "USD" }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: Math.round(totalPrice / 30000), // quy đổi sang USD
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={onApprovePaypal}
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                      Swal.fire({
                        icon: "error",
                        title: "Thanh toán thất bại!",
                        text: "Vui lòng thử lại.",
                      });
                    }}
                  />
                </PayPalScriptProvider>
              ) : (
                <Tooltip title="Xác nhận và tiến hành đặt hàng" placement="top">
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isPending}
                    sx={{
                      mt: 3,
                      py: 1.3,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "1rem",
                      background: "linear-gradient(to right, #ff4d4f, #ff7a45)",
                      boxShadow: "0 4px 10px rgba(255, 77, 79, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(to right, #ff7a45, #ff4d4f)",
                      },
                    }}
                    onClick={handlePlaceOrder}
                  >
                    {isPending ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                  </Button>
                </Tooltip>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Loading>
    </Box>
  );
};

export default PaymentPage;
