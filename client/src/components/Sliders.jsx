import React from "react";
import Slider from "react-slick";
import ImageListItem from "@mui/material/ImageListItem";
const Sliders = ({ arrImgs }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplaySpeed: 3000,
    autoplay: true,
  };
  return (
    <Slider {...settings}>
      {arrImgs.map((item) => {
        return (
          <ImageListItem key={item.id}>
            <img
              src={item}
              alt="Slider"
              preview={false}
              width="100%"
              height="300px"
            />
          </ImageListItem>
        );
      })}
    </Slider>
  );
};

export default Sliders;
