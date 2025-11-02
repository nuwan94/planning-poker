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
      <div className="text-center">
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold text-gray-800">
          Select your estimate
        </h4>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
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
        <div className="mt-6 text-center bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-green-700 font-medium flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You voted: <span className="font-bold ml-1">{currentVote}</span>
          </p>
          <p className="text-sm text-green-600 mt-1">
            Waiting for other team members...
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingPanel;