import AdminPage from "~/pages/admin/AdminPage";
import CartPage from "~/pages/CartPage";
import CartSuccess from "~/pages/CartSuccess";
import CategoryPage from "~/pages/CategoryPage";
import HomePage from "~/pages/HomePage";
import LoginPage from "~/pages/LoginPage";
import MyOrderPage from "~/pages/MyOrderPage";
import NotFoundPage from "~/pages/NotFoundPage";
import OrderDetailPage from "~/pages/OrderDetailPage";
import PaymentPage from "~/pages/PaymentPage";
import ProductDetail from "~/pages/ProductDetailPage";
import RegisterPage from "~/pages/RegisterPage";
import UserInfoPage from "~/pages/UserInfoPage";

export const routes = [
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
  },
  {
    path: "/register",
    page: RegisterPage,
    isShowHeader: true,
  },
  {
    path: "/login",
    page: LoginPage,
    isShowHeader: true,
  },
  {
    path: "/user-profile",
    page: UserInfoPage,
    isShowHeader: true,
  },
  {
    path: "/product/:type",
    page: CategoryPage,
    isShowHeader: true,
  },
  {
    path: "/product/:type/detail/:id",
    page: ProductDetail,
    isShowHeader: true,
  },
  {
    path: "product/detail/:id",
    page: ProductDetail,
    isShowHeader: true,
  },
  {
    path: "/cart",
    page: CartPage,
    isShowHeader: true,
  },
  {
    path: "/payment",
    page: PaymentPage,
    isShowHeader: true,
  },
  {
    path: "/my-orders",
    page: MyOrderPage,
    isShowHeader: true,
  },
  {
    path: "/order-detail/:id",
    page: OrderDetailPage,
    isShowHeader: true,
  },
  {
    path: "/cart-success/:orderId",
    page: CartSuccess,
    isShowHeader: true,
  },
  {
    path: "/system/admin",
    page: AdminPage,
    isPrivate: true,
    isShowHeader: false,
  },
  {
    path: "*",
    page: NotFoundPage,
  },
];
