import React from 'react';
import { Vote, User } from '@planning-poker/shared';
import { BarChart3, TrendingUp, Target } from 'lucide-react';
import { calculateAverage, findMostCommonVote } from '@planning-poker/shared';
import Avatar from './Avatar';

interface VotingResultsProps {
  votes: Vote[];
  participants: User[];
  isRevealed: boolean;
}

const VotingResults: React.FC<VotingResultsProps> = ({
  votes,
  participants,
  isRevealed
}) => {
  if (!isRevealed || votes.length === 0) {
    return null;
  }

  const voteValues = votes.map(v => v.value);
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
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Voting Results
        </h3>
      </div>

      {/* Vote Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Vote Distribution</h4>
        <div className="space-y-2">
          {sortedResults.map(([value, count]) => (
            <div key={value} className="flex items-center">
              <div className="w-12 text-right mr-3">
                <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                  {value}
                </span>
              </div>
              <div className="flex-1 relative">
                <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-primary-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {average !== null && (
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Average</p>
              <p className="text-lg font-bold text-blue-800">
                {average.toFixed(1)}
              </p>
            </div>
          </div>
        )}
        
        {consensus && (
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <Target className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600 font-medium">Consensus</p>
              <p className="text-lg font-bold text-green-800">
                {consensus}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Individual Votes */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Individual Votes</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {votes.map((vote) => {
            const participant = getParticipant(vote.userId);
            return (
              <div
                key={vote.userId}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  {participant && (
                    <Avatar 
                      name={participant.name} 
                      avatarUrl={participant.avatarUrl}
                      size="sm"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {getParticipantName(vote.userId)}
                  </span>
                </div>
                <span className="inline-block px-2 py-1 bg-white rounded text-sm font-mono border">
                  {vote.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consensus Indicator */}
      {consensus && voteCounts[consensus] === votes.length && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium text-center">
            🎉 Perfect Consensus! Everyone voted <span className="font-bold">{consensus}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingResults;