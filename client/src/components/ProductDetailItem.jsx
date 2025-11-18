import { Col, Image, InputNumber, Row } from "antd";
import * as ProductService from "~/services/ProductService";
import React, { useEffect, useState } from "react";
import StarRateIcon from "@mui/icons-material/StarRate";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Loading from "./Loading";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { addOrderProduct, resetOrder } from "~/store/orderSlice";
import Swal from "sweetalert2";
import { convertPrice } from "~/util";
const ProductDetailItem = ({ idProduct }) => {
  const [numProduct, setNumProduct] = useState(1);
  const [errorLimitOrder, setErrorLimitOrder] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const order = useSelector((state) => state.order);
  const dispatch = useDispatch();

  const handleChangeCount = (type) => {
    if (type === "increase") {
      setNumProduct((prev) => prev + 1);
    } else if (type === "decrease" && numProduct > 1) {
      setNumProduct((prev) => prev - 1);
    }
  };

  const onChange = (e) => {
    setNumProduct(Number(e.target.value));
  };

  // Lấy thông tin sp chi tiết
  const fetchGetDetailsProduct = async (context) => {
    // Lấy id từ queryKey của React Query
    const id = context?.queryKey && context?.queryKey[1];
    console.log("id", id);
    if (id) {
      // Gọi API lấy chi tiết sản phẩm theo id
      const res = await ProductService.getProductById(id);
      return res;
    }
    return null;
  };

  const { isPending, data: productDetails } = useQuery({
    queryKey: ["product-details", idProduct],
    queryFn: ({ queryKey }) => fetchGetDetailsProduct({ queryKey }),
    enabled: !!idProduct,
  });

  console.log("productDetails (log trong render): ", productDetails);

  const renderStars = (rating) => {
    return Array.from({ length: rating || 0 }).map((index) => (
      <StarRateIcon
        key={index}
        className="text-[12px] text-[rgb(253,216,54)]"
      />
    ));
  };

  useEffect(() => {
    const orderRedux = order?.orderItems?.find(
      (item) => item.product === productDetails?.productData?._id
    );

    // ⚠️ Nếu chưa có trong giỏ → không lỗi, và cũng không giới hạn
    if (!orderRedux) {
      setErrorLimitOrder(false);
      return;
    }

    if (orderRedux.amount + numProduct <= orderRedux.countInStock) {
      setErrorLimitOrder(false);
    } else {
      setErrorLimitOrder(true);
    }
  }, [numProduct, order?.orderItems, productDetails]);

  useEffect(() => {
    if (order?.isSuccessOrder) {
      Swal.fire({
        icon: "success",
        title: "Thêm vào giỏ hàng thành công!",
        text: `${productDetails?.productData?.name} đã được thêm vào giỏ hàng`,
        confirmButtonText: "OK",
        confirmButtonColor: "#ff3939",
      });

      dispatch(resetOrder());
    }
  }, [order?.isSuccessOrder]);

  const handleAddCart = () => {
    if (!user?.id) {
      navigate("/login", { state: location?.pathname });
      return;
    }

    const orderRedux = order?.orderItems?.find(
      (item) => item.product === productDetails?.productData?._id
    );

    const currentStock = productDetails?.productData?.countInStock || 0;

    // ❗ Nếu sản phẩm chưa có trong giỏ → thêm thẳng, KHÔNG check amount
    if (!orderRedux) {
      if (numProduct <= currentStock) {
        dispatch(
          addOrderProduct({
            orderItem: {
              name: productDetails?.productData?.name,
              amount: numProduct,
              image: productDetails?.productData?.image,
              price: productDetails?.productData?.price,
              product: productDetails?.productData?._id,
              discount: productDetails?.productData?.discount,
              countInStock: currentStock,
            },
          })
        );
        setErrorLimitOrder(false);
      } else {
        setErrorLimitOrder(true);
      }
      return;
    }

    // ❗ Nếu sản phẩm ĐÃ có trong giỏ → cộng thêm vào amount cũ
    const newAmount = orderRedux.amount + numProduct;

    if (newAmount <= currentStock) {
      dispatch(
        addOrderProduct({
          orderItem: {
            name: productDetails?.productData?.name,
            amount: numProduct,
            image: productDetails?.productData?.image,
            price: productDetails?.productData?.price,
            product: productDetails?.productData?._id,
            discount: productDetails?.productData?.discount,
            countInStock: currentStock,
          },
        })
      );
      setErrorLimitOrder(false);
    } else {
      setErrorLimitOrder(true);
    }
  };

  return (
    <Loading isPending={isPending}>
      <Row className="p-4 bg-white rounded">
        {/* Ảnh sản phẩm */}
        <Col span={10}>
          <Image src={productDetails?.productData?.image} alt="img-product" />
          <Row className="pt-[10px]">
            <Col className="mr-[6px]" span={4}>
              <Image
                width={80}
                height={80}
                src={productDetails?.productData?.image}
                alt="img-small"
              />
            </Col>
            <Col className="mr-[6px]" span={4}>
              <Image
                width={80}
                height={80}
                src={productDetails?.productData?.image}
                alt="img-small"
              />
            </Col>
            <Col className="mr-[6px]" span={4}>
              <Image
                width={80}
                height={80}
                src={productDetails?.productData?.image}
                alt="img-small"
              />
            </Col>
            <Col className="mr-[6px]" span={4}>
              <Image
                width={80}
                height={80}
                src={productDetails?.productData?.image}
                alt="img-small"
              />
            </Col>
          </Row>
        </Col>

        {/* Mô tả sản phẩm */}
        <Col span={14}>
          <div className="text-[rgb(36,36,36)] text-2xl/8 font-light break-normal">
            {productDetails?.productData?.name}
          </div>
          <div className="flex items-center">
            {renderStars(productDetails?.productData?.rating)}
            <span className="text-sm/6 text-[rgb(120,120,120)]">
              {" "}
              (Xem 3 đánh giá) | Đã bán 34
            </span>
          </div>
          <div className="bg-[rgb(250,250,250)] rounded">
            <h1 className="text-4xl p-[10px] mt-[10px] font-medium mr-2">
              {convertPrice(productDetails?.productData?.price)}
              <span className="underline underline-offset-4">đ</span>
            </h1>
          </div>

          <div className="mt-2">
            <span>Giao đến </span>
            <span className="underline underline-offset-4 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.address}
            </span>
            <span> - </span>
            <span className="text-[rgb(11,116,229)] text-base font-medium">
              Địa chỉ
            </span>
          </div>

          <div
            style={{
              margin: "10px 0 20px",
              padding: "10px 0",
              borderTop: "1px solid #e5e5e5",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <div className="mb-2">Số lượng</div>
            <div className="flex gap-1 items-center rounded-[4px] border-[1px] border-solid border-red w-[100px]">
              <div className="border-[1px] border-solid border-[#ccc]">
                <button
                  onClick={() => handleChangeCount("decrease")}
                  className="border-none m-[2px] bg-transparent"
                >
                  <RemoveIcon fontSize="medium" className="text-black" />
                </button>
              </div>
              <InputNumber
                onChange={onChange}
                value={numProduct}
                className="w-[60px] border-none"
                size="middle"
                min={1}
                max={productDetails?.productData?.countInStock}
              />
              <div className="border-[1px] border-solid border-[#ccc]">
                <button
                  onClick={() => handleChangeCount("increase")}
                  className="border-none m-[2px] bg-transparent"
                >
                  <AddIcon fontSize="medium" className="text-black" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex justify-around gap-3">
              <Button
                size="large"
                className="h-12 w-[220px] border-none rounded !text-white font-bold !bg-[rgb(255,57,59)]"
                onClick={handleAddCart}
              >
                Thêm vào giỏ hàng
              </Button>
              {errorLimitOrder && (
                <div className="text-red-500">Sản phẩm đã hết hàng</div>
              )}
              <Button
                sx={{ border: "1px solid rgb(13,92,182)" }}
                size="large"
                className="h-12 w-[220px] rounded !text-[rgb(13,92,182)] !bg-white"
              >
                Mua trả sau
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Loading>
  );
};

export default ProductDetailItem;
