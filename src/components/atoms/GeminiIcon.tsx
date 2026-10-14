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
  | 'arrow-left'
  | 'settings'
  | 'book-open'
  | 'graduation-cap'
  | 'bus'
  | 'chat'
  | 'users'
  | 'pin'
  | 'highlight'
  | 'copy'
  | 'check-circle'
  | 'filter'
  | 'shield'
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
  | 'loader'
  | 'send'
  | 'attachment'
  | 'download'
  | 'lock'
  | 'trophy'
  | 'flame'
  | 'blend';

interface GeminiIconProps {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Aurora Bespoke Curved Pill Icons
 * Crafted with organic capsule contours, rounded stadium pills, and fluid Google Flow / DeepMind geometry.
 * Replaces sharp formal rectilinear icons with friendly, futuristic, ultra-smooth pill curves.
 */
export const GeminiIcon: React.FC<GeminiIconProps> = ({
  name,
  className = '',
  size = 20,
  strokeWidth = 1.7,
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
          {/* Fluid organic 4-point pill star */}
          <path d="M12 3 C12 7.5 15.5 11 20 12 C15.5 13 12 16.5 12 21 C12 16.5 8.5 13 4 12 C8.5 11 12 7.5 12 3 Z" />
        </svg>
      );

    case 'home':
      return (
        <svg {...commonProps}>
          {/* Curved pill arch dome with rounded foundation */}
          <path d="M4 11.5 C4 7.5 7.5 4.5 12 4.5 C16.5 4.5 20 7.5 20 11.5 V17.5 C20 19.4 18.5 20.5 16.5 20.5 H14.5 C13.7 20.5 13 19.8 13 19 V15 C13 14.4 12.6 14 12 14 C11.4 14 11 14.4 11 15 V19 C11 19.8 10.3 20.5 9.5 20.5 H7.5 C5.5 20.5 4 19.4 4 17.5 Z" />
        </svg>
      );

    case 'switch':
      return (
        <svg {...commonProps}>
          {/* Dual curved pill swap arrows */}
          <path d="M4.5 8.5 H16.5 C18.5 8.5 20 10 20 12" />
          <path d="M13.5 5.5 L17.5 8.5 L13.5 11.5" />
          <path d="M19.5 15.5 H7.5 C5.5 15.5 4 14 4 12" />
          <path d="M10.5 18.5 L6.5 15.5 L10.5 12.5" />
        </svg>
      );

    case 'reader':
    case 'book-open':
      return (
        <svg {...commonProps}>
          {/* Curved pill stadium pages */}
          <path d="M3.5 6.5 C5.5 5 8.5 5 12 6.5 C15.5 5 18.5 5 20.5 6.5 V18 C18.5 16.5 15.5 16.5 12 18 C8.5 16.5 5.5 16.5 3.5 18 Z" />
          <path d="M12 6.5 V18" />
        </svg>
      );

    case 'calendar':
      return (
        <svg {...commonProps}>
          {/* Rounded stadium capsule calendar */}
          <rect x="3.5" y="5" width="17" height="15.5" rx="5" />
          <path d="M3.5 10.5 H20.5" />
          <path d="M8 2.5 V5.5" />
          <path d="M16 2.5 V5.5" />
          <circle cx="8.5" cy="14.5" r="1.1" fill="currentColor" />
          <circle cx="12" cy="14.5" r="1.1" fill="currentColor" />
          <circle cx="15.5" cy="14.5" r="1.1" fill="currentColor" />
        </svg>
      );

    case 'zap':
      return (
        <svg {...commonProps}>
          {/* Smooth pill lightning bolt */}
          <path d="M13 2.5 L5 13 C4.6 13.5 5 14.2 5.6 14.2 H11 L9.5 21.5 C9.3 22.1 10.1 22.5 10.5 22 L19 11 C19.4 10.5 19 9.8 18.4 9.8 H13 Z" />
        </svg>
      );

    case 'trophy':
      return (
        <svg {...commonProps}>
          {/* Smooth pill goblet with rounded handles */}
          <path d="M6 8.5 C6 13 8.8 16 12 16 C15.2 16 18 13 18 8.5 V4.5 H6 Z" />
          <path d="M6 6 H3.5 C2.7 6 2 6.7 2 7.5 C2 10.2 3.8 12 6 12" />
          <path d="M18 6 H20.5 C21.3 6 22 6.7 22 7.5 C22 10.2 20.2 12 18 12" />
          <path d="M12 16 V19" />
          <rect x="8" y="19" width="8" height="2.5" rx="1.2" />
        </svg>
      );

    case 'flame':
      return (
        <svg {...commonProps}>
          <path d="M12 2 C12 6.5 8 8.5 8 13.5 C8 17.8 11.5 21.5 16 21.5 C19 21.5 21.5 19.8 22 17 C22 13.8 19 11.8 18 9 C18 12 16 14 14 14 C14 9.8 16.5 6 12 2 Z" />
        </svg>
      );

    case 'blend':
      return (
        <svg {...commonProps}>
          {/* Fluid overlapping pill ellipses */}
          <ellipse cx="9" cy="12" rx="5.5" ry="5" />
          <ellipse cx="15" cy="12" rx="5.5" ry="5" />
          <path d="M12 8.5 C13 10 13 14 12 15.5" />
        </svg>
      );

    case 'chat':
      return (
        <svg {...commonProps}>
          {/* Curved pill speech bubble */}
          <path d="M12 4 C6.8 4 3 7.8 3 12.2 C3 14.5 4 16.5 5.8 18 C5.5 19.6 4.8 20.6 4 21.2 C5.7 21.2 7.6 20.4 8.8 19.6 C9.8 20 10.9 20.2 12 20.2 C17.2 20.2 21 16.4 21 12.2 C21 7.8 17.2 4 12 4 Z" />
        </svg>
      );

    case 'user':
      return (
        <svg {...commonProps}>
          {/* Rounded circular head with pill shoulder contour */}
          <circle cx="12" cy="7.5" r="4" />
          <path d="M4.5 19.5 C4.5 15.8 8 13.5 12 13.5 C16 13.5 19.5 15.8 19.5 19.5" />
        </svg>
      );

    case 'search':
      return (
        <svg {...commonProps}>
          {/* Rounded magnifying capsule */}
          <circle cx="11" cy="11" r="7" />
          <path d="M16.2 16.2 L20.5 20.5" strokeWidth={strokeWidth + 0.3} />
        </svg>
      );

    case 'map':
      return (
        <svg {...commonProps}>
          <path d="M3.5 6.5 L8.5 4 L15.5 7 L20.5 4.5 V18.5 L15.5 21 L8.5 18 L3.5 20.5 Z" />
          <path d="M8.5 4 V18" />
          <path d="M15.5 7 V21" />
        </svg>
      );

    case 'compass':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <polygon points="15.5,8.5 13.5,13.5 8.5,15.5 10.5,10.5" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case 'wallet':
      return (
        <svg {...commonProps}>
          <rect x="3" y="6" width="18" height="13.5" rx="4.5" />
          <path d="M3 10.5 H21" />
          <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" />
        </svg>
      );

    case 'settings':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M19.4 15 C19.5 14.7 19.5 14.3 19.5 14 C19.5 13.7 19.5 13.3 19.4 13 L21.3 11.5 C21.5 11.3 21.5 11.1 21.4 10.9 L19.6 7.8 C19.5 7.6 19.3 7.5 19.1 7.6 L16.8 8.5 C16.3 8.1 15.8 7.8 15.2 7.6 L14.9 5.2 C14.9 4.9 14.7 4.8 14.5 4.8 H10.9 C10.7 4.8 10.5 4.9 10.5 5.2 L10.1 7.6 C9.5 7.8 9 8.1 8.5 8.5 L6.3 7.6 C6.1 7.5 5.9 7.6 5.8 7.8 L4 10.9 C3.9 11.1 3.9 11.3 4.1 11.5 L6 13 C5.9 13.3 5.9 13.7 5.9 14 C5.9 14.3 5.9 14.7 6 15 L4.1 16.5 C3.9 16.7 3.9 16.9 4 17.1 L5.8 20.2 C5.9 20.4 6.1 20.5 6.3 20.4 L8.5 19.5 C9 19.9 9.5 20.2 10.1 20.4 L10.5 22.8 C10.5 23.1 10.7 23.2 10.9 23.2 H14.5 C14.7 23.2 14.9 23.1 14.9 22.8 L15.2 20.4 C15.8 20.2 16.3 19.9 16.8 19.5 L19.1 20.4 C19.3 20.5 19.5 20.4 19.6 20.2 L21.4 17.1 C21.5 16.9 21.5 16.7 21.3 16.5 Z" />
        </svg>
      );

