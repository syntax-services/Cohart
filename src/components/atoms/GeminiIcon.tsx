import React from 'react';

export type IconName =
  | 'sparkle'
  | 'home'
  | 'reader'
  | 'calendar'
  | 'map'
  | 'user'
  | 'brain'
  | 'search'
  | 'bell'
  | 'check'
  | 'clock'
  | 'compass'
  | 'wallet'
  | 'share'
  | 'zap'
  | 'chevron-right'
  | 'chevron-down'
  | 'close'
  | 'arrow-right'
  | 'book-open'
  | 'graduation-cap'
  | 'bus'
  | 'chat'
  | 'pin'
  | 'highlight'
  | 'copy'
  | 'check-circle'
  | 'filter'
  | 'shield-check'
  | 'sun'
  | 'moon'
  | 'bookmark'
  | 'trash'
  | 'two-lines'
  | 'switch'
  | 'mic'
  | 'mic-off'
  | 'volume'
  | 'volume-x'
  | 'loader';

interface GeminiIconProps {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export const GeminiIcon: React.FC<GeminiIconProps> = ({
  name,
  className = '',
  size = 20,
  strokeWidth = 2.1,
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  switch (name) {
    case 'sparkle':
      return (
        <svg {...commonProps}>
          <path d="M12 2C12 7.5 16.5 12 22 12C16.5 12 12 16.5 12 22C12 16.5 7.5 12 2 12C7.5 12 12 7.5 12 2Z" />
        </svg>
      );
    case 'home':
      return (
        <svg {...commonProps}>
          <path d="M3 10.5L12 3.5L21 10.5V20C21 20.55 20.55 21 20 21H15V14H9V21H4C3.45 21 3 20.55 3 20V10.5Z" />
        </svg>
      );
    case 'reader':
    case 'book-open':
      return (
        <svg {...commonProps}>
          <path d="M2 5.5C3.8 4.2 6.5 4 8.5 4C10.5 4 12 4.5 12 6V20C12 18.5 10.5 18 8.5 18C6.5 18 3.8 18.2 2 19.5V5.5Z" />
          <path d="M22 5.5C20.2 4.2 17.5 4 15.5 4C13.5 4 12 4.5 12 6V20C12 18.5 13.5 18 15.5 18C17.5 18 20.2 18.2 22 19.5V5.5Z" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="17" rx="2.5" />
          <path d="M16 2V5" />
          <path d="M8 2V5" />
          <path d="M3 9H21" />
          <circle cx="8" cy="13" r="0.8" fill="currentColor" />
          <circle cx="12" cy="13" r="0.8" fill="currentColor" />
          <circle cx="16" cy="13" r="0.8" fill="currentColor" />
          <circle cx="8" cy="17" r="0.8" fill="currentColor" />
          <circle cx="12" cy="17" r="0.8" fill="currentColor" />
          <circle cx="16" cy="17" r="0.8" fill="currentColor" />
        </svg>
      );
    case 'map':
    case 'compass':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M15.5 8.5L13.2 13.2L8.5 15.5L10.8 10.8L15.5 8.5Z" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...commonProps}>
          <path d="M12 21C16 16.5 19 13.2 19 9.5C19 5.6 15.9 2.5 12 2.5C8.1 2.5 5 5.6 5 9.5C5 13.2 8 16.5 12 21Z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
      );
    case 'user':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5.5 20.5C5.5 16.9 8.4 14 12 14C15.6 14 18.5 16.9 18.5 20.5" />
        </svg>
      );
    case 'brain':
      return (
        <svg {...commonProps}>
          <path d="M9.5 4C8.2 4 7 4.9 6.8 6.2C5.5 6.6 4.5 7.8 4.5 9.2C4.5 9.8 4.7 10.3 5 10.8C4.4 11.5 4 12.4 4 13.5C4 15 5 16.2 6.3 16.7C6.6 18.3 8 19.5 9.6 19.5C10.4 19.5 11.2 19.2 11.8 18.7" />
          <path d="M14.5 4C15.8 4 17 4.9 17.2 6.2C18.5 6.6 19.5 7.8 19.5 9.2C19.5 9.8 19.3 10.3 19 10.8C19.6 11.5 20 12.4 20 13.5C20 15 19 16.2 17.7 16.7C17.4 18.3 16 19.5 14.4 19.5C13.6 19.5 12.8 19.2 12.2 18.7" />
          <path d="M12 4V20" />
          <path d="M8 9H12" />
          <path d="M8 14H12" />
          <path d="M12 9H16" />
          <path d="M12 14H16" />
        </svg>
      );
    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20L16 16" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...commonProps}>
          <path d="M18 8.5C18 5.2 15.3 2.5 12 2.5C8.7 2.5 6 5.2 6 8.5C6 14.5 3.5 16.5 3.5 16.5H20.5C20.5 16.5 18 14.5 18 8.5Z" />
          <path d="M10 19.5C10.5 20.4 11.2 21 12 21C12.8 21 13.5 20.4 14 19.5" />
        </svg>
      );
    case 'check':
      return (
        <svg {...commonProps}>
          <path d="M4.5 12.5L9.5 17.5L19.5 6.5" />
        </svg>
      );
    case 'check-circle':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M7.5 12L10.5 15L16.5 9" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 6.5V12L15.5 14" />
        </svg>
      );
    case 'wallet':
      return (
        <svg {...commonProps}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3 9.5H21" />
          <circle cx="16" cy="14" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'share':
      return (
        <svg {...commonProps}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 10.7L15.4 6.3" />
          <path d="M8.6 13.3L15.4 17.7" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...commonProps}>
          <path d="M13 2.5L4.5 13H11.5L10 21.5L19.5 10.5H12.5L13 2.5Z" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...commonProps}>
          <path d="M9 5L16 12L9 19" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...commonProps}>
          <path d="M5 9L12 16L19 9" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...commonProps}>
          <path d="M4 12H20" />
          <path d="M14 6L20 12L14 18" />
        </svg>
      );
    case 'close':
      return (
        <svg {...commonProps}>
          <path d="M18 6L6 18" />
          <path d="M6 6L18 18" />
        </svg>
      );
    case 'graduation-cap':
      return (
        <svg {...commonProps}>
          <path d="M2 9.5L12 4.5L22 9.5L12 14.5L2 9.5Z" />
          <path d="M6 11.8V16.5C6 18.5 8.7 20 12 20C15.3 20 18 18.5 18 16.5V11.8" />
          <path d="M22 9.5V16" />
        </svg>
      );
    case 'bus':
      return (
        <svg {...commonProps}>
          <rect x="4" y="3.5" width="16" height="15" rx="3" />
          <path d="M4 10H20" />
          <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
          <circle cx="16.5" cy="14.5" r="1" fill="currentColor" />
          <path d="M6 18.5V20.5" />
          <path d="M18 18.5V20.5" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...commonProps}>
          <path d="M20 12C20 16.4 16.4 20 12 20C10.5 20 9.1 19.6 7.9 18.9L3.5 20.5L5.1 16.1C4.4 14.9 4 13.5 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12Z" />
        </svg>
      );
    case 'highlight':
      return (
        <svg {...commonProps}>
          <path d="M14 3.5L20.5 10L10.5 20H4V13.5L14 3.5Z" />
          <path d="M11 6.5L17.5 13" />
          <path d="M4 21.5H20" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...commonProps}>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5C16 4.4 15.6 4 15 4H5C4.4 4 4 4.4 4 5V15C4 15.6 4.4 16 5 16H8" />
        </svg>
      );
    case 'filter':
      return (
        <svg {...commonProps}>
          <path d="M3 5H21L14 13.5V19L10 20.5V13.5L3 5Z" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg {...commonProps}>
          <path d="M12 3.5L19 6.5V12C19 16.5 16 19.8 12 21C8 19.8 5 16.5 5 12V6.5L12 3.5Z" />
          <path d="M8.5 11.5L11 14L15.5 9" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2V4.5" />
          <path d="M12 19.5V22" />
          <path d="M4.93 4.93L6.7 6.7" />
          <path d="M17.3 17.3L19.07 19.07" />
          <path d="M2 12H4.5" />
          <path d="M19.5 12H22" />
          <path d="M4.93 19.07L6.7 17.3" />
          <path d="M17.3 6.7L19.07 4.93" />
        </svg>
      );
    case 'bookmark':
      return (
        <svg {...commonProps}>
          <path d="M5 4C5 3.45 5.45 3 6 3H18C18.55 3 19 3.45 19 4V21L12 17.5L5 21V4Z" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...commonProps}>
          <path d="M3 6H21" />
          <path d="M19 6V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V6" />
          <path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    case 'two-lines':
      return (
        <svg {...commonProps}>
          <line x1="4" y1="9" x2="20" y2="9" strokeWidth={2} strokeLinecap="round" />
          <line x1="4" y1="15" x2="15" y2="15" strokeWidth={2} strokeLinecap="round" />
        </svg>
      );
    case 'switch':
      return (
        <svg {...commonProps}>
          <path d="M16 3L21 8L16 13" />
          <path d="M21 8H7C4.79 8 3 9.79 3 12" />
          <path d="M8 21L3 16L8 11" />
          <path d="M3 16H17C19.21 16 21 14.21 21 12" />
        </svg>
      );
    case 'mic':
      return (
        <svg {...commonProps}>
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      );
    case 'mic-off':
      return (
        <svg {...commonProps}>
          <line x1="2" x2="22" y1="2" y2="22" />
          <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
          <path d="M5 10v2a7 7 0 0 0 12 5" />
          <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      );
    case 'volume':
      return (
        <svg {...commonProps}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      );
    case 'volume-x':
      return (
        <svg {...commonProps}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="22" x2="16" y1="9" y2="15" />
          <line x1="16" x2="22" y1="9" y2="15" />
        </svg>
      );
    case 'loader':
      return (
        <svg {...commonProps} className={`${className} animate-spin`}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
};
