import Spinner from '@/shared/components/customs/spinner';
import React from 'react'

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-slate-950 text-white hover:bg-slate-900",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
};


const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className,
    ...rest
}) => {
    return (
        <button
            disabled={disabled || loading}
            className={`
        relative inline-flex items-center justify-center cursor-pointer
        rounded-md font-medium transition
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${loading ? "opacity-80" : ""}
        ${disabled || loading ? "cursor-not-allowed!" : ""}
        ${className || ""}
      `}
            {...rest}
        >
            <span className="flex items-center justify-center">
                {children}
            </span>

            {/* Spinner */}
            {loading && (
                <span className="absolute right-4">
                    <Spinner />
                </span>
            )}
        </button>
    );
};

export default Button;


