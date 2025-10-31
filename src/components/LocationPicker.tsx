import { useSimulationStore, PRESET_LOCATIONS } from '../store/simulationStore';
import { rad2deg, deg2rad } from '../utils/astronomy';

export function LocationPicker() {
  const { location, setLocation } = useSimulationStore();

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = PRESET_LOCATIONS[e.target.value as keyof typeof PRESET_LOCATIONS];
    if (preset) {
      setLocation(preset.latitude, preset.longitude, preset.name);
    }
  };

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const latDeg = parseFloat(e.target.value);
    setLocation(deg2rad(latDeg), location.longitude, 'Custom');
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lonDeg = parseFloat(e.target.value);
    setLocation(location.latitude, deg2rad(lonDeg), 'Custom');
  };

  return (
    <div className="location-picker">
      <h3>Observer Location</h3>

      {/* Preset locations */}
      <div className="control-row">
        <label>Preset:</label>
        <select onChange={handlePresetChange} value={location.name}>
          {Object.keys(PRESET_LOCATIONS).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Custom latitude */}
      <div className="control-row">
        <label>Latitude: {rad2deg(location.latitude).toFixed(2)}°</label>
        <input
          type="range"
          min="-90"
          max="90"
          step="1"
          value={rad2deg(location.latitude)}
          onChange={handleLatitudeChange}
          style={{ width: '100%' }}
        />
      </div>

      {/* Custom longitude */}
      <div className="control-row">
        <label>Longitude: {rad2deg(location.longitude).toFixed(2)}°</label>
        <input
          type="range"
          min="-180"
          max="180"
          step="1"
          value={rad2deg(location.longitude)}
          onChange={handleLongitudeChange}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
