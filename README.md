# Sidereal vs Solar Day Visualizer

An interactive educational visualization that explains why a sidereal day (23h 56m 4s) differs from a solar day (24h 00m 0s).

## Features

### View 1: Overhead Orbital View
- Sun at center with Earth orbiting
- Earth disk with asymmetric rotation pattern
- Location pin showing your chosen spot
- Visual demonstration of the ~4-minute difference
- Reference star line to show sidereal alignment

### View 2: Local Sky Dome
- Spherical sky projection from observer's location
- 40+ bright stars always visible
- Sun with daytime halo effect
- Side-by-side solar and sidereal time clocks
- Drift counter showing accumulated difference

### Interactive Controls
- Play/Pause with variable speed (1x, 10x, 100x, 1000x)
- Time slider to scrub through simulation
- Jump to next sidereal or solar day
- Quick jump buttons (+1 hour, +1 day, +1 week)
- Location picker with presets
- Extensive visual toggles

### Accessibility
- High-contrast mode
- Reduced motion mode
- Keyboard accessible controls

## How It Works

Earth completes one full rotation relative to distant stars in **23 hours, 56 minutes, 4 seconds** — this is a **sidereal day**.

But during that rotation, Earth also moves along its orbit around the Sun (~1°). To face the Sun again (solar noon to solar noon), Earth must rotate that extra ~1°, taking an additional ~4 minutes. This gives us our familiar **24-hour solar day**.

Over a year, this adds up: we experience 366.24 sidereal days but only 365.24 solar days. The "missing" day is the result of Earth's orbital motion.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technology Stack

- React 18 + TypeScript
- Zustand for state management
- HTML Canvas for rendering
- Vite for build tooling

## Astronomy Calculations

All calculations use standard astronomical formulas:
- Sidereal day: 86164 seconds
- Solar day: 86400 seconds
- Tropical year: 365.2422 days
- Obliquity: 23.44°

Coordinate transformations:
- Ecliptic → Equatorial (RA/Dec)
- Equatorial → Horizontal (Alt/Az)
- GMST and LST calculations

## Project Generation

This project was generated using [Claude Code](https://claude.com/claude-code) with the prompt specification from [prompt.md](./prompt.md).

## License

MIT
