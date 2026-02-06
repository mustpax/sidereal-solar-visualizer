import { useRef, useEffect, useCallback } from 'react';
import { useSimulationStore } from '../store/simulationStore';

const CLOCK_SIZE = 180;
const CENTER = CLOCK_SIZE / 2;
const FACE_RADIUS = 72;
const POINTER_SIZE = 10;

function formatTimeOfDay(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  let hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export function TimeOfDayClock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const { timeOfDay, setTimeOfDay, options } = useSimulationStore();

  // Rotation so that the current time-of-day is at the top (under the pointer).
  // Noon (43200) → rotation 0 (sun at top), midnight (0) → rotation PI (moon at top).
  const angleFromTime = (t: number) => Math.PI - (t / 86400) * Math.PI * 2;

  const timeFromAngle = (angle: number) => {
    // angle is measured from top (12 o'clock), clockwise positive via atan2(x, -y)
    // Map: top (0) → noon, bottom (PI) → midnight, right (PI/2) → 6 PM
    let time = ((angle / (Math.PI * 2)) * 86400 + 43200) % 86400;
    if (time < 0) time += 86400;
    return time;
  };

  const getAngleFromMouse = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left - CENTER;
    const y = clientY - rect.top - CENTER;
    return Math.atan2(x, -y); // angle from top, clockwise positive
  }, []);

  // Draw the clock face
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CLOCK_SIZE, CLOCK_SIZE);
    ctx.save();
    ctx.translate(CENTER, CENTER);

    const rotation = angleFromTime(timeOfDay);

    // Draw rotating face
    ctx.save();
    ctx.rotate(rotation);

    // Day half (top = noon side when timeOfDay is noon)
    // Top half: blue sky
    ctx.beginPath();
    ctx.arc(0, 0, FACE_RADIUS, Math.PI, 0); // top semicircle
    ctx.closePath();
    ctx.fillStyle = options.highContrast ? '#0044aa' : '#2266bb';
    ctx.fill();

    // Bottom half: dark night
    ctx.beginPath();
    ctx.arc(0, 0, FACE_RADIUS, 0, Math.PI); // bottom semicircle
    ctx.closePath();
    ctx.fillStyle = options.highContrast ? '#000033' : '#0a0e27';
    ctx.fill();

    // Subtle gradient transition at horizons
    const horizonGrad = ctx.createLinearGradient(-FACE_RADIUS, 0, FACE_RADIUS, 0);
    horizonGrad.addColorStop(0, 'rgba(255, 140, 50, 0.3)');
    horizonGrad.addColorStop(0.15, 'rgba(255, 140, 50, 0)');
    horizonGrad.addColorStop(0.85, 'rgba(255, 140, 50, 0)');
    horizonGrad.addColorStop(1, 'rgba(255, 140, 50, 0.3)');
    ctx.fillStyle = horizonGrad;
    ctx.beginPath();
    ctx.arc(0, 0, FACE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw sun icon at top (noon position)
    ctx.fillStyle = '#ffdd44';
    ctx.beginPath();
    ctx.arc(0, -FACE_RADIUS + 20, 12, 0, Math.PI * 2);
    ctx.fill();
    // Sun rays
    ctx.strokeStyle = '#ffdd44';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 14 + 0, Math.sin(a) * 14 + (-FACE_RADIUS + 20));
      ctx.lineTo(Math.cos(a) * 18 + 0, Math.sin(a) * 18 + (-FACE_RADIUS + 20));
      ctx.stroke();
    }

    // Draw moon icon at bottom (midnight position)
    ctx.fillStyle = '#ddddcc';
    ctx.beginPath();
    ctx.arc(0, FACE_RADIUS - 20, 10, 0, Math.PI * 2);
    ctx.fill();
    // Moon crescent shadow
    ctx.fillStyle = options.highContrast ? '#000033' : '#0a0e27';
    ctx.beginPath();
    ctx.arc(4, FACE_RADIUS - 21, 8, 0, Math.PI * 2);
    ctx.fill();

    // Small stars on night side
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const starPositions = [
      [-20, FACE_RADIUS - 40], [15, FACE_RADIUS - 35],
      [-30, FACE_RADIUS - 15], [25, FACE_RADIUS - 50],
      [-10, FACE_RADIUS - 55], [35, FACE_RADIUS - 25],
    ];
    for (const [sx, sy] of starPositions) {
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hour tick marks around the edge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let h = 0; h < 24; h++) {
      // noon (h=12) at top (-PI), midnight (h=0) at bottom (0)
      const tickAngle = ((h / 24) * Math.PI * 2) - Math.PI;
      const inner = FACE_RADIUS - 6;
      const outer = FACE_RADIUS - (h % 6 === 0 ? 0 : 3);
      ctx.beginPath();
      ctx.moveTo(Math.cos(tickAngle) * inner, Math.sin(tickAngle) * inner);
      ctx.lineTo(Math.cos(tickAngle) * outer, Math.sin(tickAngle) * outer);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = options.highContrast ? '#ffffff' : '#556688';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, FACE_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore(); // end rotation

    // Fixed pointer at top (triangle)
    ctx.fillStyle = options.highContrast ? '#ff0000' : '#ff4444';
    ctx.beginPath();
    ctx.moveTo(0, -FACE_RADIUS - POINTER_SIZE);
    ctx.lineTo(-POINTER_SIZE / 2, -FACE_RADIUS - 1);
    ctx.lineTo(POINTER_SIZE / 2, -FACE_RADIUS - 1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }, [timeOfDay, options.highContrast]);

  // Mouse/touch interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const angle = getAngleFromMouse(e);
      setTimeOfDay(timeFromAngle(angle));
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const angle = getAngleFromMouse(e);
      setTimeOfDay(timeFromAngle(angle));
    };

    const handleEnd = () => {
      isDragging.current = false;
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('touchstart', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [getAngleFromMouse, setTimeOfDay]);

  return (
    <div className="time-of-day-clock">
      <h3>Time of Day</h3>
      <canvas
        ref={canvasRef}
        width={CLOCK_SIZE}
        height={CLOCK_SIZE}
        style={{ cursor: 'grab' }}
      />
      <div className="clock-time-label">{formatTimeOfDay(timeOfDay)}</div>
    </div>
  );
}
