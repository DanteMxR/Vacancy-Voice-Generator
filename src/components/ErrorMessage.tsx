import React from "react";

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = "" }) => (
  <div className={`text-red-600 text-center ${className}`}>{message}</div>
); 