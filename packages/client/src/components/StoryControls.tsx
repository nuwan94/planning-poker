import React, { useState } from 'react';
import { Story } from '@planning-poker/shared';
import { FileText, Play, RotateCcw, Eye, Edit3, Check, X } from 'lucide-react';
import VotingPanel from './VotingPanel';
import Button from './Button';

interface StoryControlsProps {
  currentStory: Story | undefined;
  isVotingActive: boolean;
  areVotesRevealed: boolean;
  canRevealVotes: boolean;
  isRoomOwner: boolean;
  onStartVoting: (story: Story) => void;
  onRevealVotes: () => void;
  onClearVotes: () => void;
  onUpdateStory: (storyUpdate: Partial<Story>) => void;
  // Voting panel props
  selectedDeck?: string;
  currentVote?: string | null;
  onVote?: (value: string) => void;
}

const StoryControls: React.FC<StoryControlsProps> = ({
  currentStory,
  isVotingActive,
  areVotesRevealed,
  canRevealVotes,
  isRoomOwner,
  onStartVoting,
  onRevealVotes,
  onClearVotes,
  onUpdateStory,
  selectedDeck,
  currentVote,
  onVote
}) => {
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');

  const handleCreateStory = () => {
    if (!storyTitle.trim()) return;

    const newStory: Story = {
      id: `story_${Date.now()}`,
      title: storyTitle.trim(),
      description: storyDescription.trim() || undefined,
      votes: [],
      isRevealed: false,
      createdAt: new Date()
    };

    onStartVoting(newStory);
    setStoryTitle('');
    setStoryDescription('');
    setIsCreatingStory(false);
  };

  const handleUpdateStory = () => {
    if (!currentStory || !storyTitle.trim()) return;

    onUpdateStory({
      title: storyTitle.trim(),
      description: storyDescription.trim() || undefined
    });

    setIsEditingStory(false);
  };

  const startEditing = () => {
    if (currentStory) {
      setStoryTitle(currentStory.title);
      setStoryDescription(currentStory.description || '');
      setIsEditingStory(true);
    }
  };

  const cancelEditing = () => {
    setIsEditingStory(false);
    setStoryTitle('');
    setStoryDescription('');
  };

  if (isCreatingStory) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-6">
          Create New Story
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="storyTitle" className="block text-sm font-medium text-slate-700 mb-2">
              Story Title *
            </label>
            <input
              id="storyTitle"
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="As a user, I want to..."
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="storyDescription" className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="storyDescription"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
              rows={3}
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
              placeholder="Additional details about the story..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreateStory}
              disabled={!storyTitle.trim()}
              className="flex-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 mr-2" />
              Start Voting
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreatingStory(false);
                setStoryTitle('');
                setStoryDescription('');
              }}
              className="flex-1 flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
      {/* Reveal Votes - Top Right Corner */}
      {currentStory && isVotingActive && !areVotesRevealed && (
        <div className="absolute top-4 right-4 z-10">
          {isRoomOwner && canRevealVotes && (
            <Button
              onClick={onRevealVotes}
              className="flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Reveal Votes
            </Button>
          )}
        </div>
      )}

      {currentStory ? (
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditingStory ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full text-xl font-semibold px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                    rows={3}
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    placeholder="Story description..."
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleUpdateStory}
                      disabled={!storyTitle.trim()}
                      className="text-sm py-1 px-3 flex items-center"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={cancelEditing}
                      className="text-sm py-1 px-3 flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-3">
                    <FileText className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0" />
                    <h3 className="text-xl font-semibold text-slate-900">
                      {currentStory.title}
                    </h3>
                    {isRoomOwner && (
                      <Button
                        variant="ghost"
                        onClick={startEditing}
                        className="ml-2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="Edit story"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {currentStory.description && (
                    <p className="text-slate-600 leading-relaxed">{currentStory.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Voting Panel - shown when voting is active and not revealed */}
          {currentStory && isVotingActive && !areVotesRevealed && selectedDeck && onVote && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <VotingPanel
                selectedDeck={selectedDeck}
                currentVote={currentVote || null}
                isVotingActive={true}
                onVote={onVote}
              />
            </div>
          )}

          {!isEditingStory && (
            <div className="flex flex-wrap gap-3">
              {isRoomOwner && areVotesRevealed && (
                <Button
                  variant="secondary"
                  onClick={onClearVotes}
                  className="flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Revote
                </Button>
              )}

              {/* Message for non-owners */}
              {!isRoomOwner && !areVotesRevealed && canRevealVotes && (
                <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2.5 rounded-lg border border-blue-200">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Waiting for owner to reveal votes...</span>
                </div>
              )}

              {currentStory.finalEstimate && (
                <>
                  <div className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                    <span className="text-sm font-medium">
                      Final Estimate: <span className="font-bold">{currentStory.finalEstimate}</span>
                    </span>
                  </div>
                  
                  {/* Start New Story button for owner */}
                  {isRoomOwner && (
                    <Button
                      onClick={() => setIsCreatingStory(true)}
                      className="flex items-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start New Story
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          {isRoomOwner ? (
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Ready to start planning?
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first story to begin the estimation session with your team
              </p>
              <Button
                onClick={() => setIsCreatingStory(true)}
                className="flex items-center justify-center mx-auto px-6 py-3 text-base"
              >
                <Play className="w-5 h-5 mr-2" />
                Create Story
              </Button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Waiting for a story...
              </h3>
              <p className="text-slate-500">
                The room owner will create a story to start the estimation session
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryControls;