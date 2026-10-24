// Lightweight 3D particle engine (Canvas 2D, no WebGL/three.js dependency).
// Three formations are morphed by a 0..1 "progress" value — the hero's story:
//   0.00 → planet  (the world: wireframe globe with an orbiting data ring)
//   0.50 → galaxy  (the world dissolves into a swirling spiral of raw data)
//   1.00 → star    (data condenses into the DATA 4-point brand star, a 3D lens)

export interface FieldOptions {
  count: number;
  dark: boolean;
}

interface P {
  g: [number, number, number]; // planet position
  // galaxy is animated, so it's stored in polar form: radius, base angle, height
  gr: number;
  ga: number;
  gy: number;
  s: [number, number, number]; // star position
  hue: number; // 0 = blue, 1 = cyan, 2 = green
  size: number;
  phase: number;
}

const TAU = Math.PI * 2;

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Brand star outline: |x|^k + |y|^k = 1 with k < 1 gives the concave 4-point star.
function starRadius(theta: number, k = 0.62) {
  const c = Math.abs(Math.cos(theta));
  const s = Math.abs(Math.sin(theta));
  return 1 / Math.pow(Math.pow(c, k) + Math.pow(s, k), 1 / k);
}

const gauss = (rnd: () => number) => rnd() + rnd() + rnd() - 1.5;

function build(count: number): P[] {
  const rnd = mulberry32(2019);
  const pts: P[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const R = 1.0;
  const RING_TILT = 0.42;

  for (let i = 0; i < count; i++) {
    let hueBias = -1;

    // ---- planet: surface + parallels + meridians + a tilted orbit ring
    let g: [number, number, number];
    const kind = rnd();
    if (kind < 0.3) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      g = [Math.cos(th) * r * R, y * R, Math.sin(th) * r * R];
    } else if (kind < 0.58) {
      const lat = (Math.floor(rnd() * 7) - 3) * (Math.PI / 8);
      const lon = rnd() * TAU;
      g = [Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R];
    } else if (kind < 0.8) {
      const lon = Math.floor(rnd() * 6) * (Math.PI / 6);
      const lat = rnd() * TAU;
      g = [Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R];
    } else {
      // orbit ring (data in transit) — slightly thick, tilted
      const a = rnd() * TAU;
      const rr = 1.55 + gauss(rnd) * 0.09;
      const x = Math.cos(a) * rr;
      const z = Math.sin(a) * rr;
      const y = gauss(rnd) * 0.03;
      g = [x, y * Math.cos(RING_TILT) - z * Math.sin(RING_TILT), y * Math.sin(RING_TILT) + z * Math.cos(RING_TILT)];
      hueBias = rnd() < 0.55 ? 2 : 1;
    }

    // ---- galaxy: 3-arm logarithmic spiral disk with a bright core
    const arm = Math.floor(rnd() * 3);
    const t = Math.pow(rnd(), 0.75);
    const gr = 0.08 + t * 1.75;
    const ga = (arm * TAU) / 3 + gr * 2.4 + gauss(rnd) * (0.16 + 0.2 * (1 - t));
    const gy = gauss(rnd) * 0.12 * (1.2 - t);

    // ---- star: 70% on the outline (crisp silhouette), 30% filling the body
    const a = rnd() * TAU;
    const edge = rnd() < 0.7;
    const sr = starRadius(a) * (edge ? 1 - rnd() * 0.04 : Math.sqrt(rnd()) * 0.96);
    const S = 1.2;
    const sx = Math.cos(a) * sr * S;
    const sy = Math.sin(a) * sr * S;
    // lens-shaped depth: thick in the middle, razor-thin at the tips
    const thick = Math.max(0, 1 - sr) * 0.42;
    const sz = (rnd() * 2 - 1) * thick * S;

    const hr = rnd();
    pts.push({
      g,
      gr,
      ga,
      gy,
      s: [sx, sy, sz],
      hue: hueBias >= 0 ? hueBias : hr < 0.6 ? 0 : hr < 0.92 ? 1 : 2,
      size: 1.5 + rnd() * 2.0,
      phase: rnd() * TAU,
    });
  }
  return pts;
}

