import React from 'react';

interface ProgramLogoProps {
  variant?: 'compact' | 'full' | 'iconOnly' | 'hero';
  className?: string;
  onClick?: () => void;
  showSubtitle?: boolean;
}

export const ProgramLogo: React.FC<ProgramLogoProps> = ({
  variant = 'compact',
  className = '',
  onClick,
  showSubtitle = true,
}) => {
  // SVG Icon Mark: Scooter + Location Pin + Speed Lightning
  const renderIcon = (size: number = 36) => (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-200`}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-orange-500/20 pointer-events-none" />
        
        {/* Vector SVG Emblem */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[82%] h-[82%] drop-shadow-md"
        >
          {/* Subtle Speed Streaks */}
          <path
            d="M6 14H16M4 22H14M7 30H12"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Glowing Location Pin at Top Right */}
          <path
            d="M34 6C30.6863 6 28 8.68629 28 12C28 16.5 34 22 34 22C34 22 40 16.5 40 12C40 8.68629 37.3137 6 34 6Z"
            fill="url(#pinGrad)"
          />
          <circle cx="34" cy="12" r="2.2" fill="#FFFFFF" />

          {/* Delivery Scooter Vector */}
          {/* Back Wheel */}
          <circle cx="15" cy="36" r="5" stroke="#F59E0B" strokeWidth="2.8" fill="#18181B" />
          <circle cx="15" cy="36" r="2" fill="#F59E0B" />

          {/* Front Wheel */}
          <circle cx="36" cy="36" r="5" stroke="#F59E0B" strokeWidth="2.8" fill="#18181B" />
          <circle cx="36" cy="36" r="2" fill="#F59E0B" />

          {/* Scooter Chassis & Handlebar */}
          <path
            d="M15 36H24L29 26L34 26"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29 26L36 36"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M32 23L35 23"
            stroke="#F59E0B"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Delivery Box with Speed Lightning on Back Rack */}
          <rect
            x="14"
            y="21"
            width="9"
            height="9"
            rx="2"
            fill="url(#boxGrad)"
            stroke="#F59E0B"
            strokeWidth="1.2"
          />
          {/* Lightning inside Box */}
          <path
            d="M19 23L17 26H19.5L18.5 28.5"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Scooter Headlight Beam */}
          <path
            d="M36 26L42 24M36 27L43 27M36 28L42 30"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="pinGrad" x1="28" y1="6" x2="40" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="boxGrad" x1="14" y1="21" x2="23" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#F97316" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pulse beacon dot */}
        <span className="absolute top-1 end-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
    </div>
  );

  if (variant === 'iconOnly') {
    return (
      <div 
        className={`inline-flex items-center cursor-pointer select-none group ${className}`}
        onClick={onClick}
        title="انشر إعلانك"
      >
        {renderIcon(34)}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div 
        className={`flex flex-col items-center text-center p-4 rounded-3xl bg-gradient-to-b from-neutral-900/90 via-black to-neutral-950 border border-amber-500/30 shadow-2xl relative overflow-hidden select-none group ${className}`}
        onClick={onClick}
      >
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
        
        {/* Large Logo Emblem */}
        <div className="mb-3 relative">
          {renderIcon(68)}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 tracking-tight">
              انشر إعلانك
            </h1>
            <span className="text-xl animate-bounce">📢</span>
          </div>

          {showSubtitle && (
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-[11px] sm:text-xs font-black bg-gradient-to-r from-amber-400 to-orange-500 text-black px-2.5 py-0.5 rounded-full shadow-sm">
                اطلب الأقرب ليك ⚡
              </span>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                توصيل وحجز بالـ GPS
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div 
        className={`inline-flex items-center gap-2 cursor-pointer select-none group ${className}`}
        onClick={onClick}
      >
        {renderIcon(36)}
        <div className="flex flex-col text-right leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
              انشر إعلانك
            </span>
            <span className="text-xs">📢</span>
          </div>
          {showSubtitle && (
            <span className="text-[9.5px] text-amber-300 font-black mt-1 flex items-center gap-1">
              <span>اطلب الأقرب ليك</span>
              <span className="text-emerald-400 font-bold">⚡</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  // 'compact' - default for mobile headers
  return (
    <div 
      className={`inline-flex items-center gap-1 cursor-pointer select-none group shrink-0 ${className}`}
      onClick={onClick}
      title="انشر إعلانك"
    >
      {renderIcon(20)}
      <div className="flex flex-col text-right leading-none">
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] font-black text-white tracking-tight group-hover:text-amber-300 transition-colors whitespace-nowrap">
            انشر إعلانك
          </span>
        </div>
      </div>
    </div>
  );
};
