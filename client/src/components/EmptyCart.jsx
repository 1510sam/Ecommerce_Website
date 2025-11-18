import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useNavigate } from "react-router-dom";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <Box
      className="flex flex-col items-center justify-center text-center p-6"
      sx={{
        height: "80vh",
        backgroundColor: "#fff",
      }}
    >
      <Box
        className="flex items-center justify-center rounded-full mb-4 shadow-md"
        sx={{
          width: 120,
          height: 120,
          backgroundColor: "#f9f9f9",
        }}
      >
        <ShoppingCartOutlinedIcon sx={{ fontSize: 60, color: "#ff3939" }} />
      </Box>

      <Typography variant="h5" fontWeight={600} mb={1}>
        Giỏ hàng của bạn đang trống
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        mb={3}
        className="max-w-md"
      >
        Hãy thêm những sản phẩm yêu thích vào giỏ để bắt đầu mua sắm nhé!
      </Typography>

      <Button
        variant="contained"
        color="error"
        sx={{ borderRadius: "8px", px: 4, py: 1.5 }}
        onClick={() => navigate("/")}
      >
        Tiếp tục mua sắm
      </Button>
    </Box>
  );
};

export default EmptyCart;
