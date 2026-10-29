// Hero hologram shapes — pure data generators (no DOM) for the particle field.
// Seven 3D "holograms" the particles flow between, in this order:
//   0 DATA brand star · 1 AI chip · 2 laptop </> · 3 movie camera ▶ · 4 pen nib + bezier handle · 5 bar chart ↗ · 6 graduation cap
// Every shape has exactly the same particle count N, and its points are stored in a canonical order
// (angular sector around the centre, then radius inside the sector). Particle i of one shape therefore morphs
// into particle i of the next one: neighbours stay neighbours, so the flow sweeps round instead of exploding.
// Local frame: y up, x right, z away from the viewer (negative z = nearer). Shapes face the viewer.

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
/** resolved after normalisation: brand diagonal gradient, blue (lower left) → cyan (upper right) */
const GRAD = 9;

export const SHAPES = 7;

export interface ShapeLight { x: number; y: number; z: number; hue: number; r: number }

export interface ShapeData {
  n: number;
  x: Float32Array; y: Float32Array; z: Float32Array;
  hue: Uint8Array;
  size: Float32Array; // px at depth 0
  ba: Float32Array; // base alpha 0..1
  /** projected half-extents (99.7th pct) over the sway range, in shape units — the renderer fits these into the band */
  ex: number; ey: number;
  lights: ShapeLight[];
}

// ---------------------------------------------------------------- primitives
type P3 = readonly [number, number, number];
type Rnd = () => number;
/** One drawable piece: weight w (∝ length or area × density) decides its share of the N particles. */
interface Prim { w: number; hue: number; ba: number; sz: number; at: (r: Rnd, o: Float32Array) => void }

const prim = (w: number, hue: number, ba: number, sz: number, at: Prim['at']): Prim => ({ w, hue, ba, sz, at });

/** straight edge a→b; jit = thickness (gaussian) */
function seg(a: P3, b: P3, dens: number, hue: number, ba = 0.95, sz = 1.5, jit = 0.006): Prim {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  return prim(Math.hypot(dx, dy, dz) * dens, hue, ba, sz, (r, o) => {
    const t = r();
    o[0] = a[0] + dx * t + gauss(r) * jit;
    o[1] = a[1] + dy * t + gauss(r) * jit;
    o[2] = a[2] + dz * t + gauss(r) * jit;
  });
}

function poly(pts: P3[], closed: boolean, dens: number, hue: number, ba?: number, sz?: number, jit?: number): Prim[] {
  const out: Prim[] = [];
  const m = closed ? pts.length : pts.length - 1;
  for (let k = 0; k < m; k++) out.push(seg(pts[k], pts[(k + 1) % pts.length], dens, hue, ba, sz, jit));
  return out;
}

/** circular arc in the plane spanned by unit axes U, V */
function arc(c: P3, rad: number, a0: number, a1: number, U: P3, V: P3, dens: number, hue: number, ba = 0.95, sz = 1.5, jit = 0.006): Prim {
  return prim(Math.abs(a1 - a0) * rad * dens, hue, ba, sz, (r, o) => {
    const a = a0 + (a1 - a0) * r();
    const cu = Math.cos(a) * rad, sv = Math.sin(a) * rad;
    o[0] = c[0] + U[0] * cu + V[0] * sv + gauss(r) * jit;
    o[1] = c[1] + U[1] * cu + V[1] * sv + gauss(r) * jit;
    o[2] = c[2] + U[2] * cu + V[2] * sv + gauss(r) * jit;
  });
}

/** filled parallelogram o + s·u + t·v */
function quad(o0: P3, u: P3, v: P3, dens: number, hue: number, ba = 0.3, sz = 1.2): Prim {
  const cx = u[1] * v[2] - u[2] * v[1], cy = u[2] * v[0] - u[0] * v[2], cz = u[0] * v[1] - u[1] * v[0];
  return prim(Math.hypot(cx, cy, cz) * dens, hue, ba, sz, (r, o) => {
    const s = r(), t = r();
    o[0] = o0[0] + u[0] * s + v[0] * t;
    o[1] = o0[1] + u[1] * s + v[1] * t;
    o[2] = o0[2] + u[2] * s + v[2] * t;
  });
}

