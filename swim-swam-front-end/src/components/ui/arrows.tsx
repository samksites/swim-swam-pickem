import React from "react";
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";

type ArrowProps = {
    css?: React.CSSProperties;
    onClick?: () => void;
    children?: React.ReactNode;
};

const ArrowContainer: React.FC<ArrowProps> = ({ css, onClick, children }) => (
    <div className="hover:scale-110"
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...css,
        }}
        onClick={onClick}
    >
        {children}
    </div>
);

// Add your arrow icons inside each Arrow component as children
export const ArrowDown: React.FC<ArrowProps> = (props) => (
    <ArrowContainer {...props}>
        <FaArrowDown />
    </ArrowContainer>
);

export const ArrowUp: React.FC<ArrowProps> = (props) => (
    <ArrowContainer {...props}>
        {/* Example Up Arrow SVG */}
        <FaArrowUp />
    </ArrowContainer>
);

export const ArrowLeft: React.FC<ArrowProps> = (props) => (
    <ArrowContainer {...props}>
        {/* Example Left Arrow SVG */}
        <FaArrowLeft />
    </ArrowContainer>
);

export const ArrowRight: React.FC<ArrowProps> = (props) => (
    <ArrowContainer {...props}>
        {/* Example Right Arrow SVG */}
        <FaArrowRight />
    </ArrowContainer>
);