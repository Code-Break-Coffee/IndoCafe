import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-6 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-on-primary hover:opacity-90 focus:ring-primary shadow-lg shadow-primary/30",
    secondary: "bg-secondary text-white hover:opacity-90 focus:ring-secondary",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-on-primary focus:ring-primary",
    ghost: "bg-transparent text-primary hover:bg-primary/10 focus:ring-primary",
    surface: "bg-surface text-primary hover:bg-background focus:ring-surface shadow-md"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
