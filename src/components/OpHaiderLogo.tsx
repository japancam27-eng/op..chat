import React from 'react';

interface OpHaiderLogoProps {
  size?: number | string;
  variant?: 'icon' | 'full' | 'avatar' | 'emblem';
  className?: string;
  glow?: boolean;
}

export const OpHaiderLogo: React.FC<OpHaiderLogoProps> = ({
  size = 40,
  variant = 'icon',
  className = '',
  glow = true,
}) => {
  const sizeStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};
  const logoSrc = '/op-haider-logo.png';

  if (variant === 'full') {
    return (
      <div
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-[#09151c] border border-[#00ffcc]/30 shadow-lg ${
          glow ? 'shadow-[0_0_25px_rgba(0,255,204,0.3)]' : ''
        } ${className}`}
        style={sizeStyle}
      >
        <img
          src={logoSrc}
          alt="OP.HAIDER Logo"
          className="w-full h-full object-contain p-1 transform hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Graceful fallback to CSS emblem if image loading fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div
        className={`relative rounded-full overflow-hidden flex items-center justify-center bg-[#071318] border-2 border-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.4)] ${className}`}
        style={sizeStyle}
      >
        <img
          src={logoSrc}
          alt="OP Haider AI Logo"
          className="w-[170%] h-[170%] max-w-none object-cover transform -translate-y-[8%] hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20 pointer-events-none" />
      </div>
    );
  }

  // Default 'icon' / 'emblem'
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden bg-[#071318] border border-[#00ffcc]/40 shadow-[0_0_15px_rgba(0,255,204,0.35)] ${className}`}
      style={sizeStyle}
    >
      <img
        src={logoSrc}
        alt="OP Haider Emblem"
        className="w-[160%] h-[160%] max-w-none object-cover transform -translate-y-[8%] transition-transform duration-300"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071318]/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
