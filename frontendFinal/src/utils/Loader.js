import React from "react";
import { Spin } from "antd";

function Loader(props) {
  return (
    <Spin size="large" spinning={props.spinning}>
      {props.children}
    </Spin>
  );
}
export default Loader;
