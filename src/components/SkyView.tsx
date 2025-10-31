import { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import {
  calculateEarthState,
  calculateGMST,
  calculateLST,
  eclipticToEquatorial,
  equatorialToHorizontal,
  formatSiderealTime,
  formatTime,
  deg2rad,
} from '../utils/astronomy';
import { BRIGHT_STARS, getStarSize, getStarOpacity } from '../utils/starCatalog';

const CANVAS_SIZE = 600;
const DOME_RADIUS = 250;

export function SkyView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTime, location, options } = useSimulationStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.save();

    // Translate to center
    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    ctx.translate(centerX, centerY);

    // Background - dark sky
    ctx.fillStyle = options.highContrast ? '#000000' : '#001122';
    ctx.beginPath();
    ctx.arc(0, 0, DOME_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Get current state
    const earthState = calculateEarthState(currentTime);
    const gmst = calculateGMST(currentTime);
    const lst = calculateLST(gmst, location.longitude);

    // Draw horizon circle
    ctx.strokeStyle = options.highContrast ? '#ffffff' : '#888888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, DOME_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Clip to dome
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, DOME_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    // Draw altitude circles if grid enabled
    if (options.showGrid) {
      ctx.strokeStyle = options.highContrast ? 'rgba(255, 255, 255, 0.2)' : 'rgba(136, 136, 136, 0.2)';
      ctx.lineWidth = 1;
      for (let alt = 30; alt <= 60; alt += 30) {
        const r = DOME_RADIUS * Math.cos(deg2rad(alt));
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw azimuth lines
      for (let az = 0; az < 360; az += 45) {
        const angle = deg2rad(az) - Math.PI / 2; // 0 = North = up
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * DOME_RADIUS, Math.sin(angle) * DOME_RADIUS);
        ctx.stroke();
      }
    }

    // Draw stars
    BRIGHT_STARS.forEach((star) => {
      const horizontal = equatorialToHorizontal(star.ra, star.dec, location.latitude, lst);

      // Skip if below horizon
      if (horizontal.altitude < 0) return;

      // Project to 2D using stereographic-like projection
      // altitude 90° = center, altitude 0° = edge
      const r = DOME_RADIUS * (1 - horizontal.altitude / (Math.PI / 2));
      const angle = horizontal.azimuth - Math.PI / 2; // 0 = North = up

      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      // Draw star
      const size = getStarSize(star.magnitude);
      const opacity = getStarOpacity(star.magnitude);

      ctx.fillStyle = options.highContrast
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(200, 200, 255, ${opacity})`;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Draw star glow for brightest stars
      if (star.magnitude < 0.5) {
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        glowGradient.addColorStop(0, `rgba(200, 200, 255, ${opacity * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(200, 200, 255, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label brightest stars
      if (options.showLabels && star.magnitude < 1.0) {
        ctx.fillStyle = options.highContrast ? '#ffffff' : 'rgba(200, 200, 255, 0.8)';
        ctx.font = '9px monospace';
        ctx.fillText(star.name, x + size + 2, y - 2);
      }
    });

    // Draw Sun
    const sunCoords = eclipticToEquatorial(earthState.sunEclipticLon);
    const sunHorizontal = equatorialToHorizontal(sunCoords.ra, sunCoords.dec, location.latitude, lst);

    if (sunHorizontal.altitude > deg2rad(-18)) {
      // Sun is up or twilight
      const sunR = DOME_RADIUS * (1 - Math.max(0, sunHorizontal.altitude) / (Math.PI / 2));
      const sunAngle = sunHorizontal.azimuth - Math.PI / 2;
      const sunX = sunR * Math.cos(sunAngle);
      const sunY = sunR * Math.sin(sunAngle);

      // Draw sun halo (daytime glow)
      if (sunHorizontal.altitude > 0) {
        const haloGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
        haloGradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
        haloGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.1)');
        haloGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = haloGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Sun disk
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 15);
      sunGradient.addColorStop(0, '#ffff88');
      sunGradient.addColorStop(0.7, '#ffdd00');
      sunGradient.addColorStop(1, '#ffaa00');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 15, 0, Math.PI * 2);
      ctx.fill();

      if (options.showLabels) {
        ctx.fillStyle = options.highContrast ? '#ffff00' : '#ffaa00';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('SUN', sunX + 18, sunY + 4);
      }
    }

    ctx.restore(); // Restore from clipping

    // Draw cardinal directions
    ctx.fillStyle = options.highContrast ? '#ffffff' : '#666666';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('N', 0, -DOME_RADIUS - 10);
    ctx.fillText('S', 0, DOME_RADIUS + 20);
    ctx.fillText('E', DOME_RADIUS + 15, 5);
    ctx.fillText('W', -DOME_RADIUS - 15, 5);

    // Draw meridian line if labels enabled
    if (options.showLabels) {
      ctx.strokeStyle = options.highContrast ? 'rgba(255, 255, 0, 0.4)' : 'rgba(136, 136, 136, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, -DOME_RADIUS);
      ctx.lineTo(0, DOME_RADIUS);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = options.highContrast ? '#ffff00' : '#888888';
      ctx.font = '10px monospace';
      ctx.fillText('Meridian', 5, -DOME_RADIUS + 15);
    }

    ctx.restore();
  }, [currentTime, location, options]);

  // Calculate times for display
  const siderealTime = formatSiderealTime(currentTime);
  const solarTime = formatTime(currentTime);
  const driftSeconds = currentTime - (currentTime / 86164) * 86400;
  const driftMinutes = (driftSeconds / 60).toFixed(1);

  return (
    <div className="sky-view">
      <h2>View 2: Local Sky (from {location.name})</h2>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          border: '1px solid #ccc',
          background: '#001122',
        }}
      />
      <div className="time-display">
        <div className="clock">
          <strong>Solar Time:</strong> {solarTime}
        </div>
        <div className="clock">
          <strong>Sidereal Time:</strong> {siderealTime}
        </div>
        <div className="drift">
          <strong>Drift:</strong> {driftMinutes} minutes ahead
        </div>
      </div>
      <div className="view-description">
        <p>
          Stars sweep at the <strong>sidereal rate</strong>. The Sun moves slightly slower. The
          drift counter shows how much sidereal time is ahead of solar time.
        </p>
      </div>
    </div>
  );
}
