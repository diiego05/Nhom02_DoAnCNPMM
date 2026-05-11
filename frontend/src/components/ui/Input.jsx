import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, id, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className="border-2 border-black px-4 py-3 w-full focus:outline-none focus:ring-0 transition-all duration-200 focus:shadow-brutal bg-white"
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
