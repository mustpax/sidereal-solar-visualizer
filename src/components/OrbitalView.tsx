import { useEffect, useRef } from 'react';
import { useSimulationStore, getEffectiveTime } from '../store/simulationStore';
import { calculateEarthState, rad2deg } from '../utils/astronomy';

const CANVAS_SIZE = 600;
const SUN_RADIUS = 30;
const ORBIT_RADIUS = 200;
const EARTH_RADIUS = 20;
const LOCATION_PIN_LENGTH = 8;

export function OrbitalView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { dayCount, timeOfDay, stepMode, accumulator, animateWithinDay, options } = useSimulationStore();

  const effectiveTime = getEffectiveTime(dayCount, timeOfDay, stepMode, accumulator, animateWithinDay);

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
    const earthState = calculateEarthState(effectiveTime);

    // Draw orbit path (always shown)
    ctx.strokeStyle = options.highContrast ? '#ffffff' : '#666666';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, ORBIT_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

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
    ctx.fillStyle = options.highContrast ? '#0088ff' : '#4488ff';
    ctx.beginPath();
    ctx.arc(0, 0, EARTH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Rotate Earth by sidereal angle. Positive rotation = clockwise on screen,
    // matching the clockwise orbit (canvas y-down). This gives the correct
    // solar day rate (ω_s - ω_o) so the pin stays aligned with the Sun at noon.
    ctx.rotate(earthState.siderealAngle + Math.PI / 2);

    // Draw green checker pattern (asymmetric marker)
    ctx.fillStyle = options.highContrast ? '#00ff00' : '#44ff88';
    ctx.beginPath();
    ctx.arc(0, 0, EARTH_RADIUS, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Draw small checker squares for more visible rotation
    ctx.fillStyle = '#ffffff';
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
      ctx.save();
      ctx.translate(earthX, earthY);
      ctx.fillStyle = options.highContrast ? '#ffffff' : '#333333';
      ctx.font = '11px monospace';
      const siderealDeg = rad2deg(earthState.siderealAngle).toFixed(1);
      ctx.fillText(`${siderealDeg}°`, EARTH_RADIUS + 10, -10);

      const orbitDeg = rad2deg(earthState.orbitAngle).toFixed(1);
      ctx.fillText(`orbit: ${orbitDeg}°`, EARTH_RADIUS + 10, 5);
      ctx.restore();
    }

    ctx.restore();
  }, [effectiveTime, options]);

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
