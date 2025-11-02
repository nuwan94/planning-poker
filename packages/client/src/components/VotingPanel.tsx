import React from 'react';
import { CARD_DECKS } from '@planning-poker/shared';
import PlanningPokerCard from './PlanningPokerCard';

interface VotingPanelProps {
  selectedDeck: string;
  currentVote: string | null;
  hasVoted: boolean;
  isVotingActive: boolean;
  onVote: (value: string) => void;
}

const VotingPanel: React.FC<VotingPanelProps> = ({
  selectedDeck,
  currentVote,
  hasVoted,
  isVotingActive,
  onVote
}) => {
  const deck = Object.values(CARD_DECKS).find(d => d.id === selectedDeck) || CARD_DECKS.FIBONACCI;

  if (!isVotingActive) {
    return (
      <div className="card p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Waiting for voting to start...
        </h3>
        <p className="text-gray-500">
          The room moderator will begin voting on a story
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Select your estimate
        </h3>
        <span className="text-sm text-gray-500">
          Deck: {deck.name}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {deck.values.map((value) => (
          <PlanningPokerCard
            key={value}
            value={value}
            isSelected={currentVote === value}
            onClick={() => onVote(value)}
            disabled={hasVoted && currentVote !== value}
          />
        ))}
      </div>
      
      {hasVoted && (
        <div className="mt-4 text-center">
          <p className="text-green-600 font-medium">
            ✓ You voted: <span className="font-bold">{currentVote}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Waiting for other team members...
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingPanel;