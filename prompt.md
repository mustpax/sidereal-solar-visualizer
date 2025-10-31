
Concept: Two linked views

View 1: Overhead 2D (not to scale)

What you see
	•	Sun at center.
	•	Earth on a circular orbit path.
	•	Earth is a disk with a clear asymmetric pattern (blue wedge + green checker) so rotation is easy to read.
	•	A small pin on Earth marks your chosen location.

Controls
	•	Time slider and Play/Pause with speed (1x, 10x, 100x).
	•	Jump buttons: “Next star return” and “Next solar return”.
	•	Toggle trails: orbit arc, rotation tick marks.
	•	Toggle labels: angles, “sidereal turn complete”, “solar noon”.

Behavior
	•	Earth spin uses sidereal rate: 360° per 23h 56m 4s.
	•	Earth advances in orbit: 360° per 365.2422 days.
	•	After one sidereal rotation the location pin lines up with the same distant-star direction, but the Sun direction is short by ~1° (needs a bit more spin), which visually explains the extra ~3m56s to make a solar day.

Visual cues that sell it
	•	When the pin realigns with the star direction, flash a small star icon next to Earth with “Sidereal day”.
	•	When the pin realigns with the Sun direction, flash a small sunburst with “Solar day”.
	•	Thin arrow from Earth to Sun, and a faint arrow from Earth to “fixed star” direction at the start of the run. As time plays, you see why one catch-up is needed.

⸻

View 2: Local Sky from a fixed spot

What you see
	•	A circular sky dome projection with horizon ring, N E S W markers, and a meridian line.
	•	A star tapestry that is always visible, even during daytime.
	•	The Sun with a soft halo so it reads as “daytime” without hiding stars.
	•	Optional lines: ecliptic and celestial equator.

Controls
	•	Location picker: latitude slider, longitude slider or city presets.
	•	Grid toggles: RA/Dec grid, altitude/azimuth grid, horizon shading.
	•	Two clocks side by side: Solar time, Local Sidereal Time.
	•	A “drift counter” that shows how much sidereal is ahead of solar since start.

Behavior
	•	Stars sweep around at the sidereal rate. The Sun moves slightly slower across the backdrop because of Earth’s orbit.
	•	Run “1 week” to watch the Sun lag the star field by ~28 minutes. The drift counter and a small dotted arc on the dome show the offset.

⸻

Shared time engine

Use a single simulation time t that both views read.
	•	Earth spin angle: theta_sid = 2π * (t / 86164 s)
	•	Orbit angle: lambda_ecl = 2π * (t / 365.2422 days)
	•	Sun ecliptic longitude: lambda_sun = lambda_ecl + lambda_0 (set lambda_0 at t=0)
	•	Convert Sun ecliptic to RA/Dec with obliquity ε = 23.44°:
	•	RA_sun = atan2( sinλ cosε, cosλ )
	•	Dec_sun = asin( sinλ sinε )
	•	Local Sidereal Time: LST = GMST(t) + longitude
	•	A simple GMST approximation is fine for pedagogy: start value at t=0, then add 2π * t / 86164 s.
	•	For any star with fixed (RA, Dec):
	•	Hour angle H = LST − RA
	•	Altitude sin alt = sin φ sin Dec + cos φ cos Dec cos H
	•	Azimuth az = atan2( −sin H cos Dec, sin Dec cos φ − cos Dec sin φ cos H )
	•	Plot on the dome in alt-az. Keep stars always visible. Draw the Sun with a bright sprite plus halo.

⸻

Key interactions that teach
	1.	Toggle “snap markers”
Drops a ghost marker at the moment of a sidereal return and at the next solar return. In View 2 you see the Sun offset relative to that ghost.
	2.	“Run 7 days”
Plays time, then pauses and draws a small angular gap label: “Stars now rise ~28 minutes earlier.”
	3.	“Why 4 minutes?” micro-anim
In View 1, freeze after one sidereal turn. Draw a 1° wedge on the orbit and rotate Earth that extra 1° to hit the Sun direction. Show “1° at the equator equals about 4 minutes of rotation.”
	4.	Latitude effect
Change latitude and watch star paths tilt. The sidereal vs solar offset stays the same, which reinforces that the cause is orbital motion, not latitude.

⸻

Implementation notes

Stack
	•	React for UI, Zustand or Redux for shared time state.
	•	Canvas or WebGL. For 2D, use PixiJS or HTML Canvas for crisp performance at high time speeds.

Performance
	•	Drive animation with requestAnimationFrame, but advance simulation by scaled Δt from the play speed. Keep draw work minimal.
	•	Precompute a small set of bright stars (about 50) for clarity. Optionally add a faint dense background as a static texture for “tapestry” feel.

Art direction
	•	Earth disk: asymmetric two-tone pattern that clearly rotates, not a simple half-and-half.
	•	Consistent thin strokes, restrained palette, readable labels.
	•	Use translucency so both grids and objects can coexist without clutter.

Accessibility
	•	High-contrast mode toggle.
	•	Motion reduction option that steps time in discrete ticks rather than smooth animation.

⸻

Minimal success criteria
	•	When time runs for ~24 hours, the sidereal clock hits 24:00 about 4 minutes before the solar clock.
	•	View 1 shows a clear extra sliver of rotation needed to face the Sun again.
	•	View 2 shows the star field slightly ahead of the Sun each “day,” visible at all times.

If you want, I can sketch a quick wireframe or provide starter React code for both views, including the math utilities.
