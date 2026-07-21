import React from "react";

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 hover:scale-105`}
    >
      <defs>
        {/* Premium Gold Metallic Gradient */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA7C11" />
          <stop offset="100%" stopColor="#F3E5AB" />
        </linearGradient>

        {/* Outer Shadow Effect */}
        <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#dropShadow)">
        {/* TOP ROOF GEOMETRIC BRACKET */}
        <path
          d="M 196 100 L 256 50 L 406 125 L 376 140 L 256 80 L 196 130 Z"
          fill="url(#goldGradient)"
        />
        <path
          d="M 200 135 L 256 182 L 350 182 L 280 135 Z"
          fill="url(#goldGradient)"
          opacity="0.85"
        />

        {/* BOTTOM FLOOR GEOMETRIC BRACKET */}
        <path
          d="M 316 412 L 256 462 L 106 387 L 136 372 L 256 432 L 316 382 Z"
          fill="url(#goldGradient)"
        />
        <path
          d="M 312 377 L 256 330 L 162 330 L 232 377 Z"
          fill="url(#goldGradient)"
          opacity="0.85"
        />

        {/* LEFT ARROW (Triangle with Aperture Circle Inside) */}
        <path
          d="M 111 166 L 111 346 L 21 256 Z"
          fill="url(#goldGradient)"
        />
        <circle cx="85" cy="256" r="12" fill="#0A2C21" stroke="url(#goldGradient)" strokeWidth="3" />
        {/* Camera Shutter aperture lines on left */}
        <line x1="85" y1="244" x2="85" y2="256" stroke="url(#goldGradient)" strokeWidth="2" />
        <line x1="85" y1="256" x2="97" y2="256" stroke="url(#goldGradient)" strokeWidth="2" />
        <line x1="85" y1="256" x2="77" y2="265" stroke="url(#goldGradient)" strokeWidth="2" />

        {/* RIGHT ARROW (Triangle with Aperture Circle Inside) */}
        <path
          d="M 401 166 L 401 346 L 491 256 Z"
          fill="url(#goldGradient)"
        />
        <circle cx="427" cy="256" r="12" fill="#0A2C21" stroke="url(#goldGradient)" strokeWidth="3" />
        {/* Camera Shutter aperture lines on right */}
        <line x1="427" y1="244" x2="427" y2="256" stroke="url(#goldGradient)" strokeWidth="2" />
        <line x1="427" y1="256" x2="439" y2="256" stroke="url(#goldGradient)" strokeWidth="2" />
        <line x1="427" y1="256" x2="419" y2="265" stroke="url(#goldGradient)" strokeWidth="2" />

        {/* CENTRAL "I" STEM */}
        <path
          d="M 132 181 L 180 141 L 180 351 L 132 351 Z"
          fill="url(#goldGradient)"
        />

        {/* CENTRAL "M" LETTER */}
        {/* Left vertical pillar */}
        <path
          d="M 198 141 L 242 141 L 242 351 L 198 351 Z"
          fill="url(#goldGradient)"
        />
        {/* Middle V section and right vertical pillar */}
        <path
          d="M 242 141 L 285 241 L 328 141 L 402 141 L 402 351 L 358 351 L 358 200 L 315 301 L 285 301 L 242 200 Z"
          fill="url(#goldGradient)"
        />
      </g>
    </svg>
  );
};
