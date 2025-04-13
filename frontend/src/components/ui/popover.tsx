import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  children: React.ReactNode;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {children}
    </div>
  );
};

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ 
  children, 
  asChild = false,
  className = '',
  ...props 
}) => {
  const child = React.Children.only(children);
  
  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      ...props,
      ...child.props,
      className: `${child.props.className || ''} ${className}`.trim()
    });
  }
  
  return (
    <button 
      type="button" 
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  className = '',
  align = 'center',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsOpen(true);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!isOpen) return null;
  
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };
  
  return (
    <div
      ref={contentRef}
      className={`absolute z-50 mt-2 bg-white rounded-md shadow-lg ${alignmentClasses[align]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
