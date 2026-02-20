import { useSimulationStore, type StepMode, type DaySpeed } from '../store/simulationStore';
import { SIDEREAL_DAY_SECONDS, SOLAR_DAY_SECONDS } from '../utils/astronomy';

export function AnimationControls() {
  const {
    isPlaying,
    play,
    pause,
    reset,
    stepForward,
    stepMode,
    setStepMode,
    daySpeed,
    setDaySpeed,
    dayCount,
    animateWithinDay,
    setAnimateWithinDay,
  } = useSimulationStore();

  // Calculate drift: difference between solar and sidereal elapsed time
  const driftPerDay = SOLAR_DAY_SECONDS - SIDEREAL_DAY_SECONDS; // ~236 seconds
  const totalDriftSeconds = dayCount * driftPerDay;
  const driftMinutes = (totalDriftSeconds / 60).toFixed(1);

  return (
    <div className="animation-controls">
      <h3>Animation</h3>

      {/* Step mode toggle */}
      <div className="control-row">
        <label>Step mode:</label>
        <div className="step-mode-toggle">
          <button
            className={stepMode === 'solar' ? 'active' : ''}
            onClick={() => setStepMode('solar' as StepMode)}
          >
            Solar Day
          </button>
          <button
            className={stepMode === 'sidereal' ? 'active' : ''}
            onClick={() => setStepMode('sidereal' as StepMode)}
          >
            Sidereal Day
          </button>
        </div>
      </div>

      {/* Play / Pause / Reset / Step */}
      <div className="control-row playback-row">
        <button onClick={isPlaying ? pause : play}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={reset}>⏹ Reset</button>
        <button onClick={stepForward}>+1 Day</button>
      </div>

      {/* Speed presets */}
      <div className="control-row speed-controls">
        <label>Speed (days/s):</label>
        {([1, 5, 30, 120, 365] as DaySpeed[]).map((speed) => (
          <button
            key={speed}
            onClick={() => setDaySpeed(speed)}
            className={daySpeed === speed ? 'active' : ''}
          >
            {speed}
          </button>
        ))}
      </div>

      {/* Intra-day animation toggle */}
      <div className="control-row">
        <label>
          <input
            type="checkbox"
            checked={animateWithinDay}
            onChange={(e) => setAnimateWithinDay(e.target.checked)}
          />
          Animate within day
        </label>
      </div>

      {/* Info display */}
      <div className="info-display">
        <div className="info-item">
          <strong>Day:</strong> {dayCount}
        </div>
        <div className="info-item">
          <strong>Mode:</strong> {stepMode === 'solar' ? 'Solar' : 'Sidereal'} day steps
        </div>
        <div className="info-item">
          Stars drifted {driftMinutes} min
        </div>
      </div>
    </div>
  );
}
