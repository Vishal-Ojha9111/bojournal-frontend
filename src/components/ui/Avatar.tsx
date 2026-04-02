// FILE: src/components/ui/Avatar.tsx
// PURPOSE: Avatar component with image fallback to initials
// API: N/A (UI primitive)

import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = '',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const getInitials = (name: string): string => {
    const names = name.trim().split(' ');
    if (names.length === 0) return '?';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const showImage = src && !imageError;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full overflow-hidden
        bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)]
        flex items-center justify-center
        text-white font-semibold
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="img"
      aria-label={alt || name || 'User avatar'}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name || 'User avatar'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
