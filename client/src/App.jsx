import { Routes, Route } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { routes } from "./routes";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import * as UserService from "~/services/UserService";
import { updateUser } from "./store/userSlice";
import MainLayout from "./layout/MainLayout";
import Loading from "./components/Loading";
import { clearOrder } from "./store/orderSlice";
function App() {
  const fetchApi = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL_BACKEND}/product/all`
    );
    return res.data.data;
  };
  const [isPending, setIsPending] = useState("false");
  const query = useQuery({ queryKey: ["todos"], queryFn: fetchApi });
  //console.log("Query result: ", query.data);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  useEffect(() => {
    const init = async () => {
      setIsPending(true);
      const { decoded, storageData } = handleDecoded();
      //console.log("Access token exp:", decoded?.exp, "Now:", Date.now() / 1000);
      if (decoded?.userId) {
        await handleGetDetailUser(decoded.userId, storageData);
      }
      setIsPending(false);
    };

    init();
  }, []);

  const handleDecoded = () => {
    let storageData = localStorage.getItem("access_token");
    let decoded = {};
    if (storageData) {
      decoded = jwtDecode(storageData);
    }
    return { decoded, storageData };
  };

  UserService.axiosJWT.interceptors.request.use(
    async (config) => {
      const currTime = new Date();
      const { decoded } = handleDecoded();
      if (decoded?.exp < currTime.getTime() / 1000) {
        const data = await UserService.refreshUserToken();
        // console.log(">>Check data: ", data);

        config.headers["token"] = `Bearer ${data.accessToken}`;
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  const handleGetDetailUser = async (userId, token) => {
    const res = await UserService.getDetailUser(userId, token);
    dispatch(updateUser({ ...res?.data, accessToken: token }));
  };

  // Auto logout sau khi token hết hạn
  useEffect(() => {
    const { decoded } = handleDecoded();

    if (decoded?.exp) {
      const expiry = decoded.exp * 1000; // ms
      const now = Date.now();
      const timeout = expiry - now;

      if (timeout > 0) {
        const timer = setTimeout(() => {
          localStorage.removeItem("access_token");
          dispatch(updateUser(null)); // clear redux
          dispatch(clearOrder()); // clear redux
          alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        }, timeout);

        return () => clearTimeout(timer);
      } else {
        // Token đã hết hạn từ trước
        localStorage.removeItem("access_token");
        dispatch(updateUser(null));
        dispatch(clearOrder());
      }
    }
  }, [dispatch]);
  return (
    <>
      <Loading isPending={isPending}>
        <Routes>
          {routes.map((route, index) => {
            const Page = route.page;
            const Layout = route.isShowHeader ? MainLayout : React.Fragment;
            const isCheckAuth = !route.isPrivate || user.isAdmin;

            // Bỏ qua route không được phép truy cập
            if (!isCheckAuth) return null;

            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}

          {/* Fallback route khi không khớp đường dẫn nào */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Loading>
    </>
  );
}

export default App;
