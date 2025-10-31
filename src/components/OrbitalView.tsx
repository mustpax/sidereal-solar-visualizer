import { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { calculateEarthState, rad2deg } from '../utils/astronomy';

const CANVAS_SIZE = 600;
const SUN_RADIUS = 30;
const ORBIT_RADIUS = 200;
const EARTH_RADIUS = 20;
const LOCATION_PIN_LENGTH = 8;

export function OrbitalView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTime, options } = useSimulationStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();

    // Translate to center
    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    // Get Earth state
    const earthState = calculateEarthState(currentTime);

    // Draw orbit path
    if (options.showOrbitTrail) {
      ctx.strokeStyle = options.highContrast ? '#ffffff' : '#666666';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, ORBIT_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw reference line to fixed star direction (at angle 0)
    ctx.strokeStyle = options.highContrast ? '#00ffff' : '#4488ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ORBIT_RADIUS * 1.5, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    if (options.showLabels) {
      ctx.fillStyle = options.highContrast ? '#00ffff' : '#4488ff';
      ctx.font = '12px monospace';
      ctx.fillText('★ Reference Star', ORBIT_RADIUS * 1.5 + 10, 5);
    }

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, SUN_RADIUS);
    sunGradient.addColorStop(0, '#ffff88');
    sunGradient.addColorStop(0.7, '#ffbb00');
    sunGradient.addColorStop(1, '#ff8800');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(0, 0, SUN_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw Sun rays
    ctx.strokeStyle = options.highContrast ? '#ffff00' : '#ffaa00';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * SUN_RADIUS, Math.sin(angle) * SUN_RADIUS);
      ctx.lineTo(Math.cos(angle) * (SUN_RADIUS + 10), Math.sin(angle) * (SUN_RADIUS + 10));
      ctx.stroke();
    }

    // Calculate Earth position
    const earthX = Math.cos(earthState.orbitAngle) * ORBIT_RADIUS;
    const earthY = Math.sin(earthState.orbitAngle) * ORBIT_RADIUS;

    // Draw line from Sun to Earth
    ctx.strokeStyle = options.highContrast ? '#ffff00' : 'rgba(255, 170, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(earthX, earthY);
    ctx.stroke();

    // Draw Earth at orbital position
    ctx.save();
    ctx.translate(earthX, earthY);

    // Draw Earth as a disk with asymmetric pattern
    // Blue wedge
    ctx.fillStyle = options.highContrast ? '#0088ff' : '#4488ff';
    ctx.beginPath();
    ctx.arc(0, 0, EARTH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Rotate Earth by sidereal angle
    ctx.rotate(-earthState.siderealAngle); // negative for counter-clockwise

    // Draw green checker pattern (asymmetric marker)
    ctx.fillStyle = options.highContrast ? '#00ff00' : '#44ff88';
    ctx.beginPath();
    ctx.arc(0, 0, EARTH_RADIUS, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Draw small checker squares for more visible rotation
    ctx.fillStyle = options.highContrast ? '#ffffff' : '#ffffff';
    ctx.fillRect(-3, -8, 6, 3);
    ctx.fillRect(-3, 5, 6, 3);

    // Draw location pin (red dot at "noon" position = top of Earth)
    ctx.fillStyle = options.highContrast ? '#ff0000' : '#ff3333';
    ctx.beginPath();
    ctx.arc(0, -EARTH_RADIUS, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw pin line pointing outward
    ctx.strokeStyle = options.highContrast ? '#ff0000' : '#ff3333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -EARTH_RADIUS);
    ctx.lineTo(0, -EARTH_RADIUS - LOCATION_PIN_LENGTH);
    ctx.stroke();

    ctx.restore();

    // Draw angle labels
    if (options.showLabels) {
      // Sidereal angle label
      ctx.save();
      ctx.translate(earthX, earthY);
      ctx.fillStyle = options.highContrast ? '#ffffff' : '#333333';
      ctx.font = '11px monospace';
      const siderealDeg = rad2deg(earthState.siderealAngle).toFixed(1);
      ctx.fillText(`${siderealDeg}°`, EARTH_RADIUS + 10, -10);

      // Orbit angle label
      const orbitDeg = rad2deg(earthState.orbitAngle).toFixed(1);
      ctx.fillText(`orbit: ${orbitDeg}°`, EARTH_RADIUS + 10, 5);
      ctx.restore();
    }

    // Draw rotation tick marks if enabled
    if (options.showRotationTicks) {
      ctx.save();
      ctx.translate(earthX, earthY);

      // Show past rotation positions
      const tickCount = 8;
      for (let i = 0; i < tickCount; i++) {
        const tickAngle = (i * Math.PI * 2) / tickCount;
        const alpha = 0.3 - (i / tickCount) * 0.2;
        ctx.strokeStyle = `rgba(255, 51, 51, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const x1 = Math.cos(tickAngle) * EARTH_RADIUS;
        const y1 = Math.sin(tickAngle) * EARTH_RADIUS;
        const x2 = Math.cos(tickAngle) * (EARTH_RADIUS + 5);
        const y2 = Math.sin(tickAngle) * (EARTH_RADIUS + 5);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  }, [currentTime, options]);

  return (
    <div className="orbital-view">
      <h2>View 1: Overhead Orbital View</h2>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          border: '1px solid #ccc',
          background: '#000000',
        }}
      />
      <div className="view-description">
        <p>
          The pin marks your location. When it realigns with the reference star (blue dashed
          line), one <strong>sidereal day</strong> has passed. When it realigns with the Sun, one{' '}
          <strong>solar day</strong> has passed.
        </p>
      </div>
    </div>
  );
}
