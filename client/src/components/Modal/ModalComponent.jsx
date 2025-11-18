import { Modal } from "antd";
import React from "react";
const ModalWarning = ({
  title = "Modal",
  isModalOpen = false,
  children,
  ...rests
}) => {
  return (
    <Modal
      title={title}
      closable={{ "aria-label": "Custom Close Button" }}
      open={isModalOpen}
      {...rests}
    >
      {children}
    </Modal>
  );
};

export default ModalWarning;
