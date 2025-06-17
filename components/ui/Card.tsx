
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className, titleClassName }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className || ''}`}>
      {title && (
        <div className={`bg-gray-50 px-6 py-4 border-b border-gray-200 ${titleClassName || ''}`}>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
