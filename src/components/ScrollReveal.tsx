import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface ScrollRevealProps {
  className?: string;
  as?: 'div' | 'section';
  children: React.ReactNode;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ className = '', as: Tag = 'div', children }) => {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();
  return (
    <Tag ref={ref} className={`${className} ${isRevealed ? 'in-view' : ''}`}>
      {children}
    </Tag>
  );
};

export default ScrollReveal;