// fillStyle strings pre-built per hue × 21 alpha steps (no string allocation per particle)
const buildStyles = (rgb: string[]) => rgb.map((c) => Array.from({ length: 21 }, (_, q) => `rgba(${c},${(q / 20).toFixed(2)})`));
const STYLES_DARK = buildStyles(['40,120,255', '96,239,255', '0,210,120']);
const STYLES_LIGHT = buildStyles(['0,82,217', '0,140,170', '0,150,90']);

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export class ParticleField {
  private ctx: CanvasRenderingContext2D;
  private pts: P[];
  private w = 0;
  private h = 0;
  private dpr = 1;
  private raf = 0;
  private running = false;
  private t0 = performance.now();
  private dark: boolean;
  progress = 0;
  // smoothed values so scroll jumps never cause visual snapping
  private sp = 0;
  private mx = 0;
  private my = 0;
  private tmx = 0;
  private tmy = 0;
  /** horizontal anchor of the formation (0..1 of width) */
  anchorX = 0.5;
  private sax = 0.5;
  /** vertical anchor (0..1 of height); phones park the world above the headline */
  anchorY = 0.5;
  /** particle size multiplier (phones use finer dust) */
  sizeMul = 1;
  private say = 0.5;
  private spinAcc = 0;
  private lastT = 0;
  /** overall brightness (0..1), e.g. lowered behind text on small screens */
  dim = 1;
  private sdim = 1;

  constructor(private canvas: HTMLCanvasElement, opts: FieldOptions) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('2D canvas unsupported');
    this.ctx = ctx;
    this.pts = build(opts.count);
    this.dark = opts.dark;
    this.resize();
  }

  setDark(dark: boolean) {
    this.dark = dark;
  }

  pointer(nx: number, ny: number) {
    this.tmx = nx;
    this.tmy = ny;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.frame();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Render a single frame (used for reduced-motion static rendering). */
  renderStatic(progress: number) {
    this.progress = progress;
    this.sp = progress;
    this.frame(true);
  }

  private frame(still = false) {
    const { ctx, w, h, dpr } = this;
    const time = still ? 0 : (performance.now() - this.t0) / 1000;
    const dt = still ? 0 : Math.min(0.05, time - this.lastT);
    this.lastT = time;
    this.sp += (this.progress - this.sp) * (still ? 1 : 0.085);
    this.mx += (this.tmx - this.mx) * 0.05;
    this.my += (this.tmy - this.my) * 0.05;
    this.sax += (this.anchorX - this.sax) * (still ? 1 : 0.06);
    this.say += (this.anchorY - this.say) * (still ? 1 : 0.06);
    this.sdim += (this.dim - this.sdim) * (still ? 1 : 0.06);

    const p = clamp01(this.sp);
    // morph weights: planet→galaxy over [0, .5], galaxy→star over [.5, 1]
    const m1 = ease(clamp01(p / 0.5));
    const m2 = ease(clamp01((p - 0.5) / 0.5));

    // "burst": peaks mid-transition (planet->galaxy, galaxy->star): the camera flies in, the field
    // spins up and glows, then everything settles into the next shape
    const burst = Math.sin(Math.PI * m1) * (1 - m2) + Math.sin(Math.PI * m2);
    this.spinAcc += dt * (0.25 + 1.5 * burst);

    // camera: planet spins on its axis; galaxy is seen from above at an angle; star faces viewer
    const spin = still ? 0 : this.spinAcc;
    const rotY = spin * (1 - m2) + Math.sin(time * 0.6) * 0.3 * m2 + this.mx * 0.45;
    const rotX = -0.22 * (1 - m1) + 0.95 * m1 * (1 - m2) + this.my * 0.3 + Math.sin(time * 0.4) * 0.05;
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);

    const minDim = Math.min(w, h);
    const scale = minDim * (0.3 + 0.05 * m1 - 0.07 * m2) * (1 + 0.08 * burst);
    const ox = w * this.sax;
    const oy = h * (this.say - 0.14 * clamp01(p * 4)); // lift the shape once captions appear below
    const focal = 3.4;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // soft core glow behind the formation
    const glowR = scale * (1.7 - 0.2 * m2);
    const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, glowR);
    const ga = (this.dark ? 0.24 : 0.11) * this.sdim * (1 + 0.4 * m1 * (1 - m2) + 0.9 * burst);
    glow.addColorStop(0, `rgba(0,97,255,${ga.toFixed(3)})`);
    glow.addColorStop(0.5, `rgba(96,239,255,${(ga * 0.22).toFixed(3)})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = this.dark ? 'lighter' : 'source-over';
    const styles = this.dark ? STYLES_DARK : STYLES_LIGHT;

    const pts = this.pts;
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];

      // galaxy position for this frame: differential rotation (inner arms turn faster)
      const ang = pt.ga + time * (0.55 / (pt.gr + 0.35));
      const qx = Math.cos(ang) * pt.gr;
      const qz = Math.sin(ang) * pt.gr;
      const qy = pt.gy;

      let x = pt.g[0] + (qx - pt.g[0]) * m1;
      let y = pt.g[1] + (qy - pt.g[1]) * m1;
      let z = pt.g[2] + (qz - pt.g[2]) * m1;
      x += (pt.s[0] - x) * m2;
      y += (pt.s[1] - y) * m2;
      z += (pt.s[2] - z) * m2;

      // rotate Y then X
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      const y1 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;

      const persp = focal / (focal + z2);
      const px = ox + x1 * scale * persp;
      const py = oy - y1 * scale * persp;
      if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;

      const depth = clamp01((z2 + 1.8) / 3.6); // 0 near → 1 far
      const twinkle = 0.78 + 0.22 * Math.sin(time * 2.2 + pt.phase);
      const alpha = Math.min(1, (this.dark ? 1 : 0.85) * (1 - depth * 0.65) * twinkle * this.sdim);
      const size = pt.size * persp * this.sizeMul * (1 + 0.45 * burst);

      ctx.fillStyle = styles[pt.hue][Math.round(alpha * 20)];
      ctx.fillRect(px - size / 2, py - size / 2, size, size);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}
