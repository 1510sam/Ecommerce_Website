import React from "react";
import {
  Drawer as MUIDrawer,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Drawer = ({
  title = "Drawer",
  placement = "right",
  isOpen = false,
  onClose,
  children,
  ...rests
}) => {
  return (
    <MUIDrawer anchor={placement} open={isOpen} onClose={onClose} {...rests}>
      <Box
        sx={{
          width: placement === "left" || placement === "right" ? 400 : "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} aria-label="Close Button">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>{children}</Box>
      </Box>
    </MUIDrawer>
  );
};

export default Drawer;
