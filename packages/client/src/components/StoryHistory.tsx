import React, { useState } from 'react';
import { Story } from '@planning-poker/shared';
import { History, ChevronDown, ChevronUp, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { calculateAverage } from '@planning-poker/shared';

interface StoryHistoryProps {
  stories: Story[];
}

const StoryHistory: React.FC<StoryHistoryProps> = ({ stories }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  if (!stories || stories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-slate-100 rounded-lg mr-3">
            <History className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Story History</h3>
        </div>
        <p className="text-sm text-slate-500 text-center py-8">
          No completed stories yet. Finalize your first story to see it here!
        </p>
      </div>
    );
  }

  const displayedStories = isExpanded ? stories : stories.slice(0, 3);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const toggleStoryDetails = (storyId: string) => {
    setExpandedStory(expandedStory === storyId ? null : storyId);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Story History</h3>
              <p className="text-xs text-slate-600">{stories.length} completed {stories.length === 1 ? 'story' : 'stories'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {displayedStories.map((story, index) => {
            const isStoryExpanded = expandedStory === story.id;
            const voteValues = story.votes.map(v => v.value);
            const average = calculateAverage(voteValues);
            
            return (
              <div
                key={story.id}
                className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
              >
                {/* Story Header */}
                <button
                  onClick={() => toggleStoryDetails(story.id)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-bold text-sm">
                        #{stories.length - index}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{story.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center text-xs text-slate-600">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(story.createdAt)}
                          </div>
                          {average !== null && (
                            <div className="flex items-center text-xs text-slate-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Avg: {average.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        <span className="text-sm font-bold">{story.finalEstimate}</span>
                      </div>
                      {isStoryExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Story Details (Expanded) */}
                {isStoryExpanded && (
                  <div className="px-4 py-3 bg-white border-t border-slate-200">
                    {story.description && (
                      <div className="mb-3">
                        <p className="text-sm text-slate-700">{story.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-600 mb-1">Total Votes</p>
                        <p className="text-lg font-bold text-slate-900">{story.votes.length}</p>
                      </div>
                      {average !== null && (
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-blue-600 mb-1">Average</p>
                          <p className="text-lg font-bold text-blue-900">{average.toFixed(1)}</p>
                        </div>
                      )}
                    </div>

                    {/* Vote Distribution */}
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Vote Distribution</p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.entries(
                          voteValues.reduce((acc: Record<string, number>, vote) => {
                            acc[vote] = (acc[vote] || 0) + 1;
                            return acc;
                          }, {})
                        ) as [string, number][])
                          .sort(([a], [b]) => {
                            const numA = parseFloat(a);
                            const numB = parseFloat(b);
                            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                            return a.localeCompare(b);
                          })
                          .map(([value, count]) => (
                            <div
                              key={value}
                              className="inline-flex items-center bg-slate-100 rounded-md px-2 py-1"
                            >
                              <span className="text-sm font-bold text-slate-800 mr-1">{value}</span>
                              <span className="text-xs text-slate-500">×{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {stories.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show More ({stories.length - 3} more)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryHistory;
