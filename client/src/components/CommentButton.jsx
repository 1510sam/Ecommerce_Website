import React, { useEffect } from "react";

const CommentButton = (props) => {
  const { dataRef, width = "100%" } = props;
  useEffect(() => {
    // Gọi lại để FB SDK quét các thẻ XFBML
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);
  return (
    <div
      class="fb-comments"
      data-href={dataRef}
      data-width={width}
      data-numposts="5"
    ></div>
  );
};

export default CommentButton;
