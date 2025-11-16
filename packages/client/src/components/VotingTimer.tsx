import React, { useEffect, useState } from 'react';
import { TimerState, TIMER } from '@planning-poker/shared';
import { Clock, Pause, Play, Square, AlertCircle } from 'lucide-react';

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
  const [showPresets, setShowPresets] = useState(false);
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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
    setShowPresets(false);
    setShowCustomInput(false);
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">
            Voting Timer
          </h3>
        </div>

        {timer?.isActive && (
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                {timer.isPaused ? (
                  <button
                    onClick={onResume}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Resume timer"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Pause timer"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onStop}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Stop timer"
                >
                  <Square className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {timer?.isActive ? (
        <div className="space-y-4">
          {/* Timer display */}
          <div className="text-center">
            <div className={`text-5xl font-bold font-mono tracking-tight ${
              isComplete ? 'text-rose-600' :
              isWarning ? 'text-amber-600 animate-pulse' :
              timer.isPaused ? 'text-slate-400' :
              'text-blue-600'
            }`}>
              {formatTime(timer.remaining)}
            </div>
            {timer.isPaused && (
              <div className="text-sm text-slate-500 mt-2">Paused</div>
            )}
            {isComplete && (
              <div className="text-sm text-rose-600 mt-2 font-semibold">Time's up!</div>
            )}
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-linear ${
                isComplete ? 'bg-rose-500' :
                isWarning ? 'bg-amber-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Warning message */}
          {isWarning && !timer.isPaused && (
            <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Less than {TIMER.WARNING_THRESHOLD} seconds remaining!</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {isOwner ? (
            <>
              {!showPresets && !showCustomInput ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPresets(true)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Start Timer
                  </button>
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Custom
                  </button>
                </div>
              ) : showPresets ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700 mb-2">
                    Select duration:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {TIMER.PRESET_DURATIONS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleStartTimer(preset.value)}
                        className="px-3 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowPresets(false)}
                    className="w-full px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700">
                    Enter duration (seconds):
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={TIMER.MIN_DURATION}
                      max={TIMER.MAX_DURATION}
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder={`${TIMER.MIN_DURATION}-${TIMER.MAX_DURATION}`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleCustomStart}
                      disabled={
                        !customDuration ||
                        parseInt(customDuration) < TIMER.MIN_DURATION ||
                        parseInt(customDuration) > TIMER.MAX_DURATION
                      }
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      Start
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomDuration('');
                    }}
                    className="w-full px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-2">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">
                Waiting for room owner to start timer
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VotingTimer;
