
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string; // Added optional id prop
}

const Section: React.FC<SectionProps> = ({ title, children, className, id }) => {
  return (
    <section id={id} className={`mb-8 ${className || ''}`}>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300">{title}</h2>
      {children}
    </section>
  );
};

export default Section;