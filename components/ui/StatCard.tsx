
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className, valueClassName }) => {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4 ${className || ''}`}>
      {icon && <div className="text-primary text-3xl">{icon}</div>}
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-2xl font-semibold text-gray-800 ${valueClassName || ''}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
