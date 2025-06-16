
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, containerClassName, ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName || ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${props.className || ''}`}
      />
    </div>
  );
};

export default Input;
