import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 300 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDelayed, setIsDelayed] = useState(true);
  
  // Calculate position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };
  
  // Calculate arrow position classes
  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-[-6px] left-1/2 transform -translate-x-1/2 border-t-gray-800 border-r-transparent border-b-transparent border-l-transparent';
      case 'right':
        return 'left-[-6px] top-1/2 transform -translate-y-1/2 border-t-transparent border-r-gray-800 border-b-transparent border-l-transparent';
      case 'bottom':
        return 'top-[-6px] left-1/2 transform -translate-x-1/2 border-t-transparent border-r-transparent border-b-gray-800 border-l-transparent';
      case 'left':
        return 'right-[-6px] top-1/2 transform -translate-y-1/2 border-t-transparent border-r-transparent border-b-transparent border-l-gray-800';
      default:
        return 'bottom-[-6px] left-1/2 transform -translate-x-1/2 border-t-gray-800 border-r-transparent border-b-transparent border-l-transparent';
    }
  };
  
  // Handle mouse enter
  const handleMouseEnter = () => {
    if (delay === 0) {
      setIsDelayed(false);
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsDelayed(false);
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsVisible(false);
    setIsDelayed(true);
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-800 rounded-md shadow-lg max-w-xs transition-opacity duration-200 ${
            isDelayed ? 'opacity-0' : 'opacity-100'
          } ${getPositionClasses()}`}
          role="tooltip"
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
