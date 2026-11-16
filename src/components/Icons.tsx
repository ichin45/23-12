import React from 'react';

// Place Icon: Solid pin with hollow circle cutout in the center
export const SolidPlacePinIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-4 h-4',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Teardrop marker outline with hollow center circle using evenodd cutout */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7.13 11.39 7.44 11.65.33.28.79.28 1.12 0 .31-.26 7.44-6.4 7.44-11.65 0-4.42-3.58-8-8-8zm0 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
    />
  </svg>
);

// Dish Icon: Inspired by 🥘 (paella / shallow two-handled pan with solid body and simmer contents)
export const SolidPaellaDishIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-4 h-4',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    {/* Two prominent loop handles (ears) with inner cutouts */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.5 11C2.12 11 1 12.12 1 13.5C1 14.88 2.12 16 3.5 16H4.2C4.07 15.2 4 14.36 4 13.5C4 12.64 4.07 11.8 4.2 11H3.5ZM20.5 11H19.8C19.93 11.8 20 12.64 20 13.5C20 14.36 19.93 15.2 19.8 16H20.5C21.88 16 23 14.88 23 13.5C23 12.12 21.88 11 20.5 11Z"
    />
    {/* Shallow flat-bottom curved paella pan body */}
    <path d="M4 12.5C4 17.5 7.58 20.5 12 20.5C16.42 20.5 20 17.5 20 12.5C20 12 19.96 11.5 19.9 11H4.1C4.04 11.5 4 12 4 12.5Z" />
    {/* Food simmer crest and paella ingredients in the pot */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.2 10.5C5.6 7.8 8.4 6 12 6C15.6 6 18.4 7.8 18.8 10.5H5.2ZM9 8.5C9 9.05 9.45 9.5 10 9.5C10.55 9.5 11 9.05 11 8.5C11 7.95 10.55 7.5 10 7.5C9.45 7.5 9 7.95 9 8.5ZM13 9C13 9.55 13.45 10 14 10C14.55 10 15 9.55 15 9C15 8.45 14.55 8 14 8C13.45 8 13 8.45 13 9Z"
    />
  </svg>
);

// Solid Calendar Icon
export const SolidCalendarIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-4 h-4',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z"
    />
    <circle cx="8" cy="13" r="1.2" />
    <circle cx="12" cy="13" r="1.2" />
    <circle cx="16" cy="13" r="1.2" />
    <circle cx="8" cy="17" r="1.2" />
    <circle cx="12" cy="17" r="1.2" />
    <circle cx="16" cy="17" r="1.2" />
  </svg>
);

// Solid Heart Icon
export const SolidHeartIcon: React.FC<{ className?: string; size?: number }> = ({
  className = 'w-4 h-4',
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);
