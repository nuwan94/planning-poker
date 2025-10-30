import React from 'react';

interface PlanningPokerCardProps {
  value: string;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const PlanningPokerCard: React.FC<PlanningPokerCardProps> = ({
  value,
  isSelected = false,
  isRevealed = false,
  onClick,
  disabled = false
}) => {
  const baseClasses = "planning-poker-card w-16 h-24 flex items-center justify-center text-xl font-bold";
  const stateClasses = isSelected ? "selected" : "";
  const revealedClasses = isRevealed ? "revealed" : "";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div
      className={`${baseClasses} ${stateClasses} ${revealedClasses} ${disabledClasses}`}
      onClick={disabled ? undefined : onClick}
    >
      {value}
    </div>
  );
};

export default PlanningPokerCard;