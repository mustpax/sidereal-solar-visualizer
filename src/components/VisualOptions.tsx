import { useSimulationStore } from '../store/simulationStore';

export function VisualOptions() {
  const { options, updateOptions } = useSimulationStore();

  const handleToggle = (key: keyof typeof options) => {
    updateOptions({ [key]: !options[key] });
  };

  return (
    <div className="visual-options">
      <h3>Display Options</h3>

      <div className="options-grid">
        <label>
          <input
            type="checkbox"
            checked={options.showLabels}
            onChange={() => handleToggle('showLabels')}
          />
          Labels
        </label>

        <label>
          <input
            type="checkbox"
            checked={options.showGrid}
            onChange={() => handleToggle('showGrid')}
          />
          Sky grid
        </label>

        <label>
          <input
            type="checkbox"
            checked={options.highContrast}
            onChange={() => handleToggle('highContrast')}
          />
          High contrast
        </label>

        <label>
          <input
            type="checkbox"
            checked={options.reduceMotion}
            onChange={() => handleToggle('reduceMotion')}
          />
          Reduce motion
        </label>
      </div>
    </div>
  );
}
