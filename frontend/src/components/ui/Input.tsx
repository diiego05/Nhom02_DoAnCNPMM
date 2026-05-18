import { forwardRef, ComponentPropsWithoutRef } from 'react';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, id, className = '', ...props }, ref) => {
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
        className="border-2 border-black px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 focus:shadow-subtle bg-white rounded-lg"
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
