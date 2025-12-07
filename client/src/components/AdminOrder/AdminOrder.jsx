// AdminOrder.jsx
import React, { useEffect, useRef, useState } from "react";
import TableComponent from "../AdminUser/components/TableComponent";
import Drawer from "../Drawer/Drawer";
import ModalComponent from "../Modal/ModalComponent";
import Loading from "../Loading";
import Swal from "sweetalert2";
import { Button, Form, Input, Space } from "antd";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as OrderService from "~/services/OrderService";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@mui/icons-material";

const AdminOrder = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state) => state?.user);

  const [rowSelected, setRowSelected] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isPendingUpdate, setIsPendingUpdate] = useState(false);

  const [stateOrderDetails, setStateOrderDetails] = useState({
    username: "",
    address: "",
    phone: "",
    itemsPrice: 0,
    totalPrice: 0,
    paymentMethod: "",
    isPaid: false,
    paidAt: "",
    orderItems: [],
  });

  /* =====================
        FETCH ORDERS
     ===================== */
  const getAllOrders = async () => {
    const token = user?.accessToken;
    return await OrderService.getAllOrders(token);
  };

  const queryOrder = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await getAllOrders();
      console.log("Kết quả getAllOrders:", res);
      return res;
    },
  });

  const { data: ordersData, isPending: isPendingOrders } = queryOrder;

  /* =====================
        FETCH ORDER DETAIL
     ===================== */
  const fetchOrderDetail = async (orderId) => {
    console.log(">>> START FETCH ORDER DETAIL FOR ID:", orderId);
    const res = await OrderService.getOrderDetail(user?.accessToken, orderId);
    console.log(">>fetchOrderDetail: ", res?.data);

    if (res?.data) {
      setStateOrderDetails({
        username: res?.data?.shippingAddress?.fullName,
        phone: res?.data?.shippingAddress?.phone,
        address: res?.data?.shippingAddress?.address,
        itemsPrice: res?.data?.itemsPrice,
        totalPrice: res?.data?.totalPrice,
        paymentMethod: res?.data?.paymentMethod,
        isPaid: res?.data?.isPaid,
        paidAt: res?.data?.paidAt,
        orderItems: res?.data?.orderItems,
      });
    }
    setIsPendingUpdate(false);
  };

  useEffect(() => {
    if (rowSelected) fetchOrderDetail(rowSelected);
  }, [rowSelected]);

  /* =====================
          DELETE ORDER
     ===================== */
  const mutationDelete = useMutationHook(({ id, token }) =>
    OrderService.deleteOrder(id, token)
  );

  const mutationDeleteMany = useMutationHook(({ token, ...ids }) =>
    OrderService.deleteManyOrders(token, ids)
  );

  const onDeleteOrder = (orderId) => {
    Swal.fire({
      title: "Bạn có chắc muốn xóa đơn hàng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        mutationDelete.mutate(
          {
            id: orderId,
            token: user?.accessToken,
          },
          {
            onSuccess: (data) => {
              Swal.fire("Đã xóa!", data?.message, "success");
              queryOrder.refetch();
            },
            onError: () => {
              Swal.fire("Lỗi!", "Không thể xoá đơn hàng!", "error");
            },
          }
        );
      }
    });
  };

  const onDeleteManyOrders = (ids) => {
    mutationDeleteMany.mutate(
      {
        ids,
        token: user?.accessToken,
      },
      {
        onSuccess: (data) => {
          Swal.fire("Đã xóa!", data?.message, "success");
          queryOrder.refetch();
        },
        onError: () => Swal.fire("Lỗi!", "Không thể xoá!", "error"),
      }
    );
  };

  /* =====================
        TABLE COLUMNS
     ===================== */
  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.username.length - b.username.length,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      render: (val) => val.toLocaleString() + "đ",
      sorter: (a, b) => a.totalPrice - b.totalPrice,
    },
    {
      title: "Thanh toán",
      dataIndex: "isPaid",
      filters: [
        { text: "Đã thanh toán", value: true },
        { text: "Chưa thanh toán", value: false },
      ],
      render: (paid) => (paid ? "Đã thanh toán" : "Chưa trả"),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
    },
    {
      title: "Tác vụ",
      dataIndex: "action",
      render: (_, record) => (
        <div>
          <DeleteOutlined
            className="text-3xl text-red-500 cursor-pointer mr-3"
            onClick={() => onDeleteOrder(record._id)}
          />
          <EditOutlined
            className="text-3xl text-blue-500 cursor-pointer"
            onClick={() => {
              console.log(">>> CLICK SHOW DETAIL ORDER WITH ID:", record._id);
              setIsPendingUpdate(true);
              setRowSelected(record._id);
              setIsOpenDrawer(true);
            }}
          />
        </div>
      ),
    },
  ];

  const dataTable = Array.isArray(ordersData?.data)
    ? ordersData.data.map((order) => ({
        ...order,
        username: order?.shippingAddress?.fullName,
        phone: order?.shippingAddress?.phone,
        key: order._id,
      }))
    : [];

  return (
    <header>
      <h1 className="text-black text-[14px]">Quản lý đơn hàng</h1>

      <div className="mt-4">
        <TableComponent
          handleDeleteMany={onDeleteManyOrders}
          columns={columns}
          isPending={isPendingOrders}
          data={dataTable}
          onRow={(record) => ({
            onClick: () => setRowSelected(record._id),
          })}
        />
      </div>

      {/* Drawer Chi tiết đơn hàng */}
      <Drawer
        title="Thông tin đơn hàng"
        placement="right"
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
      >
        <Loading isPending={isPendingUpdate}>
          <div className="p-3">
            <p>
              <strong>Tên khách hàng:</strong> {stateOrderDetails.username}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {stateOrderDetails.phone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {stateOrderDetails.address}
            </p>
            <p>
              <strong>Phương thức thanh toán:</strong>{" "}
              {stateOrderDetails.paymentMethod}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {stateOrderDetails.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
            </p>
            <p>
              <strong>Tổng tiền:</strong>{" "}
              {stateOrderDetails.totalPrice?.toLocaleString()}đ
            </p>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Sản phẩm:</h3>
              {stateOrderDetails?.orderItems?.map((item, index) => (
                <div
                  key={index}
                  className="border p-2 rounded mb-2 flex items-center gap-3"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-[60px] h-[60px] object-cover rounded"
                  />
                  <div>
                    <p>{item.name}</p>
                    <p>
                      {item.amount} × {item.price.toLocaleString()}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Loading>
      </Drawer>
    </header>
  );
};

export default AdminOrder;
