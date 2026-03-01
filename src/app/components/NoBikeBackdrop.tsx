import React from 'react';

interface NoBikeBackdropProps {
  show: boolean;
}

export function NoBikeBackdrop({ show }: NoBikeBackdropProps) {
  if (!show) return null;

  return (
    <div className="absolute left-0 right-0 top-0 overflow-hidden pointer-events-none z-0">
      <div className="relative w-full" style={{ height: '100vh', maxHeight: '800px' }}>
        <img 
          src="/bike-parts.jpg" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
        {/* Gradient overlay to fade out */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-950" 
             style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, white 100%)' }}>
        </div>
      </div>
    </div>
  );
}
