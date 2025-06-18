
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  containerClassName?: string;
  error?: string; // New prop for displaying error messages
}

const Input: React.FC<InputProps> = ({ label, id, containerClassName, error, ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName || ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`mt-1 block w-full px-3 py-2 bg-white border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${props.className || ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error-message` : undefined}
      />
      {error && (
        <p id={`${id}-error-message`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
