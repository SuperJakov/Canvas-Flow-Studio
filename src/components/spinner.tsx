import React from "react";

type SwirlingEffectSpinnerProps = {
  size?: number | string; // px by default, e.g. 24, "2rem"
  strokeWidth?: number; // px
  color?: string;
  duration?: number; // seconds
  className?: string;
};

const SwirlingEffectSpinner: React.FC<SwirlingEffectSpinnerProps> = ({
  size = 56,
  strokeWidth = 40,
  color = "stroke-primary",
  duration = 2,
  className = "",
}) => {
  const spinCSS = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes spin2 {
      0%   { stroke-dasharray: 1 800; stroke-dashoffset: 0; }
      50%  { stroke-dasharray: 400 400; stroke-dashoffset: -200px; }
      100% { stroke-dasharray: 800 1; stroke-dashoffset: -800px; }
    }
  `;

  return (
    <>
      <style>{spinCSS}</style>
      <svg
        viewBox="0 0 800 800"
        className={className}
        style={{
          width: typeof size === "number" ? `${size}px` : size,
          height: typeof size === "number" ? `${size}px` : size,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="400"
          cy="400"
          r="200"
          fill="none"
          className={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            animation: `
              spin2 ${duration * 0.75}s ease-in-out infinite alternate,
              spin ${duration}s linear infinite
            `,
          }}
        />
      </svg>
    </>
  );
};

export default SwirlingEffectSpinner;
