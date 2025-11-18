import { Box, Grid, Pagination } from "@mui/material";
import React, { useEffect, useState } from "react";
import CardItem from "~/components/CardItem";
import Navbar from "~/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import * as ProductService from "~/services/ProductService";
import { Link, useLocation } from "react-router-dom";
import Loading from "~/components/Loading";
import { useSelector } from "react-redux";
import { useDebounce } from "~/hooks/useDebounce";

const CategoryPage = () => {
  const { state } = useLocation();
  const [product, setProduct] = useState([]);
  const [pending, setPending] = useState(false);
  const [paginate, setPaginate] = useState({
    page: 0,
    limit: 10,
    total: 1,
  });
  const searchProduct = useSelector((state) => state?.product?.search);
  const searchDebounce = useDebounce(searchProduct, 500);

  const fetchProductType = async (type, page, limit) => {
    setPending(true);
    const res = await ProductService.getTypeProduct(type, page, limit);
    if (res) {
      setPending(false);
      setProduct(res?.data);
      //console.log("res: ", res);
      setPaginate({
        ...paginate,
        total: Math.ceil(res?.total / paginate.limit),
      });
      // console.log(res?.total);
    } else {
      setPending(false);
    }
  };

  useEffect(() => {
    if (state) {
      console.log("state: ", state);

      fetchProductType(state, paginate.page, paginate.limit);
    }
  }, [state, paginate.page, paginate.limit]);

  const onChangePaginate = (current, pageSize) => {
    setPaginate({ ...paginate, page: current - 1, limit: pageSize });
    // console.log({ current, pageSize });
  };

  // console.log("Loading: ", pending);

  const fetchAllProductApi = async () => {
    const res = await ProductService.getAllProducts();
    return res.data;
  };

  const { isLoading, data: products } = useQuery({
    queryKey: ["products"],
    queryFn: fetchAllProductApi,
  });
  return (
    <Loading isPending={pending}>
      <Box className="bg-[#efefef]" sx={{ flexGrow: 1 }}>
        <div
          className="flex justify-around gap-4"
          spacing={2}
          style={{ padding: "0 120px", paddingTop: "10px" }}
        >
          {/* Sidebar trái */}
          <Grid item xs={12} md={3}>
            <div className="bg-white p-[10px] mt-5 rounded-md h-fit">
              <Navbar />
            </div>
          </Grid>

          {/* Phần danh sách sản phẩm + Pagination */}
          <Grid item xs={12} md={9}>
            <Box
              className="flex flex-col mt-5"
              sx={{ minHeight: "80vh" }} // đảm bảo chiếm gần hết chiều cao màn hình
            >
              {/* Lưới sản phẩm */}
              <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-2 gap-4 w-full">
                {(state ? product : products)
                  ?.filter((pro) => {
                    if (searchDebounce === "") {
                      return pro;
                    } else if (
                      pro?.name
                        ?.toLowerCase()
                        .includes(searchDebounce?.toLowerCase())
                    ) {
                      return pro;
                    }
                  })
                  ?.map((p) => (
                    <Link key={p._id} to={`/product/${p.type}/detail/${p._id}`}>
                      <CardItem
                        productName={p.name}
                        type={p.type}
                        price={p.price}
                        countInStock={p.countInStock}
                        description={p.description}
                        image={p.image}
                        rating={p.rating}
                        discount={p.discount}
                        selled={p.selled}
                      />
                    </Link>
                  ))}
              </div>

              {/* Pagination dưới cùng */}
              <Box className="flex justify-center mt-auto pt-5">
                <Pagination
                  page={paginate.page + 1}
                  count={paginate?.total} // tổng số trang
                  onChange={(e, value) =>
                    setPaginate({ ...paginate, page: value - 1 })
                  }
                  color="primary"
                />
              </Box>
            </Box>
          </Grid>
        </div>
      </Box>
    </Loading>
  );
};

export default CategoryPage;
