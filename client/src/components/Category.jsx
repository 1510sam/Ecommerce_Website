import React from "react";
import { useNavigate } from "react-router-dom";

const Category = ({ name }) => {
  const navigate = useNavigate();
  const handleNavigateCate = (type) => {
    navigate(`/product/${type}`, { state: type });
  };
  return (
    <div
      onClick={() => handleNavigateCate(name)}
      className="py-[10px] cursor-pointer"
    >
      {name}
    </div>
  );
};

export default Category;
