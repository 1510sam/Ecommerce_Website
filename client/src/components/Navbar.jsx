import React from "react";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Rating } from "@mui/material";

const Navbar = () => {
  // const onChange = () => {};
  const renderContent = (type, options) => {
    switch (type) {
      case "text":
        return options.map((option) => {
          return (
            <span className="text-[rgb(56,56,61)] font-normal text-xs">
              {option}
            </span>
          );
        });
      case "checkbox":
        return (
          <FormGroup>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox />
                <span>{option.label}</span>
              </div>
            ))}
          </FormGroup>
        );
      case "star":
        return options.map((option) => (
          <div className="flex">
            <Rating size="small" name="disabled" value={option} readOnly />
            <Typography
              variant="body2"
              component="legend"
            >{`Từ ${option} sao`}</Typography>
          </div>
        ));
      case "price":
        return options.map((option) => (
          <div className="rounded-xl bg-[rgb(238,238,238)] text-[rgb(56,56,61)] p-1 w-fit">
            {option}
          </div>
        ));
      default:
        return {};
    }
  };
  return (
    <nav>
      <Typography
        style={{ marginBottom: "12px" }}
        className="text-[rgb(56,56,61)] font-medium text-sm"
      >
        Danh mục sản phẩm
      </Typography>
      <div className="flex flex-col gap-3">
        {renderContent("text", ["Điện Thoại", "Laptop", "PC"])}
      </div>
      {/* <div className="flex flex-col gap-3">
        {renderContent("checkbox", [{ label: "A" }, { label: "B" }])}
      </div>
      <div className="flex flex-col gap-3">
        {renderContent("star", [3, 4, 5])}
      </div>
      <div className="flex flex-col gap-3">
        {renderContent("price", ["Dưới 40", "Trên 50.000"])}
      </div> */}
    </nav>
  );
};

export default Navbar;
