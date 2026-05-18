import { ComponentPropsWithoutRef } from 'react';

interface CardProps extends ComponentPropsWithoutRef<'div'> {}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-white border-2 border-black shadow-brutal transition-all ${className}`} {...props}>
      {children}
    </div>
  );
}
