import { Steps } from "antd";
import React from "react";

const Step = ({ current = 0, items = [] }) => {
  const { Step } = Steps;
  return (
    <Steps current={current}>
      {items.map((item) => {
        return (
          <Step
            key={item.title}
            size="small"
            title={item.title}
            items={items}
            description={description}
          />
        );
      })}
    </Steps>
  );
};

export default Step;
