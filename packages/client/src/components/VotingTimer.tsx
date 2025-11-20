import React, { useEffect, useState } from 'react';
import { TimerState, TIMER } from '@planning-poker/shared';
import { Clock, Pause, Play, Square, AlertCircle, X } from 'lucide-react';

interface VotingTimerProps {
  timer?: TimerState;
  onStart: (duration: number) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isOwner: boolean;
}

const VotingTimer: React.FC<VotingTimerProps> = ({
  timer,
  onStart,
  onPause,
  onResume,
  onStop,
  isOwner
}) => {
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [customDuration, setCustomDuration] = useState('');

  // Audio notification for timer warnings and completion
  useEffect(() => {
    if (!timer) return;

    if (timer.remaining === TIMER.WARNING_THRESHOLD && timer.isActive && !timer.isPaused) {
      // Play warning sound (browser beep)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 200);
    }

    if (timer.remaining === 0 && !timer.isActive) {
      // Play completion sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 800;
      }, 150);
      setTimeout(() => oscillator.stop(), 300);
    }
  }, [timer?.remaining, timer?.isActive, timer?.isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = (duration: number) => {
    onStart(duration);
    setShowTimerModal(false);
    setCustomDuration('');
  };

  const handleCustomStart = () => {
    const duration = parseInt(customDuration);
    if (duration >= TIMER.MIN_DURATION && duration <= TIMER.MAX_DURATION) {
      handleStartTimer(duration);
    }
  };

  const progressPercentage = timer 
    ? ((timer.duration - timer.remaining) / timer.duration) * 100 
    : 0;

  const isWarning = timer && timer.remaining <= TIMER.WARNING_THRESHOLD && timer.remaining > 0;
  const isComplete = timer && timer.remaining === 0;

  return (
    <>
      {/* Compact Timer Display */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-600" />
            <div>
              {timer?.isActive ? (
                <div className="text-center">
                  <div className={`text-2xl font-bold font-mono ${isComplete ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-blue-600'}`}>
                    {formatTime(timer.remaining)}
                  </div>
                  {timer.isPaused && <div className="text-xs text-slate-500">Paused</div>}
                  {isComplete && <div className="text-xs text-rose-600 font-semibold">Time's up!</div>}
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  {isOwner ? 'No timer active' : 'Waiting for timer...'}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {timer?.isActive ? (
              <>
                {isOwner && (
                  <>
                    {timer.isPaused ? (
                      <button
                        onClick={onResume}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Resume timer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={onPause}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        title="Pause timer"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={onStop}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Stop timer"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </>
                )}
              </>
            ) : (
              isOwner && (
                <button
                  onClick={() => setShowTimerModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  title="Start timer"
                >
                  Start Timer
                </button>
              )
            )}
          </div>
        </div>

        {/* Progress bar for active timer */}
        {timer?.isActive && (
          <div className="mt-3">
            <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-linear ${
                  isComplete ? 'bg-rose-500' :
                  isWarning ? 'bg-amber-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Warning message */}
        {isWarning && !timer?.isPaused && (
          <div className="mt-2 flex items-center gap-1.5 text-amber-700 text-xs">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>Less than {TIMER.WARNING_THRESHOLD}s remaining!</span>
          </div>
        )}
      </div>

      {/* Timer Options Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Start Voting Timer</h3>
              <button
                onClick={() => setShowTimerModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Preset durations */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Start</h4>
                <div className="grid grid-cols-2 gap-2">
                  {TIMER.PRESET_DURATIONS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleStartTimer(preset.value)}
                      className="px-4 py-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom duration */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Custom Duration</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={TIMER.MIN_DURATION}
                    max={TIMER.MAX_DURATION}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder={`${TIMER.MIN_DURATION}-${TIMER.MAX_DURATION} seconds`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCustomStart}
                    disabled={
                      !customDuration ||
                      parseInt(customDuration) < TIMER.MIN_DURATION ||
                      parseInt(customDuration) > TIMER.MAX_DURATION
                    }
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Start
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enter duration in seconds ({TIMER.MIN_DURATION}-{TIMER.MAX_DURATION})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VotingTimer;
