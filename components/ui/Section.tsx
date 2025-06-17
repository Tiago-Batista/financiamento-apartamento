
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string; 
}

const Section: React.FC<SectionProps> = ({ title, children, className, id }) => {
  const sectionId = id || title.toLowerCase().replace(/\s+/g, '-');
  const titleId = `${sectionId}-title`;

  return (
    <section 
      id={sectionId} 
      className={`mb-8 ${className || ''}`}
      role="region"
      aria-labelledby={titleId}
    >
      <h2 
        id={titleId}
        className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-300"
      >
        {title}
      </h2>
      {children}
    </section>
  );
};

export default Section;
