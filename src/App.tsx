import { useEffect } from 'react';
import { useSimulationStore } from './store/simulationStore';
import { OrbitalView } from './components/OrbitalView';
import { SkyView } from './components/SkyView';
import { TimeOfDayClock } from './components/TimeOfDayClock';
import { AnimationControls } from './components/AnimationControls';
import { LocationPicker } from './components/LocationPicker';
import { VisualOptions } from './components/VisualOptions';
import './App.css';

function App() {
  const { tick, options } = useSimulationStore();

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      tick();
      animationFrameId = requestAnimationFrame(animate);
    };

    if (!options.reduceMotion) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // In reduced motion mode, update less frequently
      const interval = setInterval(() => {
        tick();
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [tick, options.reduceMotion]);

  return (
    <div className={`app ${options.highContrast ? 'high-contrast' : ''}`}>
      <header>
        <h1>Sidereal vs Solar Day Visualizer</h1>
        <p className="subtitle">
          Understanding why a sidereal day (23h 56m 4s) differs from a solar day (24h 00m 0s)
        </p>
      </header>

      <div className="main-content">
        <div className="views-container">
          <div className="view-wrapper">
            <OrbitalView />
          </div>
          <div className="view-wrapper">
            <SkyView />
          </div>
        </div>

        <div className="controls-container">
          <TimeOfDayClock />
          <AnimationControls />
          <LocationPicker />
          <VisualOptions />
        </div>
      </div>

      <footer>
        <div className="explanation">
          <h3>Why the Difference?</h3>
          <p>
            Earth completes one full rotation relative to distant stars in{' '}
            <strong>23 hours, 56 minutes, 4 seconds</strong> — this is a <strong>sidereal day</strong>.
          </p>
          <p>
            But during that rotation, Earth also moves along its orbit around the Sun. To face the Sun
            again (solar noon to solar noon), Earth must rotate a bit more — about 1° extra, taking an
            additional ~4 minutes. This gives us our familiar <strong>24-hour solar day</strong>.
          </p>
          <p>
            Over a year, this adds up: we experience 366.24 sidereal days but only 365.24 solar days.
            The "missing" day is the result of Earth's orbital motion.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
