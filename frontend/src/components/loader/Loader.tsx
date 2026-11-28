import * as React from "react";

interface LoaderProps {
  size?: number;
}

const Loader: React.FC<LoaderProps> = ({ size = 40 }) => (
  <div className="flex items-center justify-center">
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke="#e8ff47"
        strokeOpacity="0.15"
        strokeWidth="3"
      />
      <path
        d="M20 4a16 16 0 0 1 16 16"
        stroke="#e8ff47"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export default Loader;
