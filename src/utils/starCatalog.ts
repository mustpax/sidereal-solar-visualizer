/**
 * Bright star catalog for visualization
 * Coordinates are J2000 epoch
 */

import { deg2rad } from './astronomy';

export interface Star {
  name: string;
  ra: number; // Right Ascension (radians)
  dec: number; // Declination (radians)
  magnitude: number; // Visual magnitude (lower = brighter)
}

export const BRIGHT_STARS: Star[] = [
  // Sirius - brightest star
  { name: 'Sirius', ra: deg2rad(101.29), dec: deg2rad(-16.72), magnitude: -1.46 },
  // Canopus
  { name: 'Canopus', ra: deg2rad(95.99), dec: deg2rad(-52.70), magnitude: -0.72 },
  // Arcturus
  { name: 'Arcturus', ra: deg2rad(213.92), dec: deg2rad(19.18), magnitude: -0.05 },
  // Vega
  { name: 'Vega', ra: deg2rad(279.23), dec: deg2rad(38.78), magnitude: 0.03 },
  // Capella
  { name: 'Capella', ra: deg2rad(79.17), dec: deg2rad(45.99), magnitude: 0.08 },
  // Rigel
  { name: 'Rigel', ra: deg2rad(78.63), dec: deg2rad(-8.20), magnitude: 0.12 },
  // Procyon
  { name: 'Procyon', ra: deg2rad(114.83), dec: deg2rad(5.22), magnitude: 0.38 },
  // Betelgeuse
  { name: 'Betelgeuse', ra: deg2rad(88.79), dec: deg2rad(7.41), magnitude: 0.50 },
  // Altair
  { name: 'Altair', ra: deg2rad(297.70), dec: deg2rad(8.87), magnitude: 0.77 },
  // Aldebaran
  { name: 'Aldebaran', ra: deg2rad(68.98), dec: deg2rad(16.51), magnitude: 0.85 },
  // Spica
  { name: 'Spica', ra: deg2rad(201.30), dec: deg2rad(-11.16), magnitude: 0.97 },
  // Antares
  { name: 'Antares', ra: deg2rad(247.35), dec: deg2rad(-26.43), magnitude: 1.06 },
  // Pollux
  { name: 'Pollux', ra: deg2rad(116.33), dec: deg2rad(28.03), magnitude: 1.14 },
  // Fomalhaut
  { name: 'Fomalhaut', ra: deg2rad(344.41), dec: deg2rad(-29.62), magnitude: 1.16 },
  // Deneb
  { name: 'Deneb', ra: deg2rad(310.36), dec: deg2rad(45.28), magnitude: 1.25 },
  // Regulus
  { name: 'Regulus', ra: deg2rad(152.09), dec: deg2rad(11.97), magnitude: 1.35 },
  // Castor
  { name: 'Castor', ra: deg2rad(113.65), dec: deg2rad(31.88), magnitude: 1.58 },

  // Polaris - important for navigation
  { name: 'Polaris', ra: deg2rad(37.95), dec: deg2rad(89.26), magnitude: 1.98 },

  // Orion Belt stars
  { name: 'Alnitak', ra: deg2rad(85.19), dec: deg2rad(-1.94), magnitude: 1.77 },
  { name: 'Alnilam', ra: deg2rad(84.05), dec: deg2rad(-1.20), magnitude: 1.69 },
  { name: 'Mintaka', ra: deg2rad(83.00), dec: deg2rad(-0.30), magnitude: 2.23 },

  // Big Dipper
  { name: 'Dubhe', ra: deg2rad(165.93), dec: deg2rad(61.75), magnitude: 1.79 },
  { name: 'Merak', ra: deg2rad(165.46), dec: deg2rad(56.38), magnitude: 2.37 },
  { name: 'Phecda', ra: deg2rad(178.46), dec: deg2rad(53.69), magnitude: 2.44 },
  { name: 'Megrez', ra: deg2rad(183.86), dec: deg2rad(57.03), magnitude: 3.31 },
  { name: 'Alioth', ra: deg2rad(193.51), dec: deg2rad(55.96), magnitude: 1.77 },
  { name: 'Mizar', ra: deg2rad(200.98), dec: deg2rad(54.93), magnitude: 2.27 },
  { name: 'Alkaid', ra: deg2rad(206.89), dec: deg2rad(49.31), magnitude: 1.86 },

  // Southern Cross
  { name: 'Acrux', ra: deg2rad(186.65), dec: deg2rad(-63.10), magnitude: 0.77 },
  { name: 'Mimosa', ra: deg2rad(191.93), dec: deg2rad(-59.69), magnitude: 1.25 },
  { name: 'Gacrux', ra: deg2rad(187.79), dec: deg2rad(-57.11), magnitude: 1.63 },

  // Summer Triangle additional stars (Vega, Altair, Deneb already included)

  // Some fainter stars for texture
  { name: 'Bellatrix', ra: deg2rad(81.28), dec: deg2rad(6.35), magnitude: 1.64 },
  { name: 'Alhena', ra: deg2rad(99.43), dec: deg2rad(16.40), magnitude: 1.93 },
  { name: 'Shaula', ra: deg2rad(263.40), dec: deg2rad(-37.10), magnitude: 1.63 },
  { name: 'Hadar', ra: deg2rad(210.96), dec: deg2rad(-60.37), magnitude: 0.61 },
  { name: 'Miaplacidus', ra: deg2rad(138.30), dec: deg2rad(-69.72), magnitude: 1.68 },
];

/**
 * Get stars brighter than given magnitude
 */
export function getStarsByMagnitude(maxMagnitude: number): Star[] {
  return BRIGHT_STARS.filter((star) => star.magnitude <= maxMagnitude);
}

/**
 * Get star size for rendering based on magnitude
 * Brighter stars (lower magnitude) = larger size
 */
export function getStarSize(magnitude: number): number {
  // Map magnitude to size: -1.5 to 3.5 -> 5px to 1px
  const size = 5 - (magnitude + 1.5) * 0.8;
  return Math.max(1, Math.min(5, size));
}

/**
 * Get star opacity based on magnitude
 */
export function getStarOpacity(magnitude: number): number {
  // Brighter stars more opaque
  const opacity = 1 - (magnitude + 1.5) * 0.15;
  return Math.max(0.3, Math.min(1, opacity));
}
