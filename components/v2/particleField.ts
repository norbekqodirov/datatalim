// Lightweight 3D particle engine (Canvas 2D, no WebGL/three.js dependency).
// Three formations are morphed by a 0..1 "progress" value:
//   0.00 → chaos  (raw, unstructured data)
//   0.50 → globe  (structure: fibonacci sphere)
//   1.00 → star   (the DATA 4-point brand star, extruded into a 3D lens)

export interface FieldOptions {
  count: number;
  dark: boolean;
}

interface P {
  // chaos, globe, star positions (x,y,z interleaved)
  c: [number, number, number];
  g: [number, number, number];
  s: [number, number, number];
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

function build(count: number): P[] {
  const rnd = mulberry32(2019);
  const pts: P[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    // chaos: dense nebula of raw data, slightly flattened
    const gx = (rnd() + rnd() + rnd() - 1.5) * 1.35;
    const gy = (rnd() + rnd() + rnd() - 1.5) * 1.0;
    const gz = (rnd() + rnd() + rnd() - 1.5) * 1.2;

    // globe: 40% fibonacci surface + 60% on latitude/meridian rings so it reads as a wireframe
    const R = 1.05;
    let g: [number, number, number];
    const kind = rnd();
    if (kind < 0.4) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      g = [Math.cos(th) * r * R, y * R, Math.sin(th) * r * R];
    } else if (kind < 0.75) {
      const lat = (Math.floor(rnd() * 7) - 3) * (Math.PI / 8); // 7 parallels
      const lon = rnd() * TAU;
      g = [Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R];
    } else {
      const lon = Math.floor(rnd() * 8) * (Math.PI / 8); // 8 meridians
      const lat = rnd() * TAU;
      g = [Math.cos(lat) * Math.cos(lon) * R, Math.sin(lat) * R, Math.cos(lat) * Math.sin(lon) * R];
    }

    // star: 70% on the outline (crisp silhouette), 30% filling the body
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
      c: [gx, gy, gz],
      g,
      s: [sx, sy, sz],
      hue: hr < 0.62 ? 0 : hr < 0.92 ? 1 : 2,
      size: 1.1 + rnd() * 1.5,
      phase: rnd() * TAU,
    });
  }
  return pts;
}

// fillStyle strings pre-built per hue × 21 alpha steps (no string allocation per particle)
const buildStyles = (rgb: string[]) => rgb.map((c) => Array.from({ length: 21 }, (_, q) => `rgba(${c},${(q / 20).toFixed(2)})`));
const STYLES_DARK = buildStyles(['0,97,255', '96,239,255', '0,178,107']);
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
    this.sp += (this.progress - this.sp) * (still ? 1 : 0.085);
    this.mx += (this.tmx - this.mx) * 0.05;
    this.my += (this.tmy - this.my) * 0.05;
    this.sax += (this.anchorX - this.sax) * (still ? 1 : 0.06);
    this.sdim += (this.dim - this.sdim) * (still ? 1 : 0.06);

    const p = clamp01(this.sp);
    // morph weights: chaos→globe over [0, .5], globe→star over [.5, 1]
    const m1 = ease(clamp01(p / 0.5));
    const m2 = ease(clamp01((p - 0.5) / 0.5));

    // rotation: spins slower as structure emerges, then settles facing the viewer
    const spin = time * (0.22 - 0.12 * m2);
    const rotY = spin * (1 - m2) + (Math.sin(time * 0.6) * 0.35) * m2 + this.mx * 0.5;
    const rotX = -0.25 * (1 - m2) + this.my * 0.35 + Math.sin(time * 0.4) * 0.06;
    const cy = Math.cos(rotY), sy = Math.sin(rotY);
    const cx = Math.cos(rotX), sx = Math.sin(rotX);

    const minDim = Math.min(w, h);
    const scale = minDim * (0.31 + 0.02 * m1);
    const ox = w * this.sax;
    const oy = h * (0.5 - 0.09 * m1); // lift the shape so captions below stay clear
    const focal = 3.2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // soft core glow behind the formation, strongest once structure appears
    const glowR = scale * (1.5 + 0.3 * m2);
    const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, glowR);
    const ga = (this.dark ? 0.16 : 0.08) * (0.35 + 0.65 * m1);
    glow.addColorStop(0, `rgba(0,97,255,${ga.toFixed(3)})`);
    glow.addColorStop(0.55, `rgba(96,239,255,${(ga * 0.25).toFixed(3)})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = this.dark ? 'lighter' : 'source-over';

    const styles = this.dark ? STYLES_DARK : STYLES_LIGHT;

    const pts = this.pts;
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      // drift gives the chaos state life; fades out as structure forms
      const drift = (1 - m1) * 0.08;
      const dx = Math.sin(time * 0.7 + pt.phase) * drift;
      const dy = Math.cos(time * 0.5 + pt.phase * 1.3) * drift;

      let x = pt.c[0] + dx + (pt.g[0] - pt.c[0] - dx) * m1;
      let y = pt.c[1] + dy + (pt.g[1] - pt.c[1] - dy) * m1;
      let z = pt.c[2] + (pt.g[2] - pt.c[2]) * m1;
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

      const depth = clamp01((z2 + 1.6) / 3.2); // 0 near → 1 far
      const twinkle = 0.75 + 0.25 * Math.sin(time * 2 + pt.phase);
      const alpha = Math.min(1, (this.dark ? 1 : 0.85) * (1 - depth * 0.6) * twinkle * this.sdim);
      const size = pt.size * persp * (1 + m2 * 0.25);

      ctx.fillStyle = styles[pt.hue][Math.round(alpha * 20)];
      ctx.fillRect(px - size / 2, py - size / 2, size, size);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}
