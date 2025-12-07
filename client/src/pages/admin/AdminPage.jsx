import {
  ProductOutlined,
  UserOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import React, { useState } from "react";
import AdminOrder from "~/components/AdminOrder/AdminOrder";
import AdminProduct from "~/components/AdminProduct/AdminProduct";
import AdminUser from "~/components/AdminUser/AdminUser";
import Header from "~/components/Header";

const items = [
  {
    key: "user",
    icon: <UserOutlined />,
    label: "Người dùng",
  },
  {
    key: "product",
    icon: <ProductOutlined />,
    label: "Sản phẩm",
  },
  {
    key: "order",
    icon: <OrderedListOutlined />,
    label: "Đơn hàng",
  },
];

const AdminPage = () => {
  const [keySelected, setKeySelected] = useState("");

  const renderPage = (key) => {
    switch (key) {
      case "user":
        return <AdminUser />;
      case "product":
        return <AdminProduct />;
      case "order":
        return <AdminOrder />;
      default:
        return <></>;
    }
  };

  const handleOnClick = ({ key }) => {
    setKeySelected(key);
  };

  return (
    <>
      <Header isHiddenSearch isHiddenCart />
      <div className="pt-[80px] md:pt-[64px] flex">
        {/* Thanh Menu cố định bên trái */}
        <Menu
          mode="inline"
          onClick={handleOnClick}
          style={{
            width: 256,
            height: "100vh",
            position: "fixed",
            left: 0,
            top: "64px", // đẩy xuống dưới header
            boxShadow: "1px 1px 2px #ccc",
          }}
          items={items}
        />
        {/* Nội dung dịch sang phải tránh bị menu che */}
        <div className="flex-1 p-[15px]" style={{ marginLeft: 256 }}>
          {renderPage(keySelected)}
        </div>
      </div>
    </>
  );
};

export default AdminPage;