    case 'chevron-right':
      return (
        <svg {...commonProps}>
          <path d="M9 18 L15 12 L9 6" />
        </svg>
      );

    case 'chevron-down':
      return (
        <svg {...commonProps}>
          <path d="M6 9.5 L12 15.5 L18 9.5" />
        </svg>
      );

    case 'close':
      return (
        <svg {...commonProps}>
          <path d="M18 6 L6 18" />
          <path d="M6 6 L18 18" />
        </svg>
      );

    case 'arrow-left':
      return (
        <svg {...commonProps}>
          <path d="M19 12 H5" />
          <path d="M11 18 L5 12 L11 6" />
        </svg>
      );

    case 'arrow-right':
      return (
        <svg {...commonProps}>
          <path d="M5 12 H19" />
          <path d="M13 6 L19 12 L13 18" />
        </svg>
      );

    case 'check':
      return (
        <svg {...commonProps}>
          <path d="M20 6.5 L9 17.5 L4 12.5" />
        </svg>
      );

    case 'check-circle':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 12 L11 14.5 L15.5 9.5" />
        </svg>
      );

    case 'shield':
    case 'shield-check':
      return (
        <svg {...commonProps}>
          <path d="M12 3 C12 3 5 4.5 5 10.5 C5 16.2 9 20 12 21 C15 20 19 16.2 19 10.5 C19 4.5 12 3 12 3 Z" />
          {name === 'shield-check' && <path d="M9 11.5 L11 13.5 L15 9.5" />}
        </svg>
      );

    case 'sun':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5 V4.5" />
          <path d="M12 19.5 V21.5" />
          <path d="M4.5 12 H2.5" />
          <path d="M21.5 12 H19.5" />
          <path d="M5.3 5.3 L6.7 6.7" />
          <path d="M17.3 17.3 L18.7 18.7" />
          <path d="M5.3 18.7 L6.7 17.3" />
          <path d="M17.3 6.7 L18.7 5.3" />
        </svg>
      );

    case 'moon':
      return (
        <svg {...commonProps}>
          <path d="M20.5 13.5 C19.5 18 15 21 10.5 20 C6 19 3 14.5 4 10 C4.5 7.5 6 5.5 8 4.5 C7.5 6 7.5 7.5 8 9 C9 12.5 12.5 14.5 16 13.5 C17.5 13 18.5 12 19 11 C20 11.5 20.5 12.5 20.5 13.5 Z" />
        </svg>
      );

    case 'bookmark':
      return (
        <svg {...commonProps}>
          <path d="M6 4 C6 3.4 6.4 3 7 3 H17 C17.6 3 18 3.4 18 4 V21 L12 17.5 L6 21 Z" />
        </svg>
      );

    case 'trash':
      return (
        <svg {...commonProps}>
          <path d="M4 6.5 H20" />
          <path d="M10 11 V16.5" />
          <path d="M14 11 V16.5" />
          <path d="M6 6.5 L7 19.5 C7.1 20.3 7.8 21 8.6 21 H15.4 C16.2 21 16.9 20.3 17 19.5 L18 6.5" />
          <path d="M9 6.5 V4 C9 3.4 9.4 3 10 3 H14 C14.6 3 15 3.4 15 4 V6.5" />
        </svg>
      );

    case 'copy':
      return (
        <svg {...commonProps}>
          {/* Overlapping rounded stadium sheets */}
          <rect x="8.5" y="8.5" width="11" height="11" rx="3.5" />
          <path d="M5.5 15.5 H4.5 C3.9 15.5 3.5 15.1 3.5 14.5 V4.5 C3.5 3.9 3.9 3.5 4.5 3.5 H14.5 C15.1 3.5 15.5 3.9 15.5 4.5 V5.5" />
        </svg>
      );

    case 'highlight':
      return (
        <svg {...commonProps}>
          <path d="M14.5 3.5 L19.5 8.5 L11.5 16.5 H6.5 V11.5 Z" />
          <path d="M4 21.5 H20" />
        </svg>
      );

    case 'pin':
      return (
        <svg {...commonProps}>
          <path d="M12 21.5 C12 21.5 18 15.5 18 10 C18 6.7 15.3 4 12 4 C8.7 4 6 6.7 6 10 C6 15.5 12 21.5 12 21.5 Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case 'users':
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 18.5 C3 15.5 5.5 13.5 9 13.5 C12.5 13.5 15 15.5 15 18.5" />
          <circle cx="16.5" cy="8.5" r="2.8" />
          <path d="M15.5 13.8 C17.2 14.3 19 15.5 19 18" />
        </svg>
      );

    case 'graduation-cap':
      return (
        <svg {...commonProps}>
          {/* Curved mortarboard with pill tassel */}
          <path d="M2.5 9.5 L12 4.5 L21.5 9.5 L12 14.5 Z" />
          <path d="M6 11.5 V16.5 C6 19 8.7 21 12 21 C15.3 21 18 19 18 16.5 V11.5" />
          <path d="M21.5 9.5 V15" />
        </svg>
      );

    case 'bus':
      return (
        <svg {...commonProps}>
          <rect x="4" y="3.5" width="16" height="15" rx="4.5" />
          <path d="M4 11.5 H20" />
          <circle cx="7.5" cy="15.5" r="1.3" fill="currentColor" />
          <circle cx="16.5" cy="15.5" r="1.3" fill="currentColor" />
          <path d="M6.5 18.5 V21" />
          <path d="M17.5 18.5 V21" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7 V12.2 L15.5 14" />
        </svg>
      );

    case 'filter':
      return (
        <svg {...commonProps}>
          <path d="M3 5 H21 L14 13 V18.5 L10 20.5 V13 Z" />
        </svg>
      );

    case 'two-lines':
      return (
        <svg {...commonProps}>
          <line x1="4" y1="8" x2="20" y2="8" strokeWidth={strokeWidth} />
          <line x1="4" y1="16" x2="20" y2="16" strokeWidth={strokeWidth} />
        </svg>
      );

    case 'volume':
      return (
        <svg {...commonProps}>
          {/* Smooth pill speaker megaphone */}
          <path d="M11 5 L6 9 H3 C2.4 9 2 9.4 2 10 V14 C2 14.6 2.4 15 3 15 H6 L11 19 Z" />
          <path d="M15.5 8.5 C17 10 17 14 15.5 15.5" />
          <path d="M18.5 6 C21 8.5 21 15.5 18.5 18" />
        </svg>
      );

    case 'volume-x':
      return (
        <svg {...commonProps}>
          <path d="M11 5 L6 9 H3 C2.4 9 2 9.4 2 10 V14 C2 14.6 2.4 15 3 15 H6 L11 19 Z" />
          <path d="M16 10 L21 15" />
          <path d="M21 10 L16 15" />
        </svg>
      );

    case 'mic':
      return (
        <svg {...commonProps}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 10 C5 14 8 17 12 17 C16 17 19 14 19 10" />
          <path d="M12 17 V21" />
          <path d="M8.5 21 H15.5" />
        </svg>
      );

    case 'mic-off':
      return (
        <svg {...commonProps}>
          <line x1="2" y1="2" x2="22" y2="22" />
          <path d="M9 3.5 C9 3.2 9.2 3 9.5 3 H14.5 C15.3 3 16 3.7 16 4.5 V10.5 C16 10.8 15.9 11.1 15.7 11.3" />
          <path d="M8.5 8.5 V10.5 C8.5 12.4 10.1 14 12 14 C12.6 14 13.1 13.8 13.6 13.5" />
          <path d="M5 10 C5 13.5 7.5 16.3 11 16.9 V21" />
          <path d="M8 21 H16" />
        </svg>
      );

    case 'loader':
      return (
        <svg {...commonProps} className={`animate-spin ${className}`}>
          <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
          <path d="M12 3 C16.97 3 21 7.03 21 12" strokeWidth={strokeWidth + 0.3} />
        </svg>
      );

    case 'send':
      return (
        <svg {...commonProps}>
          <path d="M21 3 L10 14" />
          <path d="M21 3 L14.5 21 L10 14 L3 9.5 Z" />
        </svg>
      );

    case 'attachment':
      return (
        <svg {...commonProps}>
          <path d="M21.4 11.1 L12.2 20.3 C10.1 22.4 6.7 22.4 4.6 20.3 C2.5 18.2 2.5 14.8 4.6 12.7 L13.8 3.5 C15.2 2.1 17.5 2.1 18.9 3.5 C20.3 4.9 20.3 7.2 18.9 8.6 L9.7 17.8 C8.9 18.6 7.8 18.6 7 17.8 C6.2 17 6.2 15.9 7 15.1 L15.5 6.6" />
        </svg>
      );

    case 'download':
      return (
        <svg {...commonProps}>
          <path d="M12 3.5 V15" />
          <path d="M7 10 L12 15 L17 10" />
          <path d="M4 19.5 C4 20.3 4.7 21 5.5 21 H18.5 C19.3 21 20 20.3 20 19.5" />
        </svg>
      );

    case 'lock':
      return (
        <svg {...commonProps}>
          <rect x="5" y="11" width="14" height="10" rx="3.5" />
          <path d="M8 11 V7 C8 4.8 9.8 3 12 3 C14.2 3 16 4.8 16 7 V11" />
          <circle cx="12" cy="16" r="1.2" fill="currentColor" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...commonProps}>
          <path d="M18 8 A6 6 0 0 0 6 8 C6 15 3 17 3 17 H21 S18 15 18 8" />
          <path d="M10.3 20 A2 2 0 0 0 13.7 20" />
        </svg>
      );

    case 'brain':
      return (
        <svg {...commonProps}>
          <path d="M9.5 4 C7 4 5 6 5 8.5 C5 9.5 5.3 10.4 5.9 11.2 C4.7 12 4 13.4 4 15 C4 17.5 6 19.5 8.5 19.5 H9.5" />
          <path d="M14.5 4 C17 4 19 6 19 8.5 C19 9.5 18.7 10.4 18.1 11.2 C19.3 12 20 13.4 20 15 C20 17.5 18 19.5 15.5 19.5 H14.5" />
          <path d="M12 4 V20" />
          <path d="M8 12 H16" />
        </svg>
      );

    case 'share':
      return (
        <svg {...commonProps}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};
