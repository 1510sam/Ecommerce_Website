import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";
import { convertPrice } from "~/util";

const CardItem = (props) => {
  const {
    productName,
    type,
    price,
    countInStock,
    description,
    image,
    rating,
    discount,
    selled,
    id,
  } = props;

  const originalPrice = Math.round(price / (1 - discount / 100));
  const hasValidDiscount = discount && discount > 0 && !isNaN(discount);
  const navigate = useNavigate();

  const handleGetDetailsProduct = (id) => {
    navigate(`product/detail/${id}`); // ❗ Luôn cho xem chi tiết
  };

  return (
    <Card
      onClick={() => handleGetDetailsProduct(id)}
      className={`relative w-full max-w-[14rem] h-full rounded-xl shadow-md border border-gray-200 overflow-hidden 
        cursor-pointer hover:scale-105 hover:shadow-lg
        bg-white flex flex-col transition duration-300`}
    >
      {/* Badge Giảm giá */}
      {hasValidDiscount && (
        <Box className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-br-md z-10">
          Giảm {discount}%
        </Box>
      )}

      {/* Badge Trả góp */}
      <Box className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-1 rounded-bl-md z-10 border border-blue-400">
        Trả góp 0%
      </Box>

      {/* Badge Hết hàng */}
      {countInStock < 1 && (
        <Box className="absolute bottom-0 left-0 right-0 bg-gray-900/80 text-white text-[11px] py-1 text-center z-10">
          Đợi hàng mới về
        </Box>
      )}

      {/* Ảnh sản phẩm */}
      <CardMedia
        component="img"
        image={image}
        alt={productName}
        className="object-contain bg-white p-2"
        style={{ height: 180 }}
      />

      {/* Nội dung sản phẩm */}
      <CardContent className="flex flex-col flex-grow px-2 pt-1 pb-2">
        {/* Tên sản phẩm */}
        <Typography
          variant="body2"
          className="text-gray-800 font-medium leading-snug text-sm line-clamp-2 min-h-[40px]"
        >
          {productName}
        </Typography>

        {/* Giá */}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-1 min-h-[28px]">
          {hasValidDiscount ? (
            <>
              <span className="text-red-600 font-bold text-base">
                {convertPrice(price)}₫
              </span>
              <span className="line-through text-gray-500 text-xs">
                {originalPrice.toLocaleString()}₫
              </span>
            </>
          ) : (
            <span className="text-red-600 font-bold text-base">
              {convertPrice(price)}₫
            </span>
          )}
        </div>

        {/* Mô tả */}
        <Typography
          variant="caption"
          className="bg-gray-100 text-gray-700 text-[11px] rounded px-1.5 py-0.5 mt-1 inline-block min-h-[20px]"
        >
          {description && description.length > 30
            ? `${description.slice(0, 30)}...`
            : description || ""}
        </Typography>

        {/* Rating + Favorite */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-0.5 text-yellow-400">
            {Array.from({ length: rating || 0 }, (_, i) => (
              <StarIcon key={i} style={{ fontSize: 14 }} />
            ))}
          </div>
          <Tooltip title="Yêu thích">
            <IconButton size="small">
              <FavoriteBorderIcon
                fontSize="small"
                className="text-blue-500"
                style={{ fontSize: 16 }}
              />
            </IconButton>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardItem;
