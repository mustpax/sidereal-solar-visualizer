/**
 * Astronomy utilities for sidereal vs solar day visualization
 * All angles in radians unless otherwise specified
 */

// Constants
export const SIDEREAL_DAY_SECONDS = 86164; // 23h 56m 4s
export const SOLAR_DAY_SECONDS = 86400; // 24h
export const TROPICAL_YEAR_DAYS = 365.2422;
export const OBLIQUITY_RADIANS = (23.44 * Math.PI) / 180; // Earth's axial tilt

export interface CelestialCoordinates {
  ra: number; // Right Ascension (radians)
  dec: number; // Declination (radians)
}

export interface HorizontalCoordinates {
  altitude: number; // radians
  azimuth: number; // radians, 0 = North, π/2 = East
}

export interface EarthState {
  siderealAngle: number; // Earth's rotation angle (radians)
  orbitAngle: number; // Position in orbit (radians)
  sunEclipticLon: number; // Sun's ecliptic longitude (radians)
}

/**
 * Calculate Earth's state at simulation time t (seconds from start)
 */
export function calculateEarthState(t: number, initialSunLon = 0): EarthState {
  const siderealAngle = (2 * Math.PI * t) / SIDEREAL_DAY_SECONDS;
  const orbitAngle = (2 * Math.PI * t) / (TROPICAL_YEAR_DAYS * SOLAR_DAY_SECONDS);
  const sunEclipticLon = orbitAngle + initialSunLon;

  return {
    siderealAngle: normalizeAngle(siderealAngle),
    orbitAngle: normalizeAngle(orbitAngle),
    sunEclipticLon: normalizeAngle(sunEclipticLon),
  };
}

/**
 * Convert ecliptic longitude to equatorial coordinates (RA/Dec)
 */
export function eclipticToEquatorial(
  eclipticLon: number,
  eclipticLat = 0
): CelestialCoordinates {
  const eps = OBLIQUITY_RADIANS;
  const sinLon = Math.sin(eclipticLon);
  const cosLon = Math.cos(eclipticLon);
  const sinLat = Math.sin(eclipticLat);
  const cosLat = Math.cos(eclipticLat);

  const ra = Math.atan2(sinLon * Math.cos(eps) - Math.tan(eclipticLat) * Math.sin(eps), cosLon);
  const dec = Math.asin(sinLat * Math.cos(eps) + cosLat * Math.sin(eps) * sinLon);

  return {
    ra: normalizeAngle(ra),
    dec,
  };
}

/**
 * Calculate Greenwich Mean Sidereal Time (simplified)
 * t = seconds from epoch
 */
export function calculateGMST(t: number, initialGMST = 0): number {
  const gmst = initialGMST + (2 * Math.PI * t) / SIDEREAL_DAY_SECONDS;
  return normalizeAngle(gmst);
}

/**
 * Calculate Local Sidereal Time
 * longitude in radians (positive = East)
 */
export function calculateLST(gmst: number, longitude: number): number {
  return normalizeAngle(gmst + longitude);
}

/**
 * Convert equatorial coordinates to horizontal (alt-az)
 * latitude: observer latitude in radians
 * lst: Local Sidereal Time in radians
 */
export function equatorialToHorizontal(
  ra: number,
  dec: number,
  latitude: number,
  lst: number
): HorizontalCoordinates {
  // Hour angle
  const H = lst - ra;

  // Altitude
  const sinAlt =
    Math.sin(latitude) * Math.sin(dec) + Math.cos(latitude) * Math.cos(dec) * Math.cos(H);
  const altitude = Math.asin(sinAlt);

  // Azimuth (0 = North, π/2 = East)
  const azimuth = Math.atan2(
    -Math.sin(H) * Math.cos(dec),
    Math.sin(dec) * Math.cos(latitude) - Math.cos(dec) * Math.sin(latitude) * Math.cos(H)
  );

  return {
    altitude,
    azimuth: normalizeAngle(azimuth),
  };
}

/**
 * Calculate time until next sidereal day completion
 */
export function timeToNextSiderealDay(currentTime: number): number {
  const siderealPeriods = Math.floor(currentTime / SIDEREAL_DAY_SECONDS);
  return (siderealPeriods + 1) * SIDEREAL_DAY_SECONDS - currentTime;
}

/**
 * Calculate time until next solar day completion
 */
export function timeToNextSolarDay(currentTime: number): number {
  const solarPeriods = Math.floor(currentTime / SOLAR_DAY_SECONDS);
  return (solarPeriods + 1) * SOLAR_DAY_SECONDS - currentTime;
}

/**
 * Format time as HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600) % 24;
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Format sidereal time (wraps at 24 sidereal hours)
 */
export function formatSiderealTime(seconds: number): string {
  const siderealHours = (seconds / SIDEREAL_DAY_SECONDS) * 24;
  const h = Math.floor(siderealHours) % 24;
  const m = Math.floor((siderealHours % 1) * 60);
  const s = Math.floor(((siderealHours % 1) * 60) % 1 * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Normalize angle to [0, 2π)
 */
export function normalizeAngle(angle: number): number {
  const normalized = angle % (2 * Math.PI);
  return normalized < 0 ? normalized + 2 * Math.PI : normalized;
}

/**
 * Degrees to radians
 */
export function deg2rad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Radians to degrees
 */
export function rad2deg(radians: number): number {
  return (radians * 180) / Math.PI;
}
