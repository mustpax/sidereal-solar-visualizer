import { create } from 'zustand';
import {
  SIDEREAL_DAY_SECONDS,
  SOLAR_DAY_SECONDS,
  deg2rad,
} from '../utils/astronomy';

export type StepMode = 'solar' | 'sidereal';
export type DaySpeed = 1 | 5 | 20;

export interface LocationState {
  latitude: number; // radians
  longitude: number; // radians
  name: string;
}

export interface VisualOptions {
  showLabels: boolean;
  showGrid: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
}

interface SimulationState {
  // Day-stepping state
  timeOfDay: number; // seconds within a day (0-86400), set by clock dial
  dayCount: number; // integer day counter
  stepMode: StepMode; // solar or sidereal stepping
  daySpeed: DaySpeed; // days per real second
  accumulator: number; // fractional day accumulator for smooth stepping
  isPlaying: boolean;
  lastUpdateTimestamp: number;

  // Location
  location: LocationState;

  // Visual options
  options: VisualOptions;

  // Actions
  play: () => void;
  pause: () => void;
  setTimeOfDay: (time: number) => void;
  setStepMode: (mode: StepMode) => void;
  setDaySpeed: (speed: DaySpeed) => void;
  tick: () => void;
  reset: () => void;
  setLocation: (lat: number, lon: number, name: string) => void;
  updateOptions: (options: Partial<VisualOptions>) => void;
}

// Preset locations
export const PRESET_LOCATIONS = {
  'Greenwich, UK': { latitude: deg2rad(51.48), longitude: deg2rad(0), name: 'Greenwich, UK' },
  'New York, USA': { latitude: deg2rad(40.71), longitude: deg2rad(-74.01), name: 'New York, USA' },
  'Tokyo, Japan': { latitude: deg2rad(35.68), longitude: deg2rad(139.65), name: 'Tokyo, Japan' },
  'Sydney, Australia': { latitude: deg2rad(-33.87), longitude: deg2rad(151.21), name: 'Sydney, Australia' },
  'Cairo, Egypt': { latitude: deg2rad(30.04), longitude: deg2rad(31.24), name: 'Cairo, Egypt' },
  'Equator': { latitude: deg2rad(0), longitude: deg2rad(0), name: 'Equator' },
  'North Pole': { latitude: deg2rad(90), longitude: deg2rad(0), name: 'North Pole' },
};

const DEFAULT_OPTIONS: VisualOptions = {
  showLabels: true,
  showGrid: true,
  highContrast: false,
  reduceMotion: false,
};

/**
 * Compute effective simulation time from dayCount, timeOfDay, and stepMode.
 * Each animation frame shows the same moment (timeOfDay) one day later.
 * The step size is either a solar day or sidereal day.
 */
export function getEffectiveTime(dayCount: number, timeOfDay: number, stepMode: StepMode): number {
  const stepSize = stepMode === 'solar' ? SOLAR_DAY_SECONDS : SIDEREAL_DAY_SECONDS;
  return dayCount * stepSize + timeOfDay;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  timeOfDay: 43200, // noon
  dayCount: 0,
  stepMode: 'solar',
  daySpeed: 1,
  accumulator: 0,
  isPlaying: false,
  lastUpdateTimestamp: Date.now(),
  location: PRESET_LOCATIONS['Equator'],
  options: DEFAULT_OPTIONS,

  // Actions
  play: () => {
    set({ isPlaying: true, accumulator: 0, lastUpdateTimestamp: Date.now() });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  setTimeOfDay: (time: number) => {
    set({ timeOfDay: Math.max(0, Math.min(86400, time)) });
  },

  setStepMode: (mode: StepMode) => {
    set({ stepMode: mode });
  },

  setDaySpeed: (speed: DaySpeed) => {
    set({ daySpeed: speed });
  },

  tick: () => {
    const state = get();
    if (!state.isPlaying) return;

    const now = Date.now();
    const realDelta = (now - state.lastUpdateTimestamp) / 1000; // real seconds elapsed

    // Accumulate fractional days
    const newAccumulator = state.accumulator + realDelta * state.daySpeed;
    const wholeDays = Math.floor(newAccumulator);

    if (wholeDays > 0) {
      set({
        dayCount: state.dayCount + wholeDays,
        accumulator: newAccumulator - wholeDays,
        lastUpdateTimestamp: now,
      });
    } else {
      set({
        accumulator: newAccumulator,
        lastUpdateTimestamp: now,
      });
    }
  },

  reset: () => {
    set({
      dayCount: 0,
      timeOfDay: 43200,
      accumulator: 0,
      isPlaying: false,
      lastUpdateTimestamp: Date.now(),
    });
  },

  setLocation: (lat: number, lon: number, name: string) => {
    set({
      location: { latitude: lat, longitude: lon, name },
    });
  },

  updateOptions: (options: Partial<VisualOptions>) => {
    set((state) => ({
      options: { ...state.options, ...options },
    }));
  },
}));
