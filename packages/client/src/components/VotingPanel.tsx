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
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">
          Waiting for voting...
        </h3>
        <p className="text-xs text-slate-500">
          Story voting will begin soon
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold text-slate-900">
          Your Estimate
        </h4>
        <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          {deck.name}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {deck.values.map((value) => (
          <PlanningPokerCard
            key={value}
            value={value}
            isSelected={currentVote === value}
            onClick={() => onVote(value)}
            disabled={false}
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
          <p className="text-xs text-green-600 mt-1">
            You can change your vote anytime before reveal
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingPanel;