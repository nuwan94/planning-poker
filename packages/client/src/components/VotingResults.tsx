import React, { useState } from 'react';
import { Vote, User, CARD_DECKS, CardDeck } from '@planning-poker/shared';
import { BarChart3, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';
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
  const [calledOnUsers, setCalledOnUsers] = useState<string[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  
  // Safety check: ensure votes is an array
  const safeVotes = votes || [];
  
  if (!isRevealed || safeVotes.length === 0) {
    return null;
  }

  const voteValues = safeVotes.map(v => v.value);
  const average = calculateAverage(voteValues);
  const consensus = findMostCommonVote(voteValues);
  
  // Get all possible values from the card deck
  const deckValues = (Object.values(CARD_DECKS) as unknown as CardDeck[]).find(deck => deck.id === cardDeckId)?.values || 
                     CARD_DECKS.FIBONACCI.values;
  
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

  const maxCount = Math.max(...Object.values(voteCounts), 1); // At least 1 to avoid division by zero
  
  // Create results array with all deck values
  const allResults = deckValues.map(value => [value, voteCounts[value] || 0] as [string, number]);

  // Identify outliers (highest and lowest votes, excluding special values)
  const numericVotes = safeVotes.filter(v => isValidCardValue(v.value, cardDeckId));
  const numericValues = numericVotes.map(v => {
    const num = parseFloat(v.value);
    return isNaN(num) ? 0 : num;
  });
  
  const outliers: string[] = [];
  if (numericVotes.length > 2) {
    const minValue = Math.min(...numericValues);
    const maxValue = Math.max(...numericValues);
    
    // Find users who voted min or max (if they're different)
    if (minValue !== maxValue) {
      numericVotes.forEach(vote => {
        const num = parseFloat(vote.value);
        if (num === minValue || num === maxValue) {
          if (!outliers.includes(vote.userId)) {
            outliers.push(vote.userId);
          }
        }
      });
    }
  }
  
  // Get users who haven't been called on yet
  const uncalledOutliers = outliers.filter(id => !calledOnUsers.includes(id));
  const allVoters = safeVotes.map(v => v.userId);
  const uncalledVoters = allVoters.filter(id => !calledOnUsers.includes(id));
  
  const handleCallOnUser = (userId: string) => {
    setCurrentSpeaker(userId);
    if (!calledOnUsers.includes(userId)) {
      setCalledOnUsers([...calledOnUsers, userId]);
    }
  };
  
  const handleNextSpeaker = () => {
    // First priority: uncalled outliers
    if (uncalledOutliers.length > 0) {
      handleCallOnUser(uncalledOutliers[0]);
    } 
    // Second priority: any uncalled voter
    else if (uncalledVoters.length > 0) {
      const randomIndex = Math.floor(Math.random() * uncalledVoters.length);
      handleCallOnUser(uncalledVoters[randomIndex]);
    }
    // If all outliers heard, just close the speaker display
    else {
      setCurrentSpeaker(null);
    }
  };
  
  const handleSkipToEstimate = () => {
    setCurrentSpeaker(null);
    // Owner can proceed to set estimate even if not everyone spoke
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-base font-bold text-slate-900">Voting Results</h3>
            <span className="ml-2 text-xs text-slate-600">({safeVotes.length} {safeVotes.length === 1 ? 'vote' : 'votes'})</span>
          </div>
          
          {/* Perfect Consensus Badge */}
          {consensus && voteCounts[consensus] === safeVotes.length && (
            <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-300">
              <Sparkles className="w-3 h-3 mr-1" />
              <span className="text-xs font-semibold">Consensus!</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Column Chart */}
        <div className="relative">
          {/* Chart Container */}
          <div className="flex items-end justify-around gap-2 h-48 bg-gradient-to-b from-slate-50 to-white rounded-lg p-4 border border-slate-200 overflow-x-auto">
            {allResults.map(([value, count]) => {
              const percentage = count > 0 ? (count / safeVotes.length) * 100 : 0;
              const heightPercentage = count > 0 ? (count / maxCount) * 100 : 0;
              const isHighest = count === maxCount && count > 0;
              const voters = votersByValue[value] || [];
              const hasVotes = count > 0;
              
              return (
                <div key={value} className="flex flex-col items-center flex-1 max-w-[100px] min-w-[60px]">
                  {/* Column */}
                  <div className="w-full flex flex-col items-center mb-2">
                    {/* Count Badge */}
                    {hasVotes && (
                      <div className="mb-1 px-2 py-0.5 bg-slate-700 text-white text-xs font-bold rounded-full">
                        {count}
                      </div>
                    )}
                    
                    {/* 3D Column Bar */}
                    <div className="relative w-full" style={{ height: '120px' }}>
                      {hasVotes ? (
                        <div 
                          className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ease-out overflow-hidden ${
                            isHighest 
                              ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 shadow-lg shadow-blue-500/50' 
                              : 'bg-gradient-to-t from-slate-500 via-slate-400 to-slate-300 shadow-md'
                          }`}
                          style={{ height: `${heightPercentage}%`, minHeight: '40px' }}
                        >
                          {/* 3D Top Effect */}
                          <div className={`absolute -top-1 left-0 right-0 h-2 rounded-t-lg ${
                            isHighest ? 'bg-blue-300' : 'bg-slate-200'
                          }`} style={{ 
                            transform: 'perspective(100px) rotateX(45deg)',
                            transformOrigin: 'bottom'
                          }}></div>
                          
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-lg"></div>
                          
                          {/* Percentage Label */}
                          {heightPercentage > 30 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-bold drop-shadow-lg">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          )}
                          
                          {/* Green Checkmark Button (for owner) */}
                          {isRoomOwner && !finalEstimate && isValidCardValue(value, cardDeckId) && (
                            <button
                              onClick={() => onSetFinalEstimate && onSetFinalEstimate(value)}
                              className="absolute bottom-2 left-1/2 -translate-x-1/2 p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all hover:scale-110 shadow-lg"
                              title={`Set ${value} as final estimate`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Empty column indicator */
                        <div className="absolute bottom-0 w-full h-2 rounded-t-lg bg-slate-200 border-2 border-dashed border-slate-300"></div>
                      )}
                    </div>
                  </div>
                  
                  {/* Value Label - Fixed height for alignment */}
                  <div className={`text-center font-bold text-base mb-2 px-2 py-1 rounded h-8 flex items-center justify-center ${
                    isHighest ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {value}
                  </div>
                  
                  {/* Avatar Group */}
                  <div className="flex items-center justify-center gap-0.5 flex-wrap max-w-full min-h-[32px]">
                    {voters.slice(0, 3).map((userId) => {
                      const participant = getParticipant(userId);
                      if (!participant) return null;
                      return (
                        <div key={userId} className="group relative" title={participant.name}>
                          <Avatar
                            name={participant.name}
                            avatarUrl={participant.avatarUrl}
                            size="sm"
                            className="ring-2 ring-white hover:ring-blue-400 transition-all"
                          />
                        </div>
                      );
                    })}
                    {voters.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center ring-2 ring-white">
                        +{voters.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Discussion Section for Owner */}
        {isRoomOwner && !finalEstimate && (
          <div className="pt-3 border-t border-slate-200">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 text-purple-600 mr-2" />
                  <h4 className="text-sm font-bold text-purple-900">Team Discussion</h4>
                  {outliers.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-200 text-purple-700 text-xs rounded-full font-semibold">
                      {uncalledOutliers.length} outlier{uncalledOutliers.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {currentSpeaker && (
                  <button
                    onClick={handleSkipToEstimate}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Skip to Estimate
                  </button>
                )}
              </div>

              {/* Current Speaker Display */}
              {currentSpeaker ? (
                <div className="bg-white rounded-lg p-3 border-2 border-purple-300 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const speaker = getParticipant(currentSpeaker);
                        if (!speaker) return null;
                        const vote = safeVotes.find(v => v.userId === currentSpeaker);
                        return (
                          <>
                            <Avatar
                              name={speaker.name}
                              avatarUrl={speaker.avatarUrl}
                              size="md"
                              className="ring-2 ring-purple-400"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-purple-900">{speaker.name}</p>
                                {outliers.includes(currentSpeaker) && (
                                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                                    Outlier
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-purple-700">
                                Voted: <span className="font-bold">{vote?.value || 'N/A'}</span>
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <button
                      onClick={handleNextSpeaker}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all text-sm font-medium"
                    >
                      {uncalledOutliers.length > 0 ? 'Next Outlier' : 'Next Person'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleNextSpeaker}
                    disabled={uncalledVoters.length === 0}
                    className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uncalledOutliers.length > 0 
                      ? `Hear from Outliers (${uncalledOutliers.length})` 
                      : uncalledVoters.length > 0
                      ? `Call on Someone (${uncalledVoters.length} remaining)`
                      : 'All team members heard'}
                  </button>
                  {calledOnUsers.length > 0 && uncalledVoters.length > 0 && (
                    <p className="text-xs text-purple-600 text-center">
                      {calledOnUsers.length} heard, {uncalledVoters.length} remaining (optional)
                    </p>
                  )}
                </div>
              )}

              {/* Quick Call Buttons */}
              {!currentSpeaker && uncalledVoters.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-purple-700 mb-2 font-medium">Quick call on:</p>
                  <div className="flex flex-wrap gap-2">
                    {safeVotes.map(vote => {
                      const participant = getParticipant(vote.userId);
                      if (!participant || calledOnUsers.includes(vote.userId)) return null;
                      const isOutlier = outliers.includes(vote.userId);
                      return (
                        <button
                          key={vote.userId}
                          onClick={() => handleCallOnUser(vote.userId)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                            isOutlier
                              ? 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-200'
                              : 'bg-white text-purple-800 border border-purple-300 hover:bg-purple-50'
                          }`}
                          title={participant.name}
                        >
                          <Avatar
                            name={participant.name}
                            avatarUrl={participant.avatarUrl}
                            size="sm"
                            className="scale-75"
                          />
                          <span>{participant.name.split(' ')[0]}</span>
                          <span className="font-bold">({vote.value})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Average Option (if not already in chart) */}
        {isRoomOwner && !finalEstimate && average !== null && (() => {
          const nearestValue = findNearestCardValue(average, cardDeckId);
          const alreadyVoted = allResults.some(([value, count]) => value === nearestValue && count > 0);
          if (!alreadyVoted && isValidCardValue(nearestValue, cardDeckId)) {
            return (
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <span className="text-blue-700 font-medium">Average-based option: </span>
                      <span className="text-blue-900 font-bold text-lg">{nearestValue}</span>
                      <span className="text-blue-600 text-xs ml-1">(from avg: {average.toFixed(1)})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSetFinalEstimate && onSetFinalEstimate(nearestValue)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all font-bold text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Set as Final
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })()}
        
        {/* Hint for owner */}
        {isRoomOwner && !finalEstimate && safeVotes.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-slate-500 text-center">
              💡 Click the green checkmark below any voted value to set it as the final estimate
            </p>
          </div>
        )}

        {/* Show Final Estimate if Set */}
        {finalEstimate && (
          <div className="pt-3 border-t border-slate-200">
            <div className="rounded-lg border border-green-300 bg-green-50 p-4">
              <div className="flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <div className="text-center">
                  <p className="text-xs font-semibold text-green-700 uppercase">Final Estimate</p>
                  <p className="text-3xl font-bold text-green-900">{finalEstimate}</p>
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