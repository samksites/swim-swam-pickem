import React from "react";

type BlurBackgroundProps = {
  children?: React.ReactNode;
  zIndex?: number;
};

const BlurBackground: React.FC<BlurBackgroundProps> = ({ children, zIndex = 50 }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex,
      backdropFilter: "blur(4px)",
      background: "rgba(0,0,0,0.2)",
    }}
  >
    {children}
  </div>
);

export default BlurBackground;