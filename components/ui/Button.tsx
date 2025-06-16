
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const baseStyles = "font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150";
  
  let variantStyles = "";
  switch (variant) {
    case 'primary':
      variantStyles = "bg-primary hover:bg-primary-dark text-white focus:ring-primary";
      break;
    case 'secondary':
      variantStyles = "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400";
      break;
    case 'danger':
      variantStyles = "bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary";
      break;
    case 'success':
      variantStyles = "bg-accent hover:bg-accent-dark text-white focus:ring-accent";
      break;
  }

  let sizeStyles = "";
  switch (size) {
    case 'sm':
      sizeStyles = "px-3 py-1.5 text-xs";
      break;
    case 'md':
      sizeStyles = "px-4 py-2 text-sm";
      break;
    case 'lg':
      sizeStyles = "px-6 py-3 text-base";
      break;
  }

  return (
    <button
      {...props}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`}
    >
      {children}
    </button>
  );
};

export default Button;