/** filled triangle */
function tri(a: P3, b: P3, c: P3, dens: number, hue: number, ba = 0.4, sz = 1.2): Prim {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const area = 0.5 * Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]);
  return prim(area * dens, hue, ba, sz, (r, o) => {
    let s = r(), t = r();
    if (s + t > 1) { s = 1 - s; t = 1 - t; }
    o[0] = a[0] + u[0] * s + v[0] * t;
    o[1] = a[1] + u[1] * s + v[1] * t;
    o[2] = a[2] + u[2] * s + v[2] * t;
  });
}

/** small gaussian cluster (node, button, pad) */
function blob(c: P3, rad: number, w: number, hue: number, ba = 0.95, sz = 1.6): Prim {
  return prim(w, hue, ba, sz, (r, o) => {
    o[0] = c[0] + gauss(r) * rad; o[1] = c[1] + gauss(r) * rad; o[2] = c[2] + gauss(r) * rad;
  });
}

/** axis-aligned box: 12 edges (back ones fainter) + optional front/top faces */
function box(c: P3, h: P3, dens: number, hue: number, faces: { front?: number; top?: number; side?: number } = {}): Prim[] {
  const [cx, cy, cz] = c, [hx, hy, hz] = h;
  const P = (sx: number, sy: number, sz: number): P3 => [cx + sx * hx, cy + sy * hy, cz + sz * hz];
  const out: Prim[] = [];
  // front face (z−) edges strong, back face (z+) edges faint, depth edges medium
  out.push(...poly([P(-1, -1, -1), P(1, -1, -1), P(1, 1, -1), P(-1, 1, -1)], true, dens, hue, 1));
  out.push(...poly([P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1)], true, dens * 0.45, hue, 0.6));
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) out.push(seg(P(sx, sy, -1), P(sx, sy, 1), dens * 0.8, hue, 0.85));
  if (faces.front) out.push(quad(P(-1, -1, -1), [2 * hx, 0, 0], [0, 2 * hy, 0], faces.front, hue, 0.32));
  if (faces.top) out.push(quad(P(-1, 1, -1), [2 * hx, 0, 0], [0, 0, 2 * hz], faces.top, hue, 0.28));
  if (faces.side) out.push(quad(P(1, -1, -1), [0, 2 * hy, 0], [0, 0, 2 * hz], faces.side, hue, 0.24));
  return out;
}

const X: P3 = [1, 0, 0], Y: P3 = [0, 1, 0], Z: P3 = [0, 0, 1];

// ---------------------------------------------------------------- the seven shapes
interface Spec { prims: Prim[]; lights?: ShapeLight[]; /** view from above: rotation about X (rad) */ tilt?: number }

function starSpec(): Spec {
  const prims: Prim[] = [];
  const outline: P3[] = [];
  for (let k = 0; k < 240; k++) {
    const a = (k / 240) * TAU;
    const r = starRadius(a);
    outline.push([Math.cos(a) * r, Math.sin(a) * r, 0]);
  }
  // crisp outline (arc-length uniform), faceted 3D crystal: ridges to the tips and valleys to the inner corners
  prims.push(...poly(outline, true, 1.45, GRAD, 1, 1.6, 0.008));
  const apex: P3 = [0, 0, -0.34], back: P3 = [0, 0, 0.3];
  const vr = starRadius(Math.PI / 4);
  for (let k = 0; k < 4; k++) {
    const a = (k * TAU) / 4;
    const tip: P3 = [Math.cos(a), Math.sin(a), 0];
    const b = a + Math.PI / 4;
    const valley: P3 = [Math.cos(b) * vr, Math.sin(b) * vr, 0];
    prims.push(seg(apex, tip, 0.95, HUE_CYAN, 0.85, 1.4));
    prims.push(seg(apex, valley, 0.5, HUE_BLUE, 0.6, 1.2));
    prims.push(seg(back, tip, 0.32, HUE_BLUE, 0.4, 1.1));
  }
  // lens-shaped body (front surface bulges towards the viewer)
  prims.push(prim(3.8, GRAD, 0.5, 1.2, (r, o) => {
    const a = r() * TAU;
    const R = starRadius(a);
    const f = Math.sqrt(r()) * 0.96;
    o[0] = Math.cos(a) * R * f; o[1] = Math.sin(a) * R * f; o[2] = -0.34 * (1 - f) * (0.4 + 0.6 * r());
  }));
  prims.push(blob([0, 0, -0.12], 0.08, 0.8, HUE_WHITE, 0.95, 1.6));
  const lights: ShapeLight[] = [];
  for (let k = 0; k < 4; k++) lights.push({ x: Math.cos((k * TAU) / 4) * 0.98, y: Math.sin((k * TAU) / 4) * 0.98, z: 0, hue: HUE_CYAN, r: 1 });
  return { prims, lights };
}

/** rounded rectangle outline in the XY plane */
function roundRect(hw: number, hh: number, rad: number, z: number): P3[] {
  const pts: P3[] = [];
  const corners: [number, number, number][] = [[hw - rad, hh - rad, 0], [-hw + rad, hh - rad, 1], [-hw + rad, -hh + rad, 2], [hw - rad, -hh + rad, 3]];
  for (const [cx, cy, q] of corners) {
    for (let k = 0; k <= 6; k++) {
      const a = (q * Math.PI) / 2 + (k / 6) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, z]);
    }
  }
  return pts;
}

function chipSpec(): Spec {
  const prims: Prim[] = [];
  const H = 0.62, T = 0.07;
  prims.push(...poly(roundRect(H, H, 0.12, -T), true, 1.25, GRAD, 1, 1.5));
  prims.push(...poly(roundRect(H, H, 0.12, T), true, 0.42, HUE_BLUE, 0.5, 1.2));
  prims.push(...poly([[-0.42, -0.42, -T - 0.005], [0.42, -0.42, -T - 0.005], [0.42, 0.42, -T - 0.005], [-0.42, 0.42, -T - 0.005]], true, 0.85, HUE_CYAN, 0.85, 1.3));
  prims.push(quad([-H, -H, -T], [2 * H, 0, 0], [0, 2 * H, 0], 0.75, HUE_BLUE, 0.26));
  // 5 pins per side with pads
  for (let s = 0; s < 4; s++) {
    const ca = Math.cos((s * Math.PI) / 2), sa = Math.sin((s * Math.PI) / 2);
    for (let k = -2; k <= 2; k++) {
      const p = k * 0.2;
      const at = (d: number): P3 => [ca * d - sa * p, sa * d + ca * p, 0];
      prims.push(seg(at(H), at(0.9), 1.05, HUE_CYAN, 0.9, 1.4, 0.012));
      prims.push(blob(at(0.93), 0.014, 0.07, HUE_GREEN, 1, 1.5));
    }
  }
  // "AI" lettering, thick strokes floating just in front of the die
  const zl = -T - 0.02, j = 0.014;
  prims.push(seg([-0.29, -0.21, zl], [-0.145, 0.21, zl], 3.1, HUE_WHITE, 1, 1.6, j));
  prims.push(seg([-0.145, 0.21, zl], [0.0, -0.21, zl], 3.1, HUE_WHITE, 1, 1.6, j));
  prims.push(seg([-0.23, -0.05, zl], [-0.06, -0.05, zl], 3.1, HUE_WHITE, 1, 1.6, j));
  prims.push(seg([0.17, -0.21, zl], [0.17, 0.21, zl], 3.1, HUE_WHITE, 1, 1.6, j));
  prims.push(seg([0.09, 0.21, zl], [0.25, 0.21, zl], 3.1, HUE_WHITE, 1, 1.6, j));
  prims.push(seg([0.09, -0.21, zl], [0.25, -0.21, zl], 3.1, HUE_WHITE, 1, 1.6, j));
  return { prims, tilt: 0.12 };
}

