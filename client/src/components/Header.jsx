import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Badge,
  useMediaQuery,
  Stack,
  Link as MuiLink,
  Drawer,
} from "@mui/material";
import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTheme } from "@mui/material/styles";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Popover } from "antd";
import * as UserService from "~/services/UserService";
import { resetUser } from "~/store/userSlice";
import Loading from "./Loading";
import Swal from "sweetalert2";
import { searchProduct } from "~/store/productSlice";
import { clearOrder } from "~/store/orderSlice";

const Header = ({ isHiddenSearch = false, isHiddenCart = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const order = useSelector((state) => state.order);
  // console.log("order: ", order);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await UserService.logoutUserToken();
      localStorage.removeItem("access_token");
      dispatch(resetUser());
      dispatch(clearOrder());
      Swal.fire({
        title: "Đăng xuất thành công!",
        text: "Bạn đã đăng xuất khỏi hệ thống.",
        icon: "success",
        timer: 2000,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("Logout error:", error);
      Swal.fire({
        title: "Đăng xuất thất bại!",
        text: "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.",
        icon: "error",
        timer: 2000,
        confirmButtonText: "Thử lại",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div>
      <p
        onClick={handleLogout}
        className="cursor-pointer hover:text-[rgb(26,148,255)]"
      >
        Đăng xuất
      </p>
      <p
        onClick={() => handleClickNavigate("user-profile")}
        className="cursor-pointer hover:text-[rgb(26,148,255)]"
      >
        Thông tin người dùng
      </p>
      <p
        onClick={() => handleClickNavigate("my-orders")}
        className="cursor-pointer hover:text-[rgb(26,148,255)]"
      >
        Đơn hàng của tôi
      </p>
      {user?.isAdmin && (
        <p
          onClick={() => handleClickNavigate("admin")}
          className="cursor-pointer hover:text-[rgb(26,148,255)]"
        >
          Quản trị hệ thống
        </p>
      )}
    </div>
  );

  const handleClickNavigate = (type) => {
    if (type === "user-profile") {
      navigate("/user-profile");
    } else if (type === "admin") {
      navigate("/system/admin");
    } else if (type === "my-orders") {
      navigate("/my-orders", {
        state: {
          id: user?.id,
          token: user?.accessToken,
        },
      });
    }
  };

  const onSearch = (e) => {
    setSearch(e.target.value);
    dispatch(searchProduct(e.target.value));
  };

  return (
    <header>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#FDD835",
          borderRadius: "none",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar
          className={`${isMobile ? "px-3 py-2" : "px-4 py-2"}`}
          sx={{ minHeight: isMobile ? "80px" : "64px" }}
        >
          <Box className="container flex w-full items-center justify-between">
            {/* Mobile Layout */}
            {isMobile ? (
              <Box className="w-full">
                {/* Top row: Logo và Login */}
                <Box className="flex w-full items-center justify-between mb-3">
                  {/* Logo + Location */}
                  <Box className="flex items-center gap-2">
                    <Box
                      component={Link}
                      to="/"
                      className="flex items-center"
                      sx={{ textDecoration: "none" }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 1,
                          boxShadow: "0 2px 6px rgba(102, 126, 234, 0.3)",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          ET
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Login button */}
                  <Loading isPending={loading}>
                    <Box className="flex items-center gap-2">
                      {user?.accessToken ? (
                        <Popover
                          className="cursor-pointer"
                          content={content}
                          trigger="click"
                        >
                          <Box className="flex items-center gap-1">
                            <PersonOutlineIcon
                              sx={{ color: "#000", fontSize: 20 }}
                            />
                            <Typography
                              sx={{ color: "#000", fontSize: "12px" }}
                            >
                              {user.username || user.email}
                            </Typography>
                          </Box>
                        </Popover>
                      ) : (
                        <MuiLink
                          component={Link}
                          to="/login"
                          className="flex items-center gap-1"
                          sx={{
                            color: "#000",
                            textDecoration: "none",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          <PersonOutlineIcon
                            sx={{ color: "#000", fontSize: 20 }}
                          />
                          <Typography sx={{ color: "#000", fontSize: "12px" }}>
                            Đăng nhập
                          </Typography>
                        </MuiLink>
                      )}
                    </Box>
                  </Loading>
                </Box>

                {/* Bottom row: Search bar with Menu and Cart integrated */}
                <Box className="w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <Box className="flex items-center">
                    {/* Menu button - dính vào góc trái */}
                    <Box
                      onClick={() => setDrawerOpen(true)}
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 10px",
                        borderRight: "1px solid #e0e0e0",
                        minWidth: "50px",
                      }}
                    >
                      <MenuIcon sx={{ color: "#666", fontSize: 16 }} />
                      <Typography
                        sx={{
                          color: "#666",
                          fontSize: "8px",
                          mt: 0.25,
                          lineHeight: 1,
                        }}
                      >
                        MENU
                      </Typography>
                    </Box>

                    {/* Search component */}
                    <Box className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <div className="flex w-full max-w-xl h-10">
                        {/* Input */}
                        <Input
                          placeholder="Search in Lazada"
                          className="flex-1 px-4 text-sm rounded-l-md bg-gray-100 border-none shadow-none focus:outline-none h-full"
                          onChange={onSearch}
                        />
                        {/* Button */}
                        <Button
                          type="primary"
                          onClick={() => console.log("Search clicked")}
                          className="bg-orange-500 hover:bg-orange-600 border-none rounded-r-md !p-0 w-12 h-full flex items-center justify-center"
                        >
                          <SearchOutlined className="text-white text-lg" />
                        </Button>
                      </div>
                    </Box>

                    {/* Cart button - dính vào góc phải */}
                    <Box
                      sx={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 10px",
                        borderLeft: "1px solid #e0e0e0",
                        minWidth: "50px",
                      }}
                    >
                      <Badge
                        badgeContent={order?.orderItems?.length}
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: "#FF424E",
                            color: "#fff",
                            fontSize: "9px",
                            minWidth: "14px",
                            height: "14px",
                            top: "-4px",
                            right: "-4px",
                          },
                        }}
                      >
                        <ShoppingCartOutlinedIcon
                          sx={{ color: "#666", fontSize: 18 }}
                        />
                      </Badge>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              /* Desktop Layout */
              <>
                {/* Logo */}
                <Box className="flex items-center mr-4">
                  <Box
                    component={Link}
                    to="/"
                    className="flex items-center"
                    sx={{ textDecoration: "none" }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1.5,
                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        ET
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 22,
                        fontWeight: "bold",
                        color: "#000",
                        fontFamily: '"Segoe UI", Roboto, sans-serif',
                        letterSpacing: "-0.5px",
                      }}
                    >
                      ElectroTech
                    </Typography>
                  </Box>
                </Box>

                {/* Search bar */}
                {!isHiddenSearch && (
                  <Box className="flex-1 max-w-[600px] mx-4">
                    <Box className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <div className="flex w-full max-w-xl h-10">
                        {/* Input */}
                        <Input
                          placeholder="Search in Lazada"
                          className="flex-1 px-4 text-sm rounded-l-md bg-gray-100 border-none shadow-none focus:outline-none h-full"
                          onChange={onSearch}
                        />
                        {/* Button */}
                        <Button
                          type="primary"
                          onClick={() => console.log("Search clicked")}
                          className="bg-orange-500 hover:bg-orange-600 border-none rounded-r-md !p-0 w-12 h-full flex items-center justify-center"
                        >
                          <SearchOutlined className="text-white text-lg" />
                        </Button>
                      </div>
                    </Box>
                  </Box>
                )}

                {/* Right side items */}
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* Login/User info */}
                  <Loading isPending={loading}>
                    <Box className="flex items-center gap-2">
                      <PersonOutlineIcon sx={{ color: "#000", fontSize: 24 }} />
                      {user?.accessToken ? (
                        <Popover
                          className="cursor-pointer"
                          content={content}
                          trigger="click"
                        >
                          <Box>
                            {user?.avatar ? (
                              <img
                                className="h-[32px] w-[32px] rounded-full object-cover"
                                src={user?.avatar}
                                alt="User avatar"
                              />
                            ) : (
                              <Typography
                                sx={{
                                  color: "#000",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                }}
                              >
                                {user.username || user.email}
                              </Typography>
                            )}
                          </Box>
                        </Popover>
                      ) : (
                        <Link
                          to="/login"
                          sx={{
                            color: "#000",
                            fontSize: "14px",
                            fontWeight: "500",
                            "&:hover": {
                              textDecoration: "none",
                            },
                          }}
                        >
                          Đăng nhập
                        </Link>
                      )}
                    </Box>
                  </Loading>

                  {/* Cart */}
                  {!isHiddenCart && (
                    <Box className="flex items-center">
                      <Badge
                        badgeContent={order?.orderItems?.length}
                        showZero
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: "#FF424E",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "bold",
                            minWidth: "18px",
                            height: "18px",
                            borderRadius: "50%",
                          },
                        }}
                      >
                        <ShoppingCartOutlinedIcon
                          sx={{ color: "#000", fontSize: 28 }}
                        />
                      </Badge>
                      <Link to="/cart">
                        <Typography
                          sx={{
                            color: "#000",
                            fontSize: "14px",
                            ml: 1,
                            fontWeight: "500",
                          }}
                        >
                          Giỏ hàng
                        </Typography>
                      </Link>
                    </Box>
                  )}
                </Stack>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box width={280} p={3}>
          {/* User section */}
          <Loading isPending={loading}>
            <Box className="mb-4 pb-4 border-b border-gray-200">
              {user?.accessToken ? (
                <Box className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img
                      className="h-[40px] w-[40px] rounded-full object-cover"
                      src={user?.avatar}
                      alt="User avatar"
                    />
                  ) : (
                    <PersonOutlineIcon fontSize="large" />
                  )}
                  <Box>
                    <Typography variant="body1" fontWeight="500">
                      {user.username || user.email}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate("/user-profile")}
                    >
                      Xem thông tin
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box className="flex items-center gap-2">
                  <PersonOutlineIcon fontSize="large" />
                  <MuiLink
                    component={Link}
                    to="/login"
                    sx={{
                      color: "#1976d2",
                      textDecoration: "none",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    Đăng nhập
                  </MuiLink>
                </Box>
              )}
            </Box>
          </Loading>

          {/* Cart section */}
          <Box className="flex items-center gap-3 mb-4">
            <Badge
              badgeContent={order?.orderItems?.length}
              showZero
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#FF424E",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "50%",
                },
              }}
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 28 }} />
            </Badge>
            <Typography variant="body1" fontWeight="500">
              Giỏ hàng
            </Typography>
          </Box>

          {/* Logout button */}
          {user?.accessToken && (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Đăng xuất
            </Button>
          )}
        </Box>
      </Drawer>
    </header>
  );
};

export default Header;
