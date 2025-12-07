import React, { useEffect } from "react";

const LikeButton = (props) => {
  const { dataRef } = props;
  useEffect(() => {
    // Gọi lại để FB SDK quét các thẻ XFBML
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div
      className="fb-like"
      data-href={dataRef}
      data-width=""
      data-layout="standard"
      data-action="like"
      data-size="large"
      data-share="true"
    ></div>
  );
};

export default LikeButton;
