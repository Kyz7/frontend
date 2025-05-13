const Button = ({ 
    children, 
    type = 'button', 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    disabled = false, 
    onClick,
    fullWidth = false,
    icon = null,
  }) => {
    // Base button styles
    const baseStyles = 'font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
    
    // Variant styles
    const variantStyles = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
      success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500',
      danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
      info: 'bg-blue-400 hover:bg-blue-500 text-white focus:ring-blue-400',
      light: 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 focus:ring-gray-300',
      dark: 'bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-800',
      link: 'bg-transparent hover:underline text-blue-500 focus:ring-blue-500 p-0',
      outline: 'bg-transparent border border-current hover:bg-blue-50 text-blue-500 focus:ring-blue-500',
    };
    
    // Size styles
    const sizeStyles = {
      xs: 'py-1 px-2 text-xs',
      sm: 'py-1.5 px-3 text-sm',
      md: 'py-2 px-4 text-base',
      lg: 'py-2.5 px-5 text-lg',
      xl: 'py-3 px-6 text-xl',
    };
    
    // Disabled styles
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    // Full width style
    const widthStyle = fullWidth ? 'w-full' : '';
    
    // Icon styles
    const iconStyles = icon ? 'flex items-center justify-center' : '';
    
    return (
      <button
        type={type}
        className={`
          ${baseStyles} 
          ${variantStyles[variant] || variantStyles.primary} 
          ${sizeStyles[size] || sizeStyles.md} 
          ${disabledStyles}
          ${widthStyle}
          ${iconStyles}
          ${className}
        `}
        disabled={disabled}
        onClick={onClick}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  };
  
  export default Button;