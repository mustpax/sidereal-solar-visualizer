import { useSimulationStore, type StepMode } from '../store/simulationStore';

export function EmbedBothControls() {
  const {
    isPlaying,
    play,
    pause,
    reset,
    stepMode,
    setStepMode,
    daySpeed,
    setDaySpeed,
    dayCount,
  } = useSimulationStore();

  const handleSlow = () => {
    setDaySpeed(1);
    play();
  };

  const handlePlay = () => {
    setDaySpeed(30);
    play();
  };

  const handleFastForward = () => {
    setDaySpeed(120);
    play();
  };

  return (
    <div className="embed-both-controls">
      <div className="step-mode-toggle">
        <button
          className={stepMode === 'solar' ? 'active' : ''}
          onClick={() => setStepMode('solar' as StepMode)}
        >
          Solar
        </button>
        <button
          className={stepMode === 'sidereal' ? 'active' : ''}
          onClick={() => setStepMode('sidereal' as StepMode)}
        >
          Sidereal
        </button>
      </div>

      <div className="playback-buttons">
        <button onClick={reset} title="Reset">⏮</button>
        <button onClick={handleSlow} title="Slow (1 day/s)" className={isPlaying && daySpeed === 1 ? 'active' : ''}>🐢</button>
        {isPlaying ? (
          <button onClick={pause} title="Pause">⏸</button>
        ) : (
          <button onClick={handlePlay} title="Play">▶</button>
        )}
        <button onClick={handleFastForward} title="Fast forward" className={isPlaying && daySpeed === 120 ? 'active' : ''}>⏩</button>
      </div>

      <span className="day-counter">Day {dayCount}</span>
    </div>
  );
}
