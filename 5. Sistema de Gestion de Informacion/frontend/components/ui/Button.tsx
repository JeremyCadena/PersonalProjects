// ARCHIVO: /components/ui/Button.tsx
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', isLoading = false, ...rest }) => {
  const baseStyles = 'flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70';

  const variantStyles = {
    primary: 'bg-[#144836] hover:bg-green-800 focus-visible:outline-green-600',
    secondary: 'bg-gray-500 hover:bg-gray-600 focus-visible:outline-gray-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600',
  };

  return (
    <button
      {...rest}
      disabled={isLoading || rest.disabled}
      className={clsx(baseStyles, variantStyles[variant], className)}
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
      ) : (
        children
      )}
    </button>
  );
};