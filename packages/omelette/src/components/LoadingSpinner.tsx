import React from "react";

interface LoadingSpinnerProps {
  fill: string;
  className?: string;
}

function LoadingSpinner(props: LoadingSpinnerProps) {
  return (
    <svg
      width="124"
      height="124"
      fill="none"
      viewBox="0 0 124 124"
      className={"animate-spin " + props.className || ''}
    >
      <path
        fill={props.fill || "#fff"}
        d="M124 62A61.998 61.998 0 0049.904 1.191 62 62 0 0062 124v-15.295A46.705 46.705 0 11108.705 62H124z"
      ></path>
    </svg>
  );
}

export default LoadingSpinner;
