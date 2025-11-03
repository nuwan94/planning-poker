import React from 'react';
import { Vote, User } from '@planning-poker/shared';
import { BarChart3, TrendingUp, Target, CheckCircle2, Users, Sparkles } from 'lucide-react';
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
  
  // Count votes by value
  const voteCounts = voteValues.reduce((acc, vote) => {
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(voteCounts));
  const sortedResults = Object.entries(voteCounts)
    .sort(([a], [b]) => {
      // Sort numerically if both are numbers, otherwise alphabetically
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });

  const getParticipantName = (userId: string) => {
    return participants.find(p => p.id === userId)?.name || 'Unknown';
  };

  const getParticipant = (userId: string) => {
    return participants.find(p => p.id === userId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Voting Results</h3>
              <p className="text-xs text-slate-600">{safeVotes.length} {safeVotes.length === 1 ? 'vote' : 'votes'} submitted</p>
            </div>
          </div>
          
          {/* Perfect Consensus Badge */}
          {consensus && voteCounts[consensus] === safeVotes.length && (
            <div className="flex items-center bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-300">
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-semibold">Perfect Consensus!</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {average !== null && (
            <div className="relative overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg mr-3 shadow-sm">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-0.5">Average</p>
                    <p className="text-3xl font-bold text-blue-900">{average.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <TrendingUp className="w-24 h-24 text-blue-600" />
              </div>
            </div>
          )}
          
          {consensus && (
            <div className="relative overflow-hidden rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-lg mr-3 shadow-sm">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-0.5">Most Common</p>
                    <p className="text-3xl font-bold text-green-900">{consensus}</p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {voteCounts[consensus]} {voteCounts[consensus] === 1 ? 'vote' : 'votes'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Target className="w-24 h-24 text-green-600" />
              </div>
            </div>
          )}
        </div>

        {/* Vote Distribution */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Vote Distribution</h4>
          <div className="space-y-3">
            {sortedResults.map(([value, count]) => {
              const percentage = (count / safeVotes.length) * 100;
              const isHighest = count === maxCount;
              return (
                <div key={value} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700">{value}</span>
                    <span className="text-xs text-slate-500 font-medium">{count} {count === 1 ? 'vote' : 'votes'} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="relative bg-slate-100 rounded-full h-8 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end ${
                        isHighest 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                          : 'bg-gradient-to-r from-slate-400 to-slate-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 15 && (
                        <span className="text-white text-xs font-bold mr-3 drop-shadow">
                          {value}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Votes */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center">
            <Users className="w-4 h-4 mr-1.5" />
            Team Votes
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {safeVotes.map((vote) => {
              const participant = getParticipant(vote.userId);
              return (
                <div
                  key={vote.userId}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {participant && (
                      <Avatar 
                        name={participant.name} 
                        avatarUrl={participant.avatarUrl}
                        size="sm"
                      />
                    )}
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {getParticipantName(vote.userId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border-2 border-slate-300 shadow-sm">
                    <span className="text-base font-bold text-slate-800">{vote.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Estimate Selection for Owner */}
        {isRoomOwner && onSetFinalEstimate && !finalEstimate && (
          <div className="pt-6 border-t-2 border-slate-200">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
              <div className="flex items-start mb-4">
                <div className="p-2 bg-amber-500 rounded-lg mr-3">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-amber-900 mb-1">Set Final Estimate</h4>
                  <p className="text-sm text-amber-700">Choose a valid value from your deck as the final estimate</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Only show valid card values from voted values (excluding ? and ☕) */}
                {sortedResults
                  .filter(([value]) => isValidCardValue(value, cardDeckId))
                  .map(([value]) => (
                    <button
                      key={value}
                      onClick={() => onSetFinalEstimate(value)}
                      className="px-5 py-2.5 bg-white border-2 border-amber-300 text-amber-800 rounded-lg hover:bg-amber-500 hover:text-white hover:border-amber-600 hover:scale-105 transition-all font-bold text-sm shadow-sm hover:shadow-md"
                    >
                      {value}
                    </button>
                  ))}
                {/* Show rounded average if it exists and differs from voted values */}
                {average !== null && (() => {
                  const nearestValue = findNearestCardValue(average, cardDeckId);
                  // Only show if it's not already in the voted values
                  const alreadyVoted = sortedResults.some(([value]) => value === nearestValue);
                  if (!alreadyVoted) {
                    return (
                      <button
                        onClick={() => onSetFinalEstimate(nearestValue)}
                        className="px-5 py-2.5 bg-blue-500 border-2 border-blue-600 text-white rounded-lg hover:bg-blue-600 hover:border-blue-700 hover:scale-105 transition-all font-bold text-sm shadow-sm hover:shadow-md"
                      >
                        Nearest to Avg: {nearestValue}
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
              {sortedResults.some(([value]) => !isValidCardValue(value, cardDeckId)) && (
                <p className="text-xs text-amber-600 mt-3">
                  ⚠️ Special values (?, ☕) are excluded from final estimate options
                </p>
              )}
            </div>
          </div>
        )}

        {/* Show Final Estimate if Set */}
        {finalEstimate && (
          <div className="pt-6 border-t-2 border-slate-200">
            <div className="relative overflow-hidden rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
              <div className="flex items-center justify-center">
                <div className="p-3 bg-green-500 rounded-full mr-4 shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">Final Estimate</p>
                  <p className="text-5xl font-bold text-green-900">{finalEstimate}</p>
                  <p className="text-xs text-green-600 mt-1">Story points finalized</p>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-5">
                <CheckCircle2 className="w-40 h-40 text-green-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingResults;