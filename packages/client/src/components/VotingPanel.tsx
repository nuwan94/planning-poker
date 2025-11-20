import React from 'react';
import { CARD_DECKS, CardDeck } from '@planning-poker/shared';
import PlanningPokerCard from './PlanningPokerCard';

interface VotingPanelProps {
  selectedDeck: string;
  currentVote: string | null;
  isVotingActive: boolean;
  onVote: (value: string) => void;
}

const VotingPanel: React.FC<VotingPanelProps> = ({
  selectedDeck,
  currentVote,
  isVotingActive,
  onVote
}) => {
  const deck = (Object.values(CARD_DECKS) as unknown as CardDeck[]).find(d => d.id === selectedDeck) || CARD_DECKS.FIBONACCI;

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
    </div>
  );
};

export default VotingPanel;