function laptopSpec(): Spec {
  const prims: Prim[] = [];
  const W = 1, D = 1.25, Hb = 0.07;
  // base: top face outline strong, bottom/front lip fainter
  prims.push(...poly([[-W, 0, -D], [W, 0, -D], [W, 0, 0], [-W, 0, 0]], true, 1.1, GRAD, 1, 1.5));
  prims.push(...poly([[-W, -Hb, 0], [-W, -Hb, -D], [W, -Hb, -D], [W, -Hb, 0]], false, 0.5, HUE_BLUE, 0.6, 1.2));
  // keyboard: 13 × 4 keys as tiny pads near the hinge, trackpad near the front
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 13; col++) {
      const kx = -0.84 + col * 0.14, kz = -0.2 - row * 0.15;
      prims.push(quad([kx - 0.045, 0.002, kz - 0.045], [0.09, 0, 0], [0, 0, 0.09], 7.5, HUE_BLUE, 0.55, 1.1));
    }
  }
  prims.push(...poly([[-0.3, 0.002, -1.13], [0.3, 0.002, -1.13], [0.3, 0.002, -0.83], [-0.3, 0.002, -0.83]], true, 0.8, HUE_CYAN, 0.7, 1.2));
  // lid, leaning back 12°
  const H = 1.3, la = (12 * Math.PI) / 180;
  const d: P3 = [0, Math.cos(la), Math.sin(la)];
  const n: P3 = [0, -Math.sin(la), Math.cos(la)]; // lid normal, pointing away from the viewer
  const L = (u: number, v: number, off = 0): P3 => [u, d[1] * v + n[1] * off, d[2] * v + n[2] * off];
  prims.push(...poly([L(-W, 0), L(W, 0), L(W, H), L(-W, H)], true, 1.2, GRAD, 1, 1.5));
  prims.push(...poly([L(-W, 0, 0.045), L(W, 0, 0.045), L(W, H, 0.045), L(-W, H, 0.045)], true, 0.32, HUE_BLUE, 0.45, 1.1));
  prims.push(...poly([L(-0.9, 0.08, -0.004), L(0.9, 0.08, -0.004), L(0.9, H - 0.08, -0.004), L(-0.9, H - 0.08, -0.004)], true, 0.62, HUE_CYAN, 0.65, 1.2));
  prims.push(quad(L(-0.9, 0.08, -0.002), [1.8, 0, 0], [0, d[1] * (H - 0.16), d[2] * (H - 0.16)], 0.55, HUE_BLUE, 0.2, 1.1));
  // "</>" on the screen
  const c = H / 2, zo = -0.02, j = 0.016;
  const S = (u: number, v: number): P3 => L(u, c + v, zo);
  prims.push(...poly([S(-0.27, 0.21), S(-0.52, 0), S(-0.27, -0.21)], false, 3.3, HUE_CYAN, 1, 1.7, j));
  prims.push(seg(S(0.1, 0.28), S(-0.1, -0.28), 3.3, HUE_GREEN, 1, 1.7, j));
  prims.push(...poly([S(0.27, 0.21), S(0.52, 0), S(0.27, -0.21)], false, 3.3, HUE_CYAN, 1, 1.7, j));
  return { prims, tilt: 0.42 };
}

function cameraSpec(): Spec {
  const prims: Prim[] = [];
  const by = -0.18;
  prims.push(...box([-0.15, by, 0], [0.6, 0.33, 0.28], 1.1, GRAD, { front: 0.55, top: 0.3 }));
  // lens hood: a frustum widening to the right
  const x0 = 0.45, x1 = 0.95, r0 = 0.14, r1 = 0.31;
  prims.push(arc([x0, by, 0], r0, 0, TAU, Y, Z, 1.0, HUE_CYAN, 0.9));
  prims.push(arc([x1, by, 0], r1, 0, TAU, Y, Z, 1.15, HUE_CYAN, 1));
  for (let k = 0; k < 4; k++) {
    const a = (k * TAU) / 4 + Math.PI / 4;
    prims.push(seg([x0, by + Math.cos(a) * r0, Math.sin(a) * r0], [x1, by + Math.cos(a) * r1, Math.sin(a) * r1], 0.8, HUE_BLUE, 0.8));
  }
  prims.push(prim(0.4, HUE_BLUE, 0.3, 1.1, (r, o) => {
    const h = r(), a = r() * TAU, rr = r0 + (r1 - r0) * h;
    o[0] = x0 + (x1 - x0) * h; o[1] = by + Math.cos(a) * rr; o[2] = Math.sin(a) * rr;
  }));
  // two film reels on top
  for (const [cx, cy, rr] of [[-0.43, 0.42, 0.27], [0.13, 0.37, 0.22]]) {
    prims.push(arc([cx, cy, -0.05], rr, 0, TAU, X, Y, 1.0, HUE_CYAN, 1, 1.5));
    prims.push(arc([cx, cy, 0.05], rr, 0, TAU, X, Y, 0.45, HUE_BLUE, 0.55, 1.2));
    prims.push(arc([cx, cy, -0.05], 0.055, 0, TAU, X, Y, 1.6, HUE_WHITE, 0.95, 1.4));
    for (let k = 0; k < 3; k++) {
      const a = (k * TAU) / 3 + 0.5;
      prims.push(seg([cx + Math.cos(a) * 0.07, cy + Math.sin(a) * 0.07, -0.05], [cx + Math.cos(a) * (rr - 0.02), cy + Math.sin(a) * (rr - 0.02), -0.05], 0.75, HUE_BLUE, 0.75, 1.2));
    }
  }
  // play triangle on the side panel
  const zf = -0.29;
  const pa: P3 = [-0.36, by + 0.17, zf], pb: P3 = [-0.36, by - 0.17, zf], pc: P3 = [-0.06, by, zf];
  prims.push(...poly([pa, pb, pc], true, 1.9, HUE_GREEN, 1, 1.6, 0.008));
  prims.push(tri(pa, pb, pc, 9, HUE_GREEN, 0.45, 1.2));
  return { prims, tilt: 0.2, lights: [{ x: x1, y: by, z: 0, hue: HUE_CYAN, r: 1.1 }, { x: 0.33, y: by + 0.22, z: zf, hue: HUE_GREEN, r: 0.55 }] };
}

function nibSpec(): Spec {
  const prims: Prim[] = [];
  // side curve: quadratic bezier tip (0,-1) → control (0.66,-0.4) → shoulder (0.42,0.3)
  const bez = (t: number, side: number): [number, number] => {
    const u = 1 - t;
    return [side * (2 * u * t * 0.66 + t * t * 0.42), -u * u + 2 * u * t * -0.4 + t * t * 0.3];
  };
  const surfZ = (x: number, y: number, xm: number) => -0.17 * (1 - (x / Math.max(0.05, xm)) ** 2) * Math.min(1, (y + 1) / 0.55);
  for (const side of [-1, 1]) {
    const pts: P3[] = [];
    for (let k = 0; k <= 30; k++) { const [x, y] = bez(k / 30, side); pts.push([x, y, 0]); }
    prims.push(...poly(pts, false, 1.35, GRAD, 1, 1.6));
    prims.push(...poly(pts.map((p): P3 => [p[0], p[1], 0.07]), false, 0.4, HUE_BLUE, 0.5, 1.2));
  }
  prims.push(seg([-0.42, 0.3, 0], [0.42, 0.3, 0], 1.35, GRAD, 1, 1.6));
  // curved front surface
  prims.push(prim(2.3, GRAD, 0.34, 1.2, (r, o) => {
    const [xm, y] = bez(r(), 1);
    const x = xm * (r() * 2 - 1);
    o[0] = x; o[1] = y; o[2] = surfZ(x, y, xm);
  }));
  // slit + breather hole along the ridge
  prims.push(prim(0.68 * 1.7, HUE_WHITE, 0.95, 1.4, (r, o) => {
    const y = -0.25 - r() * 0.68;
    o[0] = gauss(r) * 0.006; o[1] = y; o[2] = -0.17 * Math.min(1, (y + 1) / 0.55) - 0.005;
  }));
  prims.push(arc([0, -0.14, -0.175], 0.1, 0, TAU, X, Y, 2.0, HUE_WHITE, 1, 1.5));
  // collar above the nib
  prims.push(...box([0, 0.5, 0], [0.33, 0.12, 0.09], 0.9, HUE_CYAN, { front: 0.6 }));
  // bezier anchor with handles under the tip — the vector-tool cue
  const ay = -1.13, hs = 0.07;
  prims.push(...poly([[-hs, ay - hs, -0.02], [hs, ay - hs, -0.02], [hs, ay + hs, -0.02], [-hs, ay + hs, -0.02]], true, 1.7, HUE_GREEN, 1, 1.5));
  prims.push(seg([-0.62, ay, 0], [-hs - 0.02, ay, 0], 0.95, HUE_CYAN, 0.85, 1.3));
  prims.push(seg([hs + 0.02, ay, 0], [0.62, ay, 0], 0.95, HUE_CYAN, 0.85, 1.3));
  prims.push(arc([-0.67, ay, 0], 0.05, 0, TAU, X, Y, 2.6, HUE_GREEN, 1, 1.4));
  prims.push(arc([0.67, ay, 0], 0.05, 0, TAU, X, Y, 2.6, HUE_GREEN, 1, 1.4));
  return { prims, lights: [{ x: 0, y: ay, z: -0.02, hue: HUE_GREEN, r: 0.7 }] };
}

function chartSpec(): Spec {
  const prims: Prim[] = [];
  const base = -0.75;
  prims.push(seg([-1.08, base, 0], [1.08, base, 0], 1.0, HUE_WHITE, 0.7, 1.3));
  for (const gy of [-0.3, 0.15, 0.6]) prims.push(seg([-1.05, gy, 0.16], [1.05, gy, 0.16], 0.2, HUE_BLUE, 0.35, 1.0, 0.004));
  const hs = [0.45, 0.75, 1.05, 1.35];
  hs.forEach((h, k) => {
    const cx = -0.69 + k * 0.46;
    prims.push(...box([cx, base + h / 2, 0], [0.15, h / 2, 0.15], 0.92, GRAD, { front: 1.0, top: 0.9 }));
  });
  // rising arrow in front of the bars
  const za = -0.28, j = 0.016;
  const pts: P3[] = [[-1.0, -0.1, za], [-0.5, 0.28, za], [-0.15, 0.14, za], [0.72, 0.95, za]];
  prims.push(...poly(pts, false, 2.4, HUE_GREEN, 1, 1.7, j));
  const tip = pts[3];
  const back = Math.atan2(pts[2][1] - tip[1], pts[2][0] - tip[0]);
  for (const s of [-1, 1]) {
    const a = back + s * 0.55;
    prims.push(seg(tip, [tip[0] + Math.cos(a) * 0.27, tip[1] + Math.sin(a) * 0.27, za], 2.4, HUE_GREEN, 1, 1.7, j));
  }
  return { prims, tilt: 0.16, lights: [{ x: tip[0], y: tip[1], z: za, hue: HUE_GREEN, r: 0.9 }] };
}

function capSpec(): Spec {
  const prims: Prim[] = [];
  const yb = 0.12;
  // mortarboard: a square turned 45° (reads as a rhombus from above), with thickness
  const sq = (y: number): P3[] => [[1, y, 0], [0, y, 1], [-1, y, 0], [0, y, -1]];
  prims.push(...poly(sq(yb), true, 1.2, GRAD, 1, 1.6));
  prims.push(...poly(sq(yb - 0.06), true, 0.45, HUE_BLUE, 0.55, 1.2));
  prims.push(quad([0, yb, -1], [1, 0, 1], [-1, 0, 1], 0.8, GRAD, 0.3, 1.2));
  // skull cap below the board
  prims.push(arc([0, -0.42, 0], 0.52, 0, TAU, X, Z, 1.15, HUE_CYAN, 1, 1.5));
  prims.push(prim(1.6, HUE_BLUE, 0.34, 1.1, (r, o) => {
    const a = r() * TAU, h = r();
    o[0] = Math.cos(a) * 0.52; o[1] = -0.42 + h * 0.48; o[2] = Math.sin(a) * 0.52;
  }));
  // button, cord to the right corner, tassel hanging from it
  prims.push(blob([0, yb + 0.02, 0], 0.03, 0.3, HUE_WHITE, 1, 1.6));
  prims.push(seg([0, yb + 0.01, 0], [1, yb + 0.01, 0], 1.4, HUE_GREEN, 1, 1.5, 0.008));
  prims.push(seg([1, yb, 0], [1, -0.48, 0], 1.4, HUE_GREEN, 1, 1.5, 0.008));
  prims.push(blob([1, -0.5, 0], 0.025, 0.3, HUE_GREEN, 1, 1.6));
  prims.push(prim(1.7, HUE_GREEN, 0.85, 1.3, (r, o) => {
    const t = r(), wd = 0.03 + 0.08 * t;
    o[0] = 1 + (r() * 2 - 1) * wd; o[1] = -0.52 - 0.34 * t; o[2] = (r() * 2 - 1) * wd;
  }));
  return { prims, tilt: 0.55, lights: [{ x: 0, y: yb + 0.02, z: 0, hue: HUE_WHITE, r: 0.6 }] };
}

const SPECS: (() => Spec)[] = [starSpec, chipSpec, laptopSpec, cameraSpec, nibSpec, chartSpec, capSpec];

// ---------------------------------------------------------------- sampling + canonical order
const SECTORS = 48;
const CAM = 5;
const SWAY = [-0.62, -0.31, 0, 0.31, 0.62];
const PITCH = [-0.16, 0.16];

function p99(hist: Uint32Array, total: number, binW: number) {
  const target = total * 0.997;
  let acc = 0, b = 0;
  for (; b < hist.length; b++) { acc += hist[b]; if (acc >= target) break; }
  return (b + 1) * binW;
}

/** Builds shape k (0..SHAPES-1) with exactly n particles. Deterministic (own seed), ~2–5 ms for n ≈ 3400. */
export function buildShape(k: number, n: number): ShapeData {
  const rnd = mulberry32(7001 + k * 131);
  const spec = SPECS[k]();
  const { prims } = spec;
  // share of particles per primitive, largest remainders get the leftovers
  let W = 0;
  for (const p of prims) W += p.w;
  const cnt = prims.map((p) => Math.floor((n * p.w) / W));
  let left = n - cnt.reduce((a, b) => a + b, 0);
  const order = prims.map((p, i) => i).sort((a, b) => ((n * prims[b].w) / W) % 1 - ((n * prims[a].w) / W) % 1);
  for (let q = 0; left > 0; q = (q + 1) % order.length, left--) cnt[order[q]]++;

  const x = new Float32Array(n), y = new Float32Array(n), z = new Float32Array(n);
  const hue = new Uint8Array(n), size = new Float32Array(n), ba = new Float32Array(n);
  const o = new Float32Array(3);
  let i = 0;
  for (let p = 0; p < prims.length; p++) {
    const P = prims[p];
    for (let c = 0; c < cnt[p]; c++, i++) {
      P.at(rnd, o);
      x[i] = o[0]; y[i] = o[1]; z[i] = o[2];
      hue[i] = P.hue;
      size[i] = P.sz * (0.7 + rnd() * 0.6);
      ba[i] = P.ba * (0.82 + rnd() * 0.18);
    }
  }
  const lights = (spec.lights || []).map((l) => ({ ...l }));

  // bake the "seen from slightly above" tilt (laptop keyboard, cap board) — a rotation about X
  if (spec.tilt) {
    const c = Math.cos(spec.tilt), s = Math.sin(spec.tilt);
    for (let q = 0; q < n; q++) { const yy = y[q], zz = z[q]; y[q] = yy * c + zz * s; z[q] = zz * c - yy * s; }
    for (const l of lights) { const yy = l.y, zz = l.z; l.y = yy * c + zz * s; l.z = zz * c - yy * s; }
  }
  // centre on the bounding box and normalise the larger half-extent to 1
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let q = 0; q < n; q++) {
    if (x[q] < x0) x0 = x[q]; if (x[q] > x1) x1 = x[q];
    if (y[q] < y0) y0 = y[q]; if (y[q] > y1) y1 = y[q];
    if (z[q] < z0) z0 = z[q]; if (z[q] > z1) z1 = z[q];
  }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  const sc = 1 / Math.max(x1 - cx, y1 - cy, 1e-3);
  for (let q = 0; q < n; q++) { x[q] = (x[q] - cx) * sc; y[q] = (y[q] - cy) * sc; z[q] = (z[q] - cz) * sc; }
  for (const l of lights) { l.x = (l.x - cx) * sc; l.y = (l.y - cy) * sc; l.z = (l.z - cz) * sc; }
  // brand gradient hues + a sprinkle of green
  for (let q = 0; q < n; q++) {
    if (hue[q] !== GRAD) continue;
    const t = 0.5 + 0.38 * (x[q] + y[q]);
    hue[q] = rnd() < 0.05 ? HUE_GREEN : rnd() < t ? HUE_CYAN : HUE_BLUE;
  }

  // canonical order: angular sectors of equal count, radius ascending inside each sector
  const ang = new Float32Array(n), rad = new Float32Array(n);
  for (let q = 0; q < n; q++) { ang[q] = Math.atan2(y[q], x[q]); rad[q] = Math.hypot(x[q], y[q]); }
  const idx = Array.from({ length: n }, (_, q) => q).sort((a, b) => ang[a] - ang[b]);
  for (let s = 0; s < SECTORS; s++) {
    const a = Math.floor((s * n) / SECTORS), b = Math.floor(((s + 1) * n) / SECTORS);
    const part = idx.slice(a, b).sort((u, v) => rad[u] - rad[v]);
    for (let q = 0; q < part.length; q++) idx[a + q] = part[q];
  }
  const perm = <T extends Float32Array | Uint8Array>(src: T): T => {
    const dst = new (src.constructor as { new (len: number): T })(n);
    for (let q = 0; q < n; q++) dst[q] = src[idx[q]];
    return dst;
  };
  const sx = perm(x), sy = perm(y), sz = perm(z);

  // projected extents over the sway range (yaw ±0.62, pitch ±0.16) incl. perspective → no "breathing" fit
  const BINS = 240, binW = 2.4 / BINS;
  const hx = new Uint32Array(BINS), hy = new Uint32Array(BINS);
  let ex = 0, ey = 0;
  for (const yaw of SWAY) {
    const cyw = Math.cos(yaw), syw = Math.sin(yaw);
    for (const pit of PITCH) {
      const cp = Math.cos(pit), sp = Math.sin(pit);
      hx.fill(0); hy.fill(0);
      for (let q = 0; q < n; q++) {
        const xr = cyw * sx[q] + syw * sz[q];
        const zr = -syw * sx[q] + cyw * sz[q];
        const yr = cp * sy[q] - sp * zr;
        const zz = sp * sy[q] + cp * zr;
        const pr = CAM / (CAM + zz);
        hx[Math.min(BINS - 1, (Math.abs(xr * pr) / binW) | 0)]++;
        hy[Math.min(BINS - 1, (Math.abs(yr * pr) / binW) | 0)]++;
      }
      ex = Math.max(ex, p99(hx, n, binW));
      ey = Math.max(ey, p99(hy, n, binW));
    }
  }

  return { n, x: sx, y: sy, z: sz, hue: perm(hue), size: perm(size), ba: perm(ba), ex, ey, lights };
}

// ---------------------------------------------------------------- background
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

function starsOf(n: number, rnd: Rnd): StarData {
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
function planetOf(nSphere: number, nRing: number, main: number, rim: number, rnd: Rnd): PlanetData {
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
  /** particles per hologram shape (same N for every shape) */
  n: number;
  stars: StarData;
  planetA: PlanetData;
  planetB: PlanetData;
}

/** Splits the particle budget: ~80% hologram, the rest is the starfield and two planets. */
export function buildScene(count: number): SceneData {
  const rnd = mulberry32(2019);
  const nStars = Math.round(count * 0.09);
  const nPA = Math.round(count * 0.062);
  const nPAr = Math.round(count * 0.029);
  const nPB = Math.round(count * 0.026);
  return {
    n: Math.max(200, count - nStars - nPA - nPAr - nPB),
    stars: starsOf(nStars, rnd),
    planetA: planetOf(nPA, nPAr, HUE_BLUE, HUE_CYAN, rnd),
    planetB: planetOf(nPB, 0, HUE_GREEN, HUE_CYAN, rnd),
  };
}
