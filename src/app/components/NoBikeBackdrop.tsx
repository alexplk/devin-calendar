import React from 'react';

interface NoBikeBackdropProps {
  show: boolean;
}

export function NoBikeBackdrop({ show }: NoBikeBackdropProps) {
  if (!show) return null;

  // Get base path for GitHub Pages deployment
  const basePath = process.env.NODE_ENV === 'production' ? '/devin-calendar' : '';

  return (
    <div className="absolute left-0 right-0 top-0 overflow-hidden pointer-events-none z-0">
      <div className="relative w-full" style={{ height: '100vh', maxHeight: '800px' }}>
        <img 
          src={`${basePath}/bike-parts.jpg`} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover dark:invert"
          style={{ objectPosition: 'center' }}
        />
        {/* Gradient overlay to fade out */}
        <div className="absolute inset-0" 
             style={{ background: 'linear-gradient(to bottom, transparent 0%, transparent 70%, var(--background) 100%)' }}>
        </div>
      </div>
    </div>
  );
}
