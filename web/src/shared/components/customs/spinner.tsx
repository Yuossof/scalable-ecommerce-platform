"use client";
import React from "react";

type SpinnerProps = {
  size?: number;
  className?: string;
  border?: number;
  coloredBorder?: boolean;
};

const Spinner = ({ size = 24, border = 2, className = "", coloredBorder = false }: SpinnerProps) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderWidth: border,
        borderTopColor: coloredBorder ? "var(--color-primary, #f97316)" : "transparent",
      }}
      className={`animate-spin rounded-full border-gray-300 ${className}`}
    />
  );
};

export default Spinner;
