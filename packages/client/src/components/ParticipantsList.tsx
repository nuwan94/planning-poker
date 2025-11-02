import React from 'react';
import { User, Vote } from '@planning-poker/shared';
import { Users, Eye, EyeOff } from 'lucide-react';

interface ParticipantsListProps {
  participants: User[];
  currentUserId?: string;
  votes: Vote[];
  isVotingActive: boolean;
  areVotesRevealed: boolean;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserId,
  votes,
  isVotingActive,
  areVotesRevealed
}) => {
  const getParticipantVoteStatus = (participant: User) => {
    if (!isVotingActive) return null;
    
    const hasVoted = votes.some(vote => vote.userId === participant.id);
    const vote = votes.find(vote => vote.userId === participant.id);
    
    if (areVotesRevealed && vote) {
      return { status: 'revealed', value: vote.value };
    } else if (hasVoted) {
      return { status: 'voted', value: null };
    } else {
      return { status: 'waiting', value: null };
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'revealed':
        return <Eye className="w-4 h-4 text-green-600" />;
      case 'voted':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'waiting':
        return <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>;
      default:
        return <EyeOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string | null, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'border-primary-500 bg-primary-50';
    
    switch (status) {
      case 'revealed':
      case 'voted':
        return 'border-green-200 bg-green-50';
      case 'waiting':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <Users className="w-5 h-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Participants ({participants.length})
        </h3>
      </div>
      
      <div className="space-y-3">
        {participants.map((participant) => {
          const voteStatus = getParticipantVoteStatus(participant);
          const isCurrentUser = participant.id === currentUserId;
          
          return (
            <div
              key={participant.id}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${getStatusColor(voteStatus?.status || null, isCurrentUser)}`}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {participant.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-primary-600 font-medium">
                        (You)
                      </span>
                    )}
                  </p>
                  {participant.isSpectator && (
                    <p className="text-xs text-gray-500">Spectator</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                {voteStatus?.status === 'revealed' && voteStatus.value && (
                  <span className="mr-2 px-2 py-1 bg-white rounded text-sm font-bold border">
                    {voteStatus.value}
                  </span>
                )}
                {getStatusIcon(voteStatus?.status || null)}
              </div>
            </div>
          );
        })}
      </div>
      
      {isVotingActive && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Voted: {votes.length} / {participants.filter(p => !p.isSpectator).length}
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span className="text-gray-600">Voted</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-1"></div>
                <span className="text-gray-600">Waiting</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;