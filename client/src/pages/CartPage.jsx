import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  TextField,
  Paper,
  Box,
  Typography,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, InputNumber, Upload } from "antd";
import {
  decreaseAmount,
  increaseAmount,
  removeAllOrderProduct,
  removeOrderProduct,
  selectedOrder,
} from "~/store/orderSlice";
import ModalComponent from "~/components/Modal/ModalComponent";
import Swal from "sweetalert2";
import { convertPrice } from "~/util";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as UserService from "~/services/UserService";
import Loading from "~/components/Loading";
import { updateUser } from "~/store/userSlice";
import EmptyCart from "~/components/EmptyCart";
import { useNavigate } from "react-router-dom";
import Step from "~/components/Step";

const CartPage = () => {
  const [openModalUpdateInfo, setOpenModalUpdateInfo] = useState(false);
  const [stateUserDetails, setStateUserDetails] = useState({
    username: "",
    phone: "",
    address: "",
    city: "",
  });
  const handleOnChangeDetails = (e) => {
    const { name, value } = e.target;
    setStateUserDetails({
      ...stateUserDetails,
      [name]: value,
    });
  };

  //console.log("stateUserDetails: ", stateUserDetails);

  const [updateForm] = Form.useForm();
  const onUpdateUser = () => {};

  const mutationUpdate = useMutationHook((updateData) => {
    //console.log("Data mutate: ", updateData);
    const { id, token, ...rests } = updateData;
    // const token = localStorage.getItem("access_token");
    const res = UserService.updateUser(id, token, rests);
    return res;
  });

  const { isPending, data } = mutationUpdate;

  const handleUpdateInfoUsers = () => {
    //console.log("stateUserDetails: ", stateUserDetails);
    const { username, phone, address, city } = stateUserDetails;
    if (username && phone && address && city) {
      mutationUpdate.mutate(
        {
          id: user?.id,
          token: user?.accessToken,
          ...stateUserDetails,
        },
        {
          onSuccess: (data) => {
            Swal.fire({
              icon: "success",
              title: data?.message || "Cập nhật thành công",
              text: "Thông tin người dùng đã được cập nhật!",
              confirmButtonText: "OK",
              confirmButtonColor: "#ff393b",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: true,
              allowOutsideClick: false,
            });
            dispatch(updateUser({ username, phone, address, city }));
            setOpenModalUpdateInfo(false);
          },
          onError: (error) => {
            Swal.fire({
              icon: "error",
              title: error.response?.data?.message || "Cập nhật thất bại",
              text: "Đã xảy ra lỗi khi cập nhật người dùng",
              confirmButtonColor: "#ff393b",
            });
          },
        }
      );
    }
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state) => state.order);
  const user = useSelector((state) => state.user);
  const [numProduct, setNumProduct] = useState(order?.orderItems?.amount);
  //console.log(numProduct);

  const [listChecked, setListChecked] = useState([]);

  const onChange = (e) => {
    setNumProduct(Number(e.target.value));
  };
  const onChangeCheck = (e) => {
    console.log(`checked: ${e.target.value}`);
    if (listChecked.includes(e.target.value)) {
      const newListChecked = listChecked.filter(
        (item) => item !== e.target.value
      );
      setListChecked(newListChecked);
    } else {
      setListChecked([...listChecked, e.target.value]);
    }
  };

  const onChangeCheckAll = (e) => {
    console.log(`checked all: ${e.target.checked}`);
    if (e.target.checked) {
      const newListChecked = [];
      order?.orderItems?.forEach((item) => {
        newListChecked.push(item?.product);
      });
      setListChecked(newListChecked);
    } else {
      setListChecked([]);
    }
  };

  //console.log("listChecked: ", listChecked);

  const handleChangeCount = (type, idPro) => {
    if (type === "increase") {
      dispatch(increaseAmount({ idPro }));
    } else {
      dispatch(decreaseAmount({ idPro }));
    }
  };

  const handleDeleteOrder = (idPro) => {
    dispatch(removeOrderProduct({ idPro }));
    Swal.fire({
      icon: "success",
      title: "Xóa sản phẩm thành công!",
      text: "Sản phẩm đã được xóa khỏi giỏ hàng.",
      confirmButtonText: "OK",
      confirmButtonColor: "#ff3939",
    });
  };

  const handleDeleteAllOrders = () => {
    if (listChecked?.length > 1) {
      dispatch(removeAllOrderProduct({ listChecked }));
      Swal.fire({
        icon: "success",
        title: "Xóa tất cả sản phẩm thành công!",
        text: "Sản phẩm đã được xóa khỏi giỏ hàng.",
        confirmButtonText: "OK",
        confirmButtonColor: "#ff3939",
      });
    }
  };

  useEffect(() => {
    dispatch(selectedOrder({ listChecked }));
  }, [listChecked]);

  useEffect(() => {
    if (openModalUpdateInfo) {
      setStateUserDetails({
        city: user?.city,
        username: user?.username,
        address: user?.address,
        phone: user?.phone,
      });
    }
  }, [openModalUpdateInfo]);

  useEffect(() => {
    updateForm.setFieldsValue(stateUserDetails);
  }, [updateForm, stateUserDetails]);

  const formatCurrency = (num) => {
    if (!num) return "0 vnđ";
    return num.toLocaleString("vi-VN") + " vnđ";
  };

  // Tính tổng
  const subtotal = order?.orderItemsSelected?.reduce((total, item) => {
    return total + item.price * item.amount;
  }, 0);

  const discountPrice = order?.orderItemsSelected?.reduce((total, item) => {
    const result = total + item.discount * item.amount;
    if (Number(result)) {
      return result;
    }
    return 0;
  }, 0);

  // Hàm tính phí vận chuyển
  const calculateShippingFee = (orderItems) => {
    // Nếu không có sản phẩm trong giỏ → không tính phí
    if (!Array.isArray(orderItems) || orderItems.length === 0) return 0;
    // Tổng số lượng sản phẩm (amount có thể là string hoặc undefined)
    const totalQuantity = orderItems.reduce((total, item) => {
      const quantity = parseInt(item.amount) || 0;
      return total + quantity;
    }, 0);
    // Nếu số lượng >= 5 → miễn phí giao hàng
    if (totalQuantity >= 5) {
      return 0;
    }
    // Ngược lại: tính phí cố định + phí theo sản phẩm
    const baseFee = 20000; // Phí giao hàng cơ bản
    const perItemFee = 5000; // Mỗi sản phẩm thêm phí 5k
    return baseFee + perItemFee * totalQuantity;
  };

  const shippingFee = calculateShippingFee(order?.orderItemsSelected);

  const totalPrice = subtotal - discountPrice + shippingFee;

  //const handleOpen = () => {};
  const handleClose = () => {
    setOpenModalUpdateInfo(false);
  };

  const handleAddCart = () => {
    if (!order?.orderItemsSelected?.length) {
      Swal.fire({
        icon: "error",
        title: "Đã có lỗi xảy ra",
        text: "Vui lòng chọn sản phẩm!",
      });
    } else if (
      !user?.username ||
      !user?.phone ||
      !user?.address ||
      !user?.city
    ) {
      setOpenModalUpdateInfo(true);
    } else {
      navigate("/payment");
    }
  };

  const handleChangeAddress = () => {
    setOpenModalUpdateInfo(true);
  };
  return (
    <>
      {order?.orderItems?.length === 0 ? (
        <EmptyCart />
      ) : (
        <Box display="flex" gap={3} p={3}>
          {/* Bảng giỏ hàng */}
          <TableContainer component={Paper} sx={{ flex: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      onChange={onChangeCheckAll}
                      checked={
                        listChecked?.length === order?.orderItems?.length
                      }
                    />
                  </TableCell>
                  <TableCell align="center">Ảnh sản phẩm</TableCell>
                  <TableCell align="center">Tên sản phẩm</TableCell>
                  <TableCell align="center">Đơn giá</TableCell>
                  <TableCell align="center">Số lượng</TableCell>
                  <TableCell align="center">Thành tiền</TableCell>
                  <TableCell align="center">
                    Xóa |{" "}
                    <DeleteIcon
                      className="cursor-pointer"
                      onClick={handleDeleteAllOrders}
                    />
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {order?.orderItems?.map((order) => {
                  //console.log("order map: ", order);
                  return (
                    <TableRow key={order._id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          onChange={onChangeCheck}
                          value={order?.product}
                          checked={listChecked.includes(order?.product)}
                        />
                      </TableCell>

                      {/* Ảnh sản phẩm */}
                      <TableCell align="center">
                        <img
                          src={order?.image}
                          alt={order?.name}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      </TableCell>

                      {/* Tên sản phẩm */}
                      <TableCell align="center">{order?.name}</TableCell>

                      {/* Giá */}
                      <TableCell align="center">
                        <div>
                          <span style={{ color: "red", fontWeight: 600 }}>
                            {convertPrice(formatCurrency(order?.price))}
                          </span>
                        </div>
                      </TableCell>

                      {/* Số lượng */}
                      <TableCell align="center">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <div className="border-[1px] border-solid border-[#ccc]">
                            <button
                              onClick={() =>
                                handleChangeCount("decrease", order?.product)
                              }
                              className="border-none m-[2px] bg-transparent"
                            >
                              <RemoveIcon
                                fontSize="medium"
                                className="text-black"
                              />
                            </button>
                          </div>
                          <InputNumber
                            onChange={onChange}
                            value={order?.amount}
                            className="w-[60px] border-none"
                            size="middle"
                            min={1}
                            max={10}
                          />
                          <div className="border-[1px] border-solid border-[#ccc]">
                            <button
                              onClick={() =>
                                handleChangeCount("increase", order?.product)
                              }
                              className="border-none m-[2px] bg-transparent"
                            >
                              <AddIcon
                                fontSize="medium"
                                className="text-black"
                              />
                            </button>
                          </div>
                        </div>
                      </TableCell>

                      {/* Thành tiền */}
                      <TableCell align="center" style={{ fontWeight: 600 }}>
                        {formatCurrency(order?.price * order?.amount)}
                      </TableCell>

                      {/* Xóa */}
                      <TableCell align="center">
                        <IconButton color="error">
                          <DeleteIcon
                            onClick={() => handleDeleteOrder(order?.product)}
                          />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <span>Tổng số sản phẩm: ({order?.orderItems?.length})</span>
          </TableContainer>

          {/* Tóm tắt đơn hàng */}
          <Paper sx={{ flex: 1, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tóm tắt đơn hàng
            </Typography>
            <Box gap={1} display="flex" mb={1}>
              <Typography>Địa chỉ giao hàng:</Typography>
              <Typography sx={{ fontWeight: "bold" }} variant="body1">
                {user?.address}, {user?.city}
              </Typography>
              <Typography
                onClick={handleChangeAddress}
                sx={{ color: "blue", cursor: "pointer" }}
                variant="body1"
              >
                Thay đổi
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Tạm tính</Typography>
              <Typography sx={{ fontWeight: "bold" }} variant="body1">
                {formatCurrency(subtotal)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Giảm giá</Typography>
              <Typography sx={{ fontWeight: "bold" }} variant="body1">
                {discountPrice + "%"}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Thuế</Typography>
              <Typography sx={{ fontWeight: "bold" }} variant="body1">
                0₫
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography>Phí giao hàng</Typography>
              <Typography sx={{ fontWeight: "bold" }} variant="body1">
                {formatCurrency(shippingFee)}
              </Typography>
            </Box>
            <Box
              sx={{ fontWeight: "bold" }}
              display="flex"
              justifyContent="space-between"
              mt={2}
              mb={2}
              fontWeight="bold"
            >
              <Typography>Tổng tiền</Typography>
              <Typography variant="h5" color="error">
                {formatCurrency(totalPrice)}
              </Typography>
            </Box>
            <Button
              onClick={handleAddCart}
              variant="contained"
              color="error"
              fullWidth
            >
              Mua hàng
            </Button>
          </Paper>

          <ModalComponent
            title="Cập nhật thông tin giao hàng"
            closable={{ "aria-label": "Custom Close Button" }}
            open={openModalUpdateInfo}
            onCancel={handleClose}
            footer={null}
          >
            <Loading isPending={isPending}>
              <Form
                form={updateForm}
                name="basic"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={onUpdateUser}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  label="Tên người dùng"
                  name="username"
                  rules={[{ required: true, message: "Nhập tên người dùng!" }]}
                >
                  <Input
                    name="username"
                    value={stateUserDetails.username}
                    onChange={handleOnChangeDetails}
                  />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: true, message: "Nhập số điện thoại" }]}
                >
                  <Input
                    name="phone"
                    value={stateUserDetails.phone}
                    onChange={handleOnChangeDetails}
                  />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[{ required: true, message: "Nhập địa chỉ!" }]}
                >
                  <Input
                    name="address"
                    value={stateUserDetails.address}
                    onChange={handleOnChangeDetails}
                  />
                </Form.Item>

                <Form.Item
                  label="Thành phố"
                  name="city"
                  rules={[{ required: true, message: "Nhập địa chỉ!" }]}
                >
                  <Input
                    name="city"
                    value={stateUserDetails.city}
                    onChange={handleOnChangeDetails}
                  />
                </Form.Item>
                <Form.Item wrapperCol={{ span: 24 }}>
                  <div className="flex justify-end">
                    <Button type="primary" onClick={handleUpdateInfoUsers}>
                      Cập nhật
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </Loading>
          </ModalComponent>
        </Box>
      )}
    </>
  );
};

export default CartPage;
