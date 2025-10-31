import { create } from 'zustand';
import {
  timeToNextSiderealDay,
  timeToNextSolarDay,
  SIDEREAL_DAY_SECONDS,
  SOLAR_DAY_SECONDS,
  deg2rad,
} from '../utils/astronomy';

export type PlaySpeed = 1 | 10 | 100 | 1000;

export interface LocationState {
  latitude: number; // radians
  longitude: number; // radians
  name: string;
}

export interface VisualOptions {
  showOrbitTrail: boolean;
  showRotationTicks: boolean;
  showLabels: boolean;
  showGrid: boolean;
  showEcliptic: boolean;
  showCelestialEquator: boolean;
  showHorizonShading: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
}

export interface SimulationMarkers {
  lastSiderealReturn: number | null;
  lastSolarReturn: number | null;
  showMarkers: boolean;
}

interface SimulationState {
  // Time state
  currentTime: number; // seconds from start
  isPlaying: boolean;
  playSpeed: PlaySpeed;
  lastUpdateTimestamp: number;

  // Location
  location: LocationState;

  // Visual options
  options: VisualOptions;

  // Markers for snap points
  markers: SimulationMarkers;

  // Actions
  play: () => void;
  pause: () => void;
  setPlaySpeed: (speed: PlaySpeed) => void;
  setTime: (time: number) => void;
  tick: () => void;
  jumpToNextSidereal: () => void;
  jumpToNextSolar: () => void;
  reset: () => void;
  setLocation: (lat: number, lon: number, name: string) => void;
  updateOptions: (options: Partial<VisualOptions>) => void;
  toggleMarkers: () => void;
  markSiderealReturn: () => void;
  markSolarReturn: () => void;
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
  showOrbitTrail: true,
  showRotationTicks: true,
  showLabels: true,
  showGrid: true,
  showEcliptic: true,
  showCelestialEquator: true,
  showHorizonShading: true,
  highContrast: false,
  reduceMotion: false,
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  currentTime: 0,
  isPlaying: false,
  playSpeed: 100,
  lastUpdateTimestamp: Date.now(),
  location: PRESET_LOCATIONS['Greenwich, UK'],
  options: DEFAULT_OPTIONS,
  markers: {
    lastSiderealReturn: null,
    lastSolarReturn: null,
    showMarkers: false,
  },

  // Actions
  play: () => {
    set({ isPlaying: true, lastUpdateTimestamp: Date.now() });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  setPlaySpeed: (speed: PlaySpeed) => {
    set({ playSpeed: speed });
  },

  setTime: (time: number) => {
    set({ currentTime: Math.max(0, time) });
  },

  tick: () => {
    const state = get();
    if (!state.isPlaying) return;

    const now = Date.now();
    const realDelta = (now - state.lastUpdateTimestamp) / 1000; // real seconds elapsed
    const simulatedDelta = realDelta * state.playSpeed;

    const newTime = state.currentTime + simulatedDelta;

    // Check for sidereal day completion
    const oldSiderealDays = Math.floor(state.currentTime / SIDEREAL_DAY_SECONDS);
    const newSiderealDays = Math.floor(newTime / SIDEREAL_DAY_SECONDS);
    if (newSiderealDays > oldSiderealDays && state.markers.showMarkers) {
      set({ markers: { ...state.markers, lastSiderealReturn: newTime } });
    }

    // Check for solar day completion
    const oldSolarDays = Math.floor(state.currentTime / SOLAR_DAY_SECONDS);
    const newSolarDays = Math.floor(newTime / SOLAR_DAY_SECONDS);
    if (newSolarDays > oldSolarDays && state.markers.showMarkers) {
      set({ markers: { ...state.markers, lastSolarReturn: newTime } });
    }

    set({
      currentTime: newTime,
      lastUpdateTimestamp: now,
    });
  },

  jumpToNextSidereal: () => {
    const state = get();
    const timeToNext = timeToNextSiderealDay(state.currentTime);
    set({ currentTime: state.currentTime + timeToNext });
  },

  jumpToNextSolar: () => {
    const state = get();
    const timeToNext = timeToNextSolarDay(state.currentTime);
    set({ currentTime: state.currentTime + timeToNext });
  },

  reset: () => {
    set({
      currentTime: 0,
      isPlaying: false,
      lastUpdateTimestamp: Date.now(),
      markers: {
        lastSiderealReturn: null,
        lastSolarReturn: null,
        showMarkers: false,
      },
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

  toggleMarkers: () => {
    set((state) => ({
      markers: {
        ...state.markers,
        showMarkers: !state.markers.showMarkers,
      },
    }));
  },

  markSiderealReturn: () => {
    const state = get();
    set({
      markers: { ...state.markers, lastSiderealReturn: state.currentTime },
    });
  },

  markSolarReturn: () => {
    const state = get();
    set({
      markers: { ...state.markers, lastSolarReturn: state.currentTime },
    });
  },
}));
