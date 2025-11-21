import React from 'react';
import { Vote, User } from '@planning-poker/shared';
import { TrendingUp, CheckCircle2, Sparkles, Users } from 'lucide-react';
import { calculateAverage, findMostCommonVote, isValidCardValue, findNearestCardValue } from '@planning-poker/shared';
import Avatar from './Avatar';

interface VotingResultsProps {
  votes: Vote[];
  participants: User[];
  isRevealed: boolean;
  isRoomOwner?: boolean;
  finalEstimate?: string;
  cardDeckId?: string;
  onSetFinalEstimate?: (estimate: string) => void;
}

const VotingResults: React.FC<VotingResultsProps> = ({
  votes,
  participants,
  isRevealed,
  isRoomOwner = false,
  finalEstimate,
  cardDeckId = 'fibonacci',
  onSetFinalEstimate
}) => {
  // Safety check: ensure votes is an array
  const safeVotes = votes || [];
  
  if (!isRevealed || safeVotes.length === 0) {
    return null;
  }

  const voteValues = safeVotes.map(v => v.value);
  const average = calculateAverage(voteValues);
  const consensus = findMostCommonVote(voteValues);
  
  // Count votes by value and group voters
  const voteCounts: Record<string, number> = voteValues.reduce((acc, vote) => {
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
  }, {});

  // Group voters by their vote value
  const votersByValue = safeVotes.reduce((acc, vote) => {
    if (!acc[vote.value]) {
      acc[vote.value] = [];
    }
    acc[vote.value].push(vote.userId);
    return acc;
  }, {} as Record<string, string[]>);

  const getParticipant = (userId: string) => {
    return participants.find(p => p.id === userId);
  };

  // Only get voted values (filter out non-voted options)
  const votedResults = Object.entries(voteCounts)
    .filter(([_, count]) => count > 0)
    .map(([value, count]) => ({ value, count, voters: votersByValue[value] || [] }))
    .sort((a, b) => {
      // Sort by numeric value if possible, otherwise alphabetically
      const aNum = parseFloat(a.value);
      const bNum = parseFloat(b.value);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.value.localeCompare(b.value);
    });

  const maxCount = Math.max(...votedResults.map(r => r.count), 1);
  const totalVotes = safeVotes.length;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Voting Results</h3>
              <p className="text-sm text-slate-600">{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast</p>
            </div>
          </div>
          
          {/* Perfect Consensus Badge */}
          {consensus && voteCounts[consensus] === totalVotes && (
            <div className="flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full border border-green-300 shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-bold">Perfect Consensus!</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Vote Cards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {votedResults.map(({ value, count, voters }) => {
            const percentage = (count / totalVotes) * 100;
            const isHighest = count === maxCount;
            
            return (
              <div
                key={value}
                className={`relative rounded-lg border-2 transition-all ${
                  isHighest 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Value Display */}
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-16 h-16 rounded-xl font-bold text-2xl ${
                        isHighest 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {value}
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">{count}</span>
                          <span className="text-sm text-slate-600">{count === 1 ? 'vote' : 'votes'}</span>
                          {isHighest && count > 1 && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                              Most Popular
                            </span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2 w-48">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isHighest ? 'bg-blue-600' : 'bg-slate-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{percentage.toFixed(0)}% of votes</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Voters and Action */}
                    <div className="flex items-center gap-4">
                      {/* Voters List */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Users className="w-3 h-3" />
                          <span>Voted by:</span>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap justify-end max-w-[300px]">
                          {voters.map((userId) => {
                            const participant = getParticipant(userId);
                            if (!participant) return null;
                            return (
                              <div key={userId} className="group relative" title={participant.name}>
                                <Avatar
                                  name={participant.name}
                                  avatarUrl={participant.avatarUrl}
                                  size="md"
                                  className="ring-2 ring-white hover:ring-blue-400 transition-all"
                                />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  {participant.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Set as Final Button */}
                      {isRoomOwner && !finalEstimate && isValidCardValue(value, cardDeckId) && (
                        <button
                          onClick={() => onSetFinalEstimate && onSetFinalEstimate(value)}
                          className="flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg"
                          title={`Set ${value} as final estimate`}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Set Final</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistics Summary */}
        {average !== null && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Average</p>
              <p className="text-2xl font-bold text-slate-900">{average.toFixed(1)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Consensus</p>
              <p className="text-2xl font-bold text-slate-900">{consensus || 'None'}</p>
            </div>
          </div>
        )}

        {/* Average-based Suggestion */}
        {isRoomOwner && !finalEstimate && average !== null && (() => {
          const nearestValue = findNearestCardValue(average, cardDeckId);
          const alreadyVoted = votedResults.some(r => r.value === nearestValue);
          if (!alreadyVoted && isValidCardValue(nearestValue, cardDeckId)) {
            return (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Suggested Estimate</p>
                      <p className="text-xs text-amber-700">Based on average: {average.toFixed(1)}</p>
                    </div>
                    <div className="text-3xl font-bold text-amber-900 ml-4">{nearestValue}</div>
                  </div>
                  <button
                    onClick={() => onSetFinalEstimate && onSetFinalEstimate(nearestValue)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all font-semibold text-sm shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Use This
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Show Final Estimate if Set */}
        {finalEstimate && (
          <div className="pt-4 border-t border-slate-200">
            <div className="rounded-xl border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-md">
              <div className="flex items-center justify-center gap-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-green-700 uppercase mb-1">Final Estimate</p>
                  <p className="text-5xl font-bold text-green-900">{finalEstimate}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingResults;