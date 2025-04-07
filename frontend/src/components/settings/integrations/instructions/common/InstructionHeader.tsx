import React from 'react';
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi';

interface InstructionHeaderProps {
  title: string;
  backUrl?: string;
  backText?: string;
}

const InstructionHeader: React.FC<InstructionHeaderProps> = ({ 
  title, 
  backUrl = "/settings?tab=integrations", 
  backText = "חזרה להגדרות" 
}) => {
  return (
    <div className="flex items-center mb-6">
      <Link 
        to={backUrl} 
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <HiArrowRight className="ml-1 h-5 w-5" />
        {backText}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mr-4">{title}</h1>
    </div>
  );
};

export default InstructionHeader;
