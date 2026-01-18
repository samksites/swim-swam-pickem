import React from "react";
import { CiCirclePlus } from "react-icons/ci";

type PlusButtonProps = {
  onClick?: () => void;
  css?: React.CSSProperties;
  txt?: string;
};

const PlusButton: React.FC<PlusButtonProps> = ({ onClick, css, txt }) => (
  <button
    onClick={onClick}
    style={css}
    className="transition-transform duration-150 ease-in-out hover:scale-105 hover:shadow-lg"
  >
    <span
      style={{
        background: "#2563eb",
        border: "none",
        borderRadius: "9999px",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#fff",
        fontWeight: 600,
        fontSize: "1rem",
        cursor: "pointer",
      }}
    >
      <CiCirclePlus size={32} color="#fff" />
      {txt}
    </span>
  </button>
);

export default PlusButton;