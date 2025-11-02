import React, { useState } from 'react';
import { Story } from '@planning-poker/shared';
import { FileText, Play, RotateCcw, Eye, Edit3, Check, X } from 'lucide-react';

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
  onUpdateStory
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
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Create New Story
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="storyTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Story Title *
            </label>
            <input
              id="storyTitle"
              type="text"
              className="input-field"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="As a user, I want to..."
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="storyDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="storyDescription"
              className="input-field h-20 resize-none"
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
              placeholder="Additional details about the story..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateStory}
              disabled={!storyTitle.trim()}
              className="btn-primary flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Start Voting
            </button>
            <button
              onClick={() => {
                setIsCreatingStory(false);
                setStoryTitle('');
                setStoryDescription('');
              }}
              className="btn-secondary flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {currentStory ? (
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {isEditingStory ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="input-field text-lg font-semibold"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                  />
                  <textarea
                    className="input-field h-16 resize-none"
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    placeholder="Story description..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateStory}
                      disabled={!storyTitle.trim()}
                      className="btn-primary text-sm py-1 px-3 flex items-center"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="btn-secondary text-sm py-1 px-3 flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-primary-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {currentStory.title}
                    </h3>
                    {isRoomOwner && (
                      <button
                        onClick={startEditing}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit story"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {currentStory.description && (
                    <p className="text-gray-600 mb-4">{currentStory.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isEditingStory && (
            <div className="flex flex-wrap gap-3">
              {isVotingActive && !areVotesRevealed && canRevealVotes && (
                <button
                  onClick={onRevealVotes}
                  className="btn-primary flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Reveal Votes
                </button>
              )}
              
              {areVotesRevealed && (
                <button
                  onClick={onClearVotes}
                  className="btn-secondary flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Votes
                </button>
              )}

              {currentStory.finalEstimate && (
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium">
                    Final Estimate: <span className="font-bold">{currentStory.finalEstimate}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          {isRoomOwner ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Ready to start planning?
              </h3>
              <p className="text-gray-600 mb-4">
                Create a story to begin voting with your team
              </p>
              <button
                onClick={() => setIsCreatingStory(true)}
                className="btn-primary flex items-center mx-auto"
              >
                <Play className="w-4 h-4 mr-2" />
                Create Story
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Waiting for a story...
              </h3>
              <p className="text-gray-500">
                The room moderator will create a story to start voting
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryControls;