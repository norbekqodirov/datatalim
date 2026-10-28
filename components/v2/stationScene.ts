// "Fazodagi stansiya" — shape generators for the hero particle scene (pure data, no DOM).
// Station local frame: rings lie in the XY plane, their axis is Z (towards the viewer when face-on),
// so at the end of the story the brand star in the hub faces the camera, framed by the rings.

export const TAU = Math.PI * 2;

export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const gauss = (rnd: () => number) => rnd() + rnd() + rnd() - 1.5;

// Brand star outline: |x|^k + |y|^k = 1 with k < 1 gives the concave 4-point star.
export function starRadius(theta: number, k = 0.62) {
  const c = Math.abs(Math.cos(theta));
  const s = Math.abs(Math.sin(theta));
  return 1 / Math.pow(Math.pow(c, k) + Math.pow(s, k), 1 / k);
}

// hue indices shared with the renderer's style tables
export const HUE_BLUE = 0;
export const HUE_CYAN = 1;
export const HUE_GREEN = 2;
export const HUE_WHITE = 3;

// transform groups — each one gets its own matrix per frame
export const G_CORE = 0; // brand-star module in the hub (sways, grows at the end)
export const G_HUB = 1; // docking mast + modules along the axis (fixed)
export const G_RING = 2; // outer habitat ring + spokes (spins)
export const G_INNER = 3; // inner ring (counter-spins)
export const G_ORBIT_A = 4; // data packets on inclined orbits
export const G_ORBIT_B = 5;
export const GROUPS = 6;

export interface StationData {
  n: number;
  x: Float32Array; y: Float32Array; z: Float32Array;
  grp: Uint8Array; hue: Uint8Array;
  size: Float32Array; // px at depth 0
  ba: Float32Array; // base alpha 0..1
  ang: Float32Array; // position along a ring (for travelling data pulses); NaN = no pulse
  lights: { x: number; y: number; z: number; g: number; hue: number; phase: number; blink: boolean }[];
}

export interface StarData {
  n: number;
  x: Float32Array; y: Float32Array; // -1..1 of the half canvas
  d: Float32Array; // nearness 0 (far) .. 1 (near) → parallax, size, brightness
  hue: Uint8Array; phase: Float32Array; speed: Float32Array;
}

export interface PlanetData {
  n: number;
  x: Float32Array; y: Float32Array; // unit radius, y up
  a: Float32Array; hue: Uint8Array; size: Float32Array;
  ext: number; // half-extent in radii (ring reaches past the sphere)
}

function stationOf(n: number, rnd: () => number): StationData {
  const s: StationData = {
    n,
    x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n),
    grp: new Uint8Array(n), hue: new Uint8Array(n),
    size: new Float32Array(n), ba: new Float32Array(n), ang: new Float32Array(n),
    lights: [],
  };
  let i = 0;
  const put = (x: number, y: number, z: number, g: number, hue: number, size: number, ba: number, ang = NaN) => {
    if (i >= n) return;
    s.x[i] = x; s.y[i] = y; s.z[i] = z; s.grp[i] = g; s.hue[i] = hue; s.size[i] = size; s.ba[i] = ba; s.ang[i] = ang;
    i++;
  };
  const nRing = Math.round(n * 0.4);
  const nInner = Math.round(n * 0.1);
  const nSpoke = Math.round(n * 0.07);
  const nCore = Math.round(n * 0.27);
  const nHub = Math.round(n * 0.06);
  const nOrbit = n - nRing - nInner - nSpoke - nCore - nHub;

  // ---- outer habitat ring: a torus segmented into 12 modules (fat pods joined by thin necks).
  // Particles sit mostly on 4 "rails" along the tube and on ribs around it, so the hull reads as
  // crisp hardware rather than fuzz; the rest is a sparse skin.
  const R = 1;
  const MODS = 12;
  const tubeAt = (u: number) => 0.028 + 0.062 * Math.pow(0.5 + 0.5 * Math.cos(MODS * u), 2);
  for (let k = 0; k < nRing; k++) {
    const kind = rnd();
    let u: number, v: number, ba: number;
    if (kind < 0.46) {
      u = rnd() * TAU;
      v = (Math.floor(rnd() * 4) * TAU) / 4 + 0.4 + gauss(rnd) * 0.04;
      ba = 0.95;
    } else if (kind < 0.7) {
      u = (Math.floor(rnd() * MODS * 2) * TAU) / (MODS * 2) + TAU / (MODS * 4) + gauss(rnd) * 0.004;
      v = rnd() * TAU;
      ba = 0.8;
    } else {
      u = rnd() * TAU;
      v = rnd() * TAU;
      ba = 0.45;
    }
    const tube = tubeAt(u);
    const rr = R + tube * Math.cos(v);
    const lit = Math.cos(v - 0.9); // light from the outer/front side
    const hue = lit > 0.55 ? HUE_CYAN : rnd() < 0.06 ? HUE_GREEN : HUE_BLUE;
    put(Math.cos(u) * rr, Math.sin(u) * rr, tube * Math.sin(v), G_RING, hue, 1.2 + rnd() * 1.3, ba * (0.7 + 0.3 * Math.max(0, lit)), u);
  }
  // ---- inner ring (thin, counter-rotating): two rails + skin
  const RI = 0.63;
  for (let k = 0; k < nInner; k++) {
    const u = rnd() * TAU;
    const rail = rnd() < 0.6;
    const v = rail ? (rnd() < 0.5 ? 0 : Math.PI) + gauss(rnd) * 0.05 : rnd() * TAU;
    const tube = 0.024;
    const rr = RI + tube * Math.cos(v);
    put(Math.cos(u) * rr, Math.sin(u) * rr, tube * Math.sin(v), G_INNER, rnd() < 0.7 ? HUE_CYAN : HUE_BLUE, 0.9 + rnd() * 1.1, rail ? 0.9 : 0.55, u * 1.6);
  }
  // ---- six spokes between the rings (spin with the outer ring)
  for (let k = 0; k < nSpoke; k++) {
    const sp = Math.floor(rnd() * 6);
    const a = (sp * TAU) / 6 + TAU / 12;
    const r = RI + 0.03 + rnd() * (R - RI - 0.07);
    const off = gauss(rnd) * 0.02;
    put(Math.cos(a) * r - Math.sin(a) * off, Math.sin(a) * r + Math.cos(a) * off, gauss(rnd) * 0.02, G_RING, sp % 2 ? HUE_CYAN : HUE_BLUE, 0.9 + rnd() * 0.9, 0.62);
  }
  // ---- the brand star module: crisp outline + lens-shaped body + a white-hot nucleus
  const S = 0.5;
  for (let k = 0; k < nCore; k++) {
    const r0 = rnd();
    if (r0 < 0.07) {
      put(gauss(rnd) * 0.06, gauss(rnd) * 0.06, gauss(rnd) * 0.06, G_CORE, HUE_WHITE, 1.2 + rnd() * 1.4, 0.9);
      continue;
    }
    const a = rnd() * TAU;
    const edge = r0 < 0.68;
    const sr = starRadius(a) * (edge ? 1 - rnd() * 0.04 : Math.sqrt(rnd()) * 0.96);
    const x = Math.cos(a) * sr * S;
    const y = Math.sin(a) * sr * S;
    const thick = Math.max(0, 1 - sr) * 0.42;
    const z = (rnd() * 2 - 1) * thick * S;
    const t = (x + y) / (2 * S) + 0.5; // diagonal brand gradient: blue → cyan
    const hue = rnd() < 0.07 ? HUE_GREEN : t < 0.5 ? HUE_BLUE : HUE_CYAN;
    put(x, y, z, G_CORE, hue, 1.1 + rnd() * 1.5, edge ? 1 : 0.6);
  }
  // ---- docking mast along the axis with two cylindrical modules
  for (let k = 0; k < nHub; k++) {
    if (rnd() < 0.4) {
      put(gauss(rnd) * 0.02, gauss(rnd) * 0.02, (rnd() * 2 - 1) * 0.62, G_HUB, HUE_BLUE, 0.9 + rnd() * 0.8, 0.7);
    } else {
      const side = rnd() < 0.5 ? -1 : 1;
      const a = rnd() * TAU;
      put(Math.cos(a) * 0.08, Math.sin(a) * 0.08, side * 0.42 + (rnd() * 2 - 1) * 0.07, G_HUB, HUE_CYAN, 0.9 + rnd() * 0.9, 0.75);
    }
  }
  // ---- data packets: 5 comets per orbit, a bright head with a fading trail
  for (let k = 0; k < nOrbit; k++) {
    const orbitB = k % 2 === 1;
    const j = Math.floor(rnd() * 5);
    const trail = Math.pow(rnd(), 1.7) * 0.6;
    const a = (j * TAU) / 5 + (orbitB ? 0.4 : 0) - trail;
    const r = (orbitB ? 1.34 : 1.2) + gauss(rnd) * 0.008;
    put(Math.cos(a) * r, Math.sin(a) * r, gauss(rnd) * 0.008, orbitB ? G_ORBIT_B : G_ORBIT_A, orbitB ? HUE_CYAN : HUE_GREEN,
      trail < 0.04 ? 2.2 : 0.8 + rnd() * 0.8, 1 - (trail / 0.6) * 0.85);
  }
  s.n = i;

  // running lights on the outer rim of each module, and four beacons on the star tips
  for (let k = 0; k < MODS; k++) {
    const u = (k * TAU) / MODS;
    s.lights.push({ x: Math.cos(u) * (R + 0.1), y: Math.sin(u) * (R + 0.1), z: 0, g: G_RING, hue: k % 3 === 0 ? HUE_GREEN : HUE_CYAN, phase: rnd() * TAU, blink: true });
  }
  for (let k = 0; k < 4; k++) {
    const a = (k * TAU) / 4;
    s.lights.push({ x: Math.cos(a) * S * 0.98, y: Math.sin(a) * S * 0.98, z: 0, g: G_CORE, hue: HUE_CYAN, phase: k * 1.3, blink: false });
  }
  return s;
}

function starsOf(n: number, rnd: () => number): StarData {
  const d: StarData = {
    n,
    x: new Float32Array(n), y: new Float32Array(n), d: new Float32Array(n),
    hue: new Uint8Array(n), phase: new Float32Array(n), speed: new Float32Array(n),
  };
  for (let i = 0; i < n; i++) {
    d.x[i] = rnd() * 2.1 - 1.05;
    d.y[i] = rnd() * 2.1 - 1.05;
    d.d[i] = Math.pow(rnd(), 2.2); // mostly far, faint stars
    const h = rnd();
    d.hue[i] = h < 0.84 ? HUE_WHITE : h < 0.95 ? HUE_CYAN : HUE_BLUE;
    d.phase[i] = rnd() * TAU;
    d.speed[i] = 0.6 + rnd() * 2.2;
  }
  return d;
}

/** Front hemisphere of a particle sphere lit from the upper left (+ optional tilted ring). */
function planetOf(nSphere: number, nRing: number, main: number, rim: number, rnd: () => number): PlanetData {
  const n = nSphere + nRing;
  const p: PlanetData = { n, x: new Float32Array(n), y: new Float32Array(n), a: new Float32Array(n), hue: new Uint8Array(n), size: new Float32Array(n), ext: nRing ? 2.05 : 1.1 };
  const L = [-0.62, 0.55, -0.56]; // light direction (z < 0 = towards the viewer)
  let i = 0;
  for (; i < nSphere; i++) {
    let x = gauss(rnd), y = gauss(rnd), z = gauss(rnd);
    const m = Math.hypot(x, y, z) || 1;
    x /= m; y /= m; z = -Math.abs(z / m);
    const lam = Math.max(0, x * L[0] + y * L[1] + z * L[2]);
    const bands = 0.82 + 0.18 * Math.sin(y * 13 + 0.6);
    p.x[i] = x; p.y[i] = y;
    p.a[i] = (0.1 + 0.9 * Math.pow(lam, 1.15)) * bands;
    p.hue[i] = lam > 0.72 ? rim : main;
    p.size[i] = 0.9 + rnd() * 1.1;
  }
  const tilt = 1.22, roll = -0.38;
  const ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(roll), sr = Math.sin(roll);
  while (i < n) {
    const a = rnd() * TAU;
    const r = 1.4 + Math.pow(rnd(), 0.8) * 0.6;
    const bx = Math.cos(a) * r, bz = Math.sin(a) * r;
    // tilt about X, then roll about Z
    const y1 = -bz * st, z1 = bz * ct;
    const x2 = bx * cr - y1 * sr, y2 = bx * sr + y1 * cr;
    if (z1 > 0 && x2 * x2 + y2 * y2 < 1) continue; // hidden behind the planet
    p.x[i] = x2; p.y[i] = y2;
    p.a[i] = (0.35 + 0.4 * rnd()) * (r < 1.75 ? 1 : 0.7);
    p.hue[i] = rim;
    p.size[i] = 0.8 + rnd() * 0.8;
    i++;
  }
  return p;
}

export interface SceneData {
  station: StationData;
  stars: StarData;
  planetA: PlanetData;
  planetB: PlanetData;
}

/** Splits the particle budget: ~80% station, the rest is the starfield and two planets. */
export function buildScene(count: number): SceneData {
  const rnd = mulberry32(2019);
  const nStars = Math.round(count * 0.09);
  const nPA = Math.round(count * 0.062);
  const nPAr = Math.round(count * 0.029);
  const nPB = Math.round(count * 0.026);
  const nStation = Math.max(200, count - nStars - nPA - nPAr - nPB);
  return {
    station: stationOf(nStation, rnd),
    stars: starsOf(nStars, rnd),
    planetA: planetOf(nPA, nPAr, HUE_BLUE, HUE_CYAN, rnd),
    planetB: planetOf(nPB, 0, HUE_GREEN, HUE_CYAN, rnd),
  };
}
