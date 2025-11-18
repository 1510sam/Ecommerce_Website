import React, { useEffect, useRef, useState } from "react";

import Sliders from "~/components/Sliders";
import slider1 from "../assets/slider4.jpg";
import slider2 from "../assets/slider2.jpg";
import slider3 from "../assets/slider3.jpg";
import CardItem from "~/components/CardItem";
import { Box, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as ProductService from "~/services/ProductService";
import { resetUser } from "~/store/userSlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "~/components/Loading";
import { useDebounce } from "~/hooks/useDebounce";
import Category from "~/components/Category";

const HomePage = () => {
  const DEFAULT_LIMIT = 10;
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [pending, setPending] = useState(false);
  const [typeProducts, setTypeProducts] = useState([]);
  //const user = useSelector((state) => state?.user);
  const searchProduct = useSelector((state) => state?.product?.search);
  //const refSearch = useRef();

  const searchDebounce = useDebounce(searchProduct, 500);
  // console.log("Product state: ", product);

  const fetchAllProductApi = async ({ queryKey }) => {
    const [_key, limit, search] = queryKey;
    const res = await ProductService.getAllProducts(search, limit);
    return res;
  };

  const { isPending, data: products } = useQuery({
    queryKey: ["products", limit, searchDebounce],
    queryFn: fetchAllProductApi,
    retry: 3,
    retryDelay: 1000,
    keepPreviousData: true,
  });

  //console.log(">>Fetch all products: ", products);

  const fetchAllTypeProduct = async () => {
    const res = await ProductService.getAllTypeProduct();
    setTypeProducts(res?.productData);
    // return res;
  };

  useEffect(() => {
    fetchAllTypeProduct();
  }, []);

  const handleToggleProducts = () => {
    if (products?.data?.length < products?.total) {
      // Chưa load hết thì load thêm
      setLimit((prev) => prev + DEFAULT_LIMIT);
    } else {
      // Đã load hết thì reset về mặc định
      setLimit(DEFAULT_LIMIT);
    }
  };

  // console.log("isPreviousData: ", products);
  const isAllLoaded = products?.data?.length === products?.total;

  // useEffect(() => {
  //   let timer;
  //   if (user) {
  //     timer = setTimeout(() => {
  //       dispatch(resetUser());
  //       navigate("/login");
  //     }, 3600000);
  //   }
  //   return () => clearTimeout(timer);
  // });

  return (
    <Loading isPending={isPending || pending}>
      <Box
        sx={{
          backgroundColor: "#fff",
          borderTop: "1px solid #e0e0e0",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Box className="container mx-auto flex flex-wrap items-center justify-start px-4 py-2 gap-6 overflow-x-auto whitespace-nowrap">
          {typeProducts?.map((cat, index) => {
            return <Category name={cat} key={index} />;
          })}
        </Box>
      </Box>
      <div className="bg-[#efefef]" style={{ padding: "0 120px" }}>
        <Sliders arrImgs={[slider1, slider2, slider3]} />
        <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {products?.data?.map((product) => {
            return (
              <CardItem
                key={product._id}
                productName={product.name}
                type={product.type}
                price={product.price}
                countInStock={product.countInStock}
                description={product.description}
                image={product.image}
                rating={product.rating}
                discount={product.discount}
                selled={product.selled}
                id={product._id}
              />
            );
          })}
        </div>
        {/* <Navbar /> */}
        <div className="w-full flex justify-center mt-5">
          <Button
            className="w-60 h-[38px] hover:text-white font-medium hover:bg-[rgb(13,92,182)] rounded"
            variant="outlined"
            onClick={handleToggleProducts}
          >
            {isAllLoaded ? "Thu gọn" : "Xem thêm"}
          </Button>
        </div>
      </div>
    </Loading>
  );
};

export default HomePage;
