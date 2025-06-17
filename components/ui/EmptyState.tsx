
import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, className }) => {
  return (
    <div className={`text-center py-10 px-6 bg-white rounded-lg shadow-sm card-print-styling ${className || ''}`}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-700 mb-2 print:text-black">{title}</h3>
      <p className="text-gray-500 print:text-black">{message}</p>
    </div>
  );
};

export default EmptyState;
