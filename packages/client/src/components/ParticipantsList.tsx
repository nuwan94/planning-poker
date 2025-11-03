import React from 'react';
import { User, Vote } from '@planning-poker/shared';
import { Users, Eye } from 'lucide-react';
import Avatar from './Avatar';

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



  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            Team Members
          </h3>
          <p className="text-sm text-slate-600">{participants.length} participants</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {participants.map((participant) => {
          const voteStatus = getParticipantVoteStatus(participant);
          const isCurrentUser = participant.id === currentUserId;
          
          return (
            <div
              key={participant.id}
              className="card p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={participant.name} 
                    avatarUrl={participant.avatarUrl}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {participant.name}
                      </p>
                      {isCurrentUser && (
                        <span className="status-badge bg-primary-100 text-primary-800 px-2 py-0.5 text-xs">
                          You
                        </span>
                      )}
                    </div>
                    {participant.isSpectator && (
                      <p className="text-xs text-slate-500 mt-0.5">Spectator</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {voteStatus?.status === 'revealed' && voteStatus.value && (
                    <div className="planning-poker-card w-8 h-12 flex items-center justify-center text-sm font-bold">
                      {voteStatus.value}
                    </div>
                  )}
                  <div className="flex items-center">
                    {voteStatus?.status === 'revealed' && (
                      <div className="status-revealed">
                        <Eye className="w-4 h-4" />
                        Revealed
                      </div>
                    )}
                    {voteStatus?.status === 'voted' && (
                      <div className="status-online">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Voted
                      </div>
                    )}
                    {voteStatus?.status === 'waiting' && (
                      <div className="status-voting">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        Waiting
                      </div>
                    )}
                    {!voteStatus?.status && !isVotingActive && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        Ready
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {isVotingActive && (
        <div className="card p-4 bg-gradient-to-r from-slate-50 to-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
              <span className="font-medium text-slate-700">
                Voting Progress
              </span>
            </div>
            <span className="font-semibold text-slate-900">
              {votes.length} / {participants.filter(p => !p.isSpectator).length}
            </span>
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-slate-600">Voted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600">Waiting</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsList;