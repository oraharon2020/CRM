import React from 'react';
import { HiMail, HiPhone, HiChat } from 'react-icons/hi';

interface SupportContact {
  type: 'email' | 'phone' | 'chat';
  value: string;
  label?: string;
}

interface SupportSectionProps {
  title?: string;
  description?: string;
  contacts: SupportContact[];
}

const SupportSection: React.FC<SupportSectionProps> = ({ 
  title = 'תמיכה טכנית', 
  description = 'נתקלת בבעיה? צור קשר עם התמיכה הטכנית שלנו', 
  contacts 
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <HiMail className="h-6 w-6 text-gray-400" />;
      case 'phone':
        return <HiPhone className="h-6 w-6 text-gray-400" />;
      case 'chat':
        return <HiChat className="h-6 w-6 text-gray-400" />;
      default:
        return <HiMail className="h-6 w-6 text-gray-400" />;
    }
  };

  const getContactLabel = (type: string, label?: string) => {
    if (label) return label;
    
    switch (type) {
      case 'email':
        return 'אימייל';
      case 'phone':
        return 'טלפון';
      case 'chat':
        return 'צ\'אט';
      default:
        return 'צור קשר';
    }
  };

  const getContactAction = (type: string, value: string) => {
    switch (type) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value}`;
      case 'chat':
        return value; // URL to chat
      default:
        return '#';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-700">
          {description}
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-shrink-0">
                {getIcon(contact.type)}
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-gray-900">{getContactLabel(contact.type, contact.label)}</h3>
                <a 
                  href={getContactAction(contact.type, contact.value)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  target={contact.type === 'email' || contact.type === 'chat' ? '_blank' : undefined}
                  rel={contact.type === 'email' || contact.type === 'chat' ? 'noopener noreferrer' : undefined}
                >
                  {contact.value}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportSection;
