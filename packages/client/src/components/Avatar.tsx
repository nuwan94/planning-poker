import React, { useState } from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // If we have a valid avatar URL and no error, show the image
  if (avatarUrl && !imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Otherwise show initials with gradient background
  return (
    <div
      className={`
        ${sizeClasses[size]} 
        rounded-full bg-gradient-to-br from-primary-500 to-primary-600 
        text-white font-semibold flex items-center justify-center flex-shrink-0
        ${className}
      `}
    >
      {initials}
    </div>
  );
};

export default Avatar;
