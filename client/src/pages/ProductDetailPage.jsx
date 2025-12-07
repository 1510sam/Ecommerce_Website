import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductDetailItem from "~/components/ProductDetailItem";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div
      style={{
        padding: "20px 120px",
        background: "#efefef",
        height: "100%",
      }}
    >
      <h5>
        <span
          className="cursor-pointer font-bold"
          onClick={() => navigate("/")}
        >
          Trang chủ
        </span>
        - Chi tiết sản phẩm
      </h5>
      {/* Chi tiết sp */}
      <ProductDetailItem idProduct={id} />
    </div>
  );
};

export default ProductDetailPage;
