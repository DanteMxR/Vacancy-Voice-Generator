import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => (
  <button className={`px-4 py-2 rounded ${className}`} {...props}>
    {children}
  </button>
); 