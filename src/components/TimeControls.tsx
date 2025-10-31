import { useSimulationStore, PlaySpeed } from '../store/simulationStore';
import { SIDEREAL_DAY_SECONDS, SOLAR_DAY_SECONDS } from '../utils/astronomy';

export function TimeControls() {
  const {
    isPlaying,
    playSpeed,
    currentTime,
    play,
    pause,
    setPlaySpeed,
    setTime,
    jumpToNextSidereal,
    jumpToNextSolar,
    reset,
    toggleMarkers,
    markers,
  } = useSimulationStore();

  const handleSpeedChange = (speed: PlaySpeed) => {
    setPlaySpeed(speed);
  };

  const handleTimeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setTime(newTime);
  };

  const jumpForward = (seconds: number) => {
    setTime(currentTime + seconds);
  };

  const formatDuration = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Max time: 30 days
  const maxTime = 30 * SOLAR_DAY_SECONDS;

  return (
    <div className="time-controls">
      <h3>Time Controls</h3>

      {/* Play/Pause */}
      <div className="control-row">
        <button onClick={isPlaying ? pause : play} className="play-button">
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={reset} className="reset-button">
          ⏹ Reset
        </button>
      </div>

      {/* Speed Controls */}
      <div className="control-row speed-controls">
        <label>Speed:</label>
        {([1, 10, 100, 1000] as PlaySpeed[]).map((speed) => (
          <button
            key={speed}
            onClick={() => handleSpeedChange(speed)}
            className={playSpeed === speed ? 'active' : ''}
          >
            {speed}x
          </button>
        ))}
      </div>

      {/* Time Slider */}
      <div className="control-row time-slider">
        <label>Time: {formatDuration(currentTime)}</label>
        <input
          type="range"
          min="0"
          max={maxTime}
          step="100"
          value={currentTime}
          onChange={handleTimeSlider}
          style={{ width: '100%' }}
        />
      </div>

      {/* Jump Buttons */}
      <div className="control-row jump-buttons">
        <button onClick={jumpToNextSidereal} className="jump-button">
          ⏭ Next Sidereal Day
        </button>
        <button onClick={jumpToNextSolar} className="jump-button">
          ⏭ Next Solar Day
        </button>
      </div>

      {/* Quick jump buttons */}
      <div className="control-row quick-jump">
        <label>Quick jump:</label>
        <button onClick={() => jumpForward(3600)}>+1 hour</button>
        <button onClick={() => jumpForward(86400)}>+1 day</button>
        <button onClick={() => jumpForward(7 * 86400)}>+1 week</button>
      </div>

      {/* Marker toggle */}
      <div className="control-row marker-toggle">
        <label>
          <input type="checkbox" checked={markers.showMarkers} onChange={toggleMarkers} />
          Show day completion markers
        </label>
      </div>

      {/* Info display */}
      <div className="info-display">
        <div className="info-item">
          <strong>Sidereal days elapsed:</strong>{' '}
          {(currentTime / SIDEREAL_DAY_SECONDS).toFixed(2)}
        </div>
        <div className="info-item">
          <strong>Solar days elapsed:</strong> {(currentTime / SOLAR_DAY_SECONDS).toFixed(2)}
        </div>
        <div className="info-item">
          <strong>Difference:</strong>{' '}
          {((currentTime / SIDEREAL_DAY_SECONDS - currentTime / SOLAR_DAY_SECONDS) * 24 * 60).toFixed(1)} minutes
        </div>
      </div>
    </div>
  );
}
