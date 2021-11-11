import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const PostureStatus = ({ status }) => {
  const [title, setTitle] = useState(status);

  const elementRef = useRef();

  useEffect(() => {
    console.log(`${title} script running`);
    setTitle(status);
  }, []);

  return (
    <>
      <div className="posture-status-bar" ref={elementRef}>
        {status ? status === "good" ? "Good Posture!" : "Sit Up Straight!" : "Loading...."}
      </div>
    </>
  );
};

PostureStatus.propTypes = {
  status: PropTypes.string
};

export default PostureStatus;
