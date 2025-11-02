import React from 'react';

interface PlanningPokerCardProps {
  value: string;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PlanningPokerCard: React.FC<PlanningPokerCardProps> = ({
  value,
  isSelected = false,
  isRevealed = false,
  onClick,
  disabled = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-16 text-sm',
    md: 'w-16 h-24 text-xl',
    lg: 'w-20 h-32 text-2xl'
  };

  const baseClasses = `planning-poker-card ${sizeClasses[size]} flex items-center justify-center font-bold`;
  const stateClasses = isSelected ? "selected" : "";
  const revealedClasses = isRevealed ? "revealed" : "";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div
      className={`${baseClasses} ${stateClasses} ${revealedClasses} ${disabledClasses}`}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {value}
    </div>
  );
};

export default PlanningPokerCard;