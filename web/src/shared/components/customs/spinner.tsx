"use client";
import React from "react";

type SpinnerProps = {
  size?: number;
  className?: string;
  border?: number
  coloredBorder?: boolean
};

const Spinner = ({ size = 24, border = 2, className = "", coloredBorder = false }: SpinnerProps) => {
  return (
    <div
      style={{ width: size, height: size, borderWidth: border }}
      className={`animate-spin rounded-full border-[${border}px] border-gray-300 border-t-${coloredBorder ? "orange-500" : "transparent"} ${className}`}
    />
  );
};

export default Spinner;
