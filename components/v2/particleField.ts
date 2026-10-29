// Lightweight 3D particle engine (Canvas 2D, no WebGL/three.js dependency).
// Hero: a particle "hologram" that keeps re-forming into the seven things DATA teaches —
//   brand star → AI chip → laptop </> → movie camera → pen nib → bar chart ↗ → graduation cap → (star …)
// Each shape holds ~3 s, then the particles flow to the next one in ~1.35 s: particle i of one shape goes to
// particle i of the next (both stored in the same angular/radial order), with a per-particle stagger that sweeps
// round the shape and a mid-flight swirl about the vertical axis. The hologram sways ±35° (never edge-on).
// Scroll story (0..1 "progress", a pure function of scroll, so it runs backwards too):
//   0 A — the shapes cycle beside the headline (above it on phones)
//   .5 B — the particles scatter into a full-screen, slowly drifting data cloud (thinned over the caption)
//   1 C — the cloud streams into the centre and forms the DATA brand star (inside the band, clear of the caption)
// Background: twinkling starfield and two particle planets (baked into sprites) with mouse/scroll parallax.
// Geometry lives in shapeScene.ts; this file only animates and draws it.

import {
  buildScene, buildShape, mulberry32, SHAPES, TAU, HUE_BLUE, HUE_CYAN, HUE_GREEN, HUE_WHITE,
  type SceneData, type PlanetData, type ShapeData,
} from './shapeScene';

export interface FieldOptions {
  count: number;
  dark: boolean;
  /** device-pixel-ratio cap (phones 1.5, weak devices 1) */
  maxDpr?: number;
}

// fillStyle strings pre-built per hue × 21 alpha steps (no string allocation per particle)
const buildStyles = (rgb: string[]) => rgb.map((c) => Array.from({ length: 21 }, (_, q) => `rgba(${c},${(q / 20).toFixed(2)})`));
// order matches HUE_BLUE, HUE_CYAN, HUE_GREEN, HUE_WHITE
const RGB_DARK = ['40,120,255', '96,239,255', '0,210,120', '236,244,255'];
// light theme: deep ink (#0052d9 / #0891b2 / #00995c) so the hologram keeps its shape on a pale sky
const RGB_LIGHT = ['0,82,217', '8,145,178', '0,153,92', '24,40,84'];
const STYLES_DARK = buildStyles(RGB_DARK);
const STYLES_LIGHT = buildStyles(RGB_LIGHT);

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// sine lookup (morph swirl + twinkle run per particle per frame)
const LUT_N = 1024;
const LUT_K = LUT_N / TAU;
const SIN = new Float32Array(LUT_N);
for (let i = 0; i < LUT_N; i++) SIN[i] = Math.sin(i / LUT_K);
const fsin = (a: number) => SIN[((a * LUT_K) | 0) & (LUT_N - 1)];

// ---- 3×3 row-major matrices
type M3 = Float64Array;
const m3 = () => new Float64Array(9);
// written in place (no temporary arrays per frame)
function setRotX(m: M3, a: number) { const c = Math.cos(a), s = Math.sin(a); m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0; m[4] = c; m[5] = -s; m[6] = 0; m[7] = s; m[8] = c; return m; }
function setRotY(m: M3, a: number) { const c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = 0; m[2] = s; m[3] = 0; m[4] = 1; m[5] = 0; m[6] = -s; m[7] = 0; m[8] = c; return m; }
function setRotZ(m: M3, a: number) { const c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = -s; m[2] = 0; m[3] = s; m[4] = c; m[5] = 0; m[6] = 0; m[7] = 0; m[8] = 1; return m; }
function mul(out: M3, a: M3, b: M3) {
  const r0 = a[0] * b[0] + a[1] * b[3] + a[2] * b[6], r1 = a[0] * b[1] + a[1] * b[4] + a[2] * b[7], r2 = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
  const r3 = a[3] * b[0] + a[4] * b[3] + a[5] * b[6], r4 = a[3] * b[1] + a[4] * b[4] + a[5] * b[7], r5 = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
  const r6 = a[6] * b[0] + a[7] * b[3] + a[8] * b[6], r7 = a[6] * b[1] + a[7] * b[4] + a[8] * b[7], r8 = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
  out[0] = r0; out[1] = r1; out[2] = r2; out[3] = r3; out[4] = r4; out[5] = r5; out[6] = r6; out[7] = r7; out[8] = r8;
  return out;
}

/** Soft round glow sprite (running lights, beacons). */
function glowSprite(rgb: string, px: number) {
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const g = c.getContext('2d');
  if (g) {
    const r = px / 2;
    const grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.18, `rgba(${rgb},0.95)`);
    grd.addColorStop(0.45, `rgba(${rgb},0.28)`);
    grd.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grd;
    g.fillRect(0, 0, px, px);
  }
  return c;
}

/** The hologram's soft glow, baked once: blue centre → faint cyan → transparent (drawn with globalAlpha). */
function coreGlowSprite() {
  const px = 256;
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const g = c.getContext('2d');
  if (g) {
    const r = px / 2;
    const grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, 'rgba(0,97,255,1)');
    grd.addColorStop(0.45, 'rgba(96,239,255,0.28)');
    grd.addColorStop(1, 'rgba(96,239,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, px, px);
  }
  return c;
}

// background planets [sprite 0=A|1=B, fx, fy, parallax, alpha] by orientation — constant, no per-frame arrays.
// landscape: the big ringed planet sits low right, clear of the navbar and the headline
const PLANETS_PORTRAIT: [0 | 1, number, number, number, number][] = [[0, 0.12, 0.2, 1, 1], [1, 0.9, 0.3, 0.6, 1]];
const PLANETS_LANDSCAPE: [0 | 1, number, number, number, number][] = [[0, 0.93, 0.84, 1, 0.6], [1, 0.05, 0.93, 0.6, 0.8]];


// adaptive quality: this many consecutive slow frames step the quality down one notch.
// A frame is slow when the interval is > SLOW_MS AND our own draw cost is heavy (> BUSY_MS), or the interval is
// beyond HARD_MS. A steady ~33ms interval with a cheap draw is a 30Hz display / Low Power mode cap, not slowness.
const SLOW_MS = 24;
const BUSY_MS = 12;
const HARD_MS = 40;
const SLOW_RUN = 20;

// morph rhythm (seconds): each shape holds, then flows into the next one
const HOLD = 3;
const MORPH = 1.35;
// per-particle start delay spans this share of the morph; each particle travels for the rest
const STAGGER = 0.34;
// shape <-> data cloud <-> star (scroll-driven): per-particle delay spans this share of the scroll transition
const CLOUD_STAGGER = 0.4;
const HALF_PI = Math.PI / 2;
// smootherstep: zero velocity and acceleration at both ends
const smooth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

type IdleWin = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };

export class ParticleField {
  private ctx: CanvasRenderingContext2D;
  private scene: SceneData;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private maxDpr: number;
  private raf = 0;
  // adaptive quality: draw every `step`-th hologram particle (1, 2, 3), each a touch larger to keep the density
  private step = 1;
  private slow = 0;
  private cost = 0;
  private warm = 0;
  private lastTs = 0;
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
  /** horizontal anchor of the hologram (0..1 of width) */
  anchorX = 0.5;
  private sax = 0.5;
  private sax0 = -1; // anchor at first frame: background parallax is measured from here
  /** vertical anchor (0..1 of height); phones park the hologram above the headline */
  anchorY = 0.5;
  /** particle size multiplier (phones use finer dust) */
  sizeMul = 1;
  /** hologram size multiplier for band-less (static) layouts */
  zoom = 1;
  private say = 0.5;
  private swayT = 0;
  private lastT = 0;
  /** overall brightness (0..1), e.g. lowered behind text on small screens */
  dim = 1;
  private sdim = 1;
  /**
   * Vertical band [top, bottom] in canvas px that the hologram must stay inside (below the navbar,
   * above the caption / headline). When set, the hologram centres itself in the band and shrinks to fit,
   * using each shape's precomputed projected extent. null = free placement (anchorY, no fit).
   * The starfield and planets always fill the whole canvas.
   */
  band: [number, number] | null = null;
  /**
   * Optional horizontal band [left, right] in canvas px: the hologram centres between them and shrinks so it
   * never crosses `left` (desktop first screen: keeps a clear gap to the headline). Overrides anchorX.
   */
  bandX: [number, number] | null = null;
  /** Caption box [x0, y0, x1, y1] in canvas px: the scattered data cloud thins out over it so the text stays legible. */
  quiet: [number, number, number, number] | null = null;
  private sTop = 0;
  private sBot = 0;
  private fit = 1;
  // ---- hologram shapes: built lazily (shape 0 now, the rest one per idle slot after the first start)
  private shapes: (ShapeData | null)[] = new Array(SHAPES).fill(null);
  private built = 1;
  private idle = 0;
  private idleIsTimer = false;
  private cur = 0; // shape on show (morph source)
  private clock = 0; // seconds into the current hold + morph
  /** QA only: pin the cycle to shape `shape` with morph progress `t` (0 = holding, 0..1 = flowing to the next). */
  qa: { shape: number; t: number } | null = null;
  // per-particle morph constants (index-aligned with every shape)
  private del: Float32Array;
  private sw: Float32Array;
  private zj: Float32Array;
  // scroll story B: per-particle place in the full-screen data cloud (index-aligned too)
  private cx: Float32Array; // -1..1 of the half width; angle follows the index, so the shape bursts outwards radially
  private cy: Float32Array;
  private cd: Float32Array; // depth 0 far .. 1 near → size, brightness, drift, parallax
  private cph: Float32Array;
  private csp: Float32Array;
  private chue: Uint8Array;
  private cdel: Float32Array; // stagger for shape ⇄ cloud ⇄ star
  private view = m3();
  private tA = m3();
  private tB = m3();
  // baked sprites (rebuilt on resize / theme change)
  private spriteA: HTMLCanvasElement | null = null;
  private spriteB: HTMLCanvasElement | null = null;
  private glows: HTMLCanvasElement[] = [];
  private coreGlow: HTMLCanvasElement | null = null;
  private spriteKey = '';

  constructor(private canvas: HTMLCanvasElement, opts: FieldOptions) {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('2D canvas unsupported');
    this.ctx = ctx;
    this.scene = buildScene(opts.count);
    const n = this.scene.n;
    this.shapes[0] = buildShape(0, n);
    // stagger: a sweep round the shape (indices are in angular order) plus a little noise
    const rnd = mulberry32(77);
    this.del = new Float32Array(n);
    this.sw = new Float32Array(n);
    this.zj = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      this.del[i] = STAGGER * (0.7 * (i / n) + 0.3 * rnd());
      this.sw[i] = 0.55 + 0.45 * rnd();
      this.zj[i] = 0.3 + 0.7 * rnd();
    }
    this.cx = new Float32Array(n);
    this.cy = new Float32Array(n);
    this.cd = new Float32Array(n);
    this.cph = new Float32Array(n);
    this.csp = new Float32Array(n);
    this.chue = new Uint8Array(n);
    this.cdel = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // angle from the (angularly sorted) index, area-uniform radius stretched to fill the whole rectangle
      const a = (i / n) * TAU - Math.PI + (rnd() - 0.5) * 0.5;
      const ca = Math.cos(a), sa = Math.sin(a);
      // a little denser towards the middle, still reaching every edge
      const r = (0.1 + 0.9 * Math.pow(rnd(), 0.62)) / Math.max(Math.abs(ca), Math.abs(sa));
      this.cx[i] = ca * r;
      this.cy[i] = sa * r;
      this.cd[i] = Math.pow(rnd(), 1.6);
      this.cph[i] = rnd() * TAU;
      this.csp[i] = 0.25 + rnd() * 0.45;
      const hq = rnd();
      this.chue[i] = hq < 0.5 ? HUE_BLUE : hq < 0.86 ? HUE_CYAN : hq < 0.95 ? HUE_GREEN : HUE_WHITE;
      this.cdel[i] = CLOUD_STAGGER * rnd();
    }
    this.dark = opts.dark;
    this.maxDpr = opts.maxDpr ?? 2;
    this.canvas.dataset.shape = '0';
    this.resize();
  }

  /** Current render quality, for QA: "dpr|step|particles" (also mirrored to canvas[data-q]). */
  get quality() {
    return `${this.dpr}|${this.step}|${this.scene.n}`;
  }

  setDark(dark: boolean) {
    this.dark = dark;
  }

  pointer(nx: number, ny: number) {
    this.tmx = nx;
    this.tmy = ny;
  }

  /** Re-reads the canvas size. Returns false (and touches nothing) when size and DPR are unchanged,
   *  so mobile URL-bar resizes never reallocate the backing store. */
  resize(): boolean {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    if (rect.width === this.w && rect.height === this.h && dpr === this.dpr && this.canvas.width > 0) return false;
    this.dpr = dpr;
    this.w = rect.width;
    this.h = rect.height;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.dataset.q = this.quality;
    return true;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.warm = 0;
    this.slow = 0;
    this.cost = 0;
    this.scheduleBuild();
    const loop = (ts: number) => {
      if (!this.running) return;
      this.watch(ts);
      const t = performance.now();
      this.frame();
      // smoothed CPU cost of our draw (rasterisation may land later, HARD_MS still catches that)
      this.cost += (performance.now() - t - this.cost) * 0.2;
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Builds the remaining shapes one per idle slot (a few ms each), so loading never gets a new long task. */
  private scheduleBuild() {
    if (this.built >= SHAPES || this.idle) return;
    const win = window as IdleWin;
    const run = () => {
      this.idle = 0;
      if (this.built < SHAPES) {
        this.shapes[this.built] = buildShape(this.built, this.scene.n);
        this.built++;
      }
      if (this.running) this.scheduleBuild();
    };
    if (win.requestIdleCallback) {
      this.idleIsTimer = false;
      this.idle = win.requestIdleCallback(run, { timeout: 1500 });
    } else {
      this.idleIsTimer = true;
      this.idle = window.setTimeout(run, 60);
    }
  }

  private ensureShape(k: number): ShapeData {
    while (this.built <= k) {
      this.shapes[this.built] = buildShape(this.built, this.scene.n);
      this.built++;
    }
    return this.shapes[k] as ShapeData;
  }

  /** Steps quality down after a run of slow frames: first DPR → 1, then 1/2 (desktop: 1/3) of the hologram particles. */
  private watch(ts: number) {
    const d = ts - this.lastTs;
    this.lastTs = ts;
    if (this.warm < 30) { this.warm++; return; } // start-up / tab-return frames are noisy
    if (d > 250) return; // a one-off hitch (GC, tab switch) is not a trend
    this.slow = d > HARD_MS || (d > SLOW_MS && this.cost > BUSY_MS) ? this.slow + 1 : 0;
    if (this.slow < SLOW_RUN) return;
    this.slow = 0;
    this.warm = 0;
    if (this.dpr > 1) {
      this.maxDpr = 1;
      this.resize();
    } else if (this.step < (this.scene.n > 2500 ? 3 : 2)) {
      // big (desktop) scenes may go to a third of the particles; phone scenes stop at half
      this.step++;
    } else {
      return;
    }
    this.canvas.dataset.q = this.quality;
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    if (this.idle) {
      const win = window as IdleWin;
      if (this.idleIsTimer) clearTimeout(this.idle);
      else win.cancelIdleCallback?.(this.idle);
      this.idle = 0;
    }
  }

  /** Render a single frame (used for reduced-motion static rendering: the brand star, no motion). */
  renderStatic(progress: number) {
    this.progress = progress;
    this.sp = progress;
    this.frame(true);
  }

  // ---- layout of the background (fractions of the canvas), by orientation
  private get portrait() {
    return this.h > this.w * 1.1;
  }

  private planetRadii(): [number, number] {
    const md = Math.min(this.w, this.h);
    return this.portrait ? [md * 0.06, md * 0.024] : [md * 0.048, md * 0.02];
  }

  private bakePlanet(p: PlanetData, radius: number, styles: string[][]) {
    // baked at 1.5× so the approach zoom stays crisp
    const k = this.dpr * 1.5;
    const half = Math.ceil(radius * p.ext + 3);
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(half * 2 * k);
    const g = c.getContext('2d');
    if (!g) return c;
    g.setTransform(k, 0, 0, k, 0, 0);
    g.globalCompositeOperation = this.dark ? 'lighter' : 'source-over';
    const sm = Math.max(0.75, Math.min(1.2, radius / 40)) * this.sizeMul;
    for (let i = 0; i < p.n; i++) {
      const s = p.size[i] * sm;
      g.fillStyle = styles[p.hue[i]][Math.round(clamp01(p.a[i] * (this.dark ? 1.25 : 0.9)) * 20)];
      g.fillRect(half + p.x[i] * radius - s / 2, half - p.y[i] * radius - s / 2, s, s);
    }
    return c;
  }

  private ensureSprites() {
    const [ra, rb] = this.planetRadii();
    const key = `${this.dark}|${this.dpr}|${Math.round(ra)}|${Math.round(rb)}|${this.sizeMul}`;
    if (key === this.spriteKey) return;
    this.spriteKey = key;
    const styles = this.dark ? STYLES_DARK : STYLES_LIGHT;
    this.spriteA = this.bakePlanet(this.scene.planetA, ra, styles);
    this.spriteB = this.bakePlanet(this.scene.planetB, rb, styles);
    const rgb = this.dark ? RGB_DARK : RGB_LIGHT;
    this.glows = rgb.map((c) => glowSprite(c, Math.round(32 * this.dpr)));
    if (!this.coreGlow) this.coreGlow = coreGlowSprite();
  }

  private frame(still = false) {
    const { ctx, w, h, dpr } = this;
    if (w === 0 || h === 0) return;
    this.ensureSprites();
    const time = still ? 0 : (performance.now() - this.t0) / 1000;
    const dt = still ? 0 : Math.min(0.05, time - this.lastT);
    this.lastT = time;
    this.sp += (this.progress - this.sp) * (still ? 1 : 0.085);
    this.mx += (this.tmx - this.mx) * (still ? 1 : 0.05);
    this.my += (this.tmy - this.my) * (still ? 1 : 0.05);
    const bandX = this.bandX;
    const ax = bandX ? (bandX[0] + bandX[1]) / 2 / w : this.anchorX;
    this.sax += (ax - this.sax) * (still ? 1 : 0.06);
    this.say += (this.anchorY - this.say) * (still ? 1 : 0.06);
    this.sdim += (this.dim - this.sdim) * (still ? 1 : 0.06);
    if (this.sax0 < 0) this.sax0 = ax;

    const p = clamp01(this.sp);
    // beside the copy → into the centre over [0, .5], settle above the closing caption over [.5, 1]
    const m1 = ease(clamp01(p / 0.5));
    const m2 = ease(clamp01((p - 0.5) / 0.5));
    // "burst": peaks mid-transition — the camera surges forward, stars streak, the sway speeds up
    const burst = Math.sin(Math.PI * m1) * (1 - m2) + Math.sin(Math.PI * m2);
    const dark = this.dark;
    const styles = dark ? STYLES_DARK : STYLES_LIGHT;
    const portrait = this.portrait;

    // ---- morph schedule: hold → flow → hold … (stays on a hold if the next shape isn't built yet)
    let cur = this.cur;
    let T = 0;
    if (this.qa) {
      cur = this.cur = ((this.qa.shape % SHAPES) + SHAPES) % SHAPES;
      this.ensureShape(SHAPES - 1);
      T = clamp01(this.qa.t);
    } else if (!still) {
      this.clock += dt;
      if (this.clock > HOLD) {
        if (!this.shapes[(cur + 1) % SHAPES]) this.clock = HOLD;
        else if (this.clock >= HOLD + MORPH) {
          this.clock -= HOLD + MORPH;
          cur = this.cur = (cur + 1) % SHAPES;
          this.canvas.dataset.shape = String(cur);
        } else T = (this.clock - HOLD) / MORPH;
      }
    }
    // scroll story: A shapes ⇄ (m1) B data cloud ⇄ (m2) C brand star. Past B the solid end is the star.
    // the scatter is done by p .3 (before the B caption is fully in), the star forms over p .5 → .75 (before C's)
    const toStar = p > 0.5;
    const cloudT = toStar ? clamp01((p - 0.5) / 0.25) : clamp01(p / 0.3);
    if (toStar) T = 0;
    const A = toStar ? (this.shapes[0] as ShapeData) : (this.shapes[cur] as ShapeData);
    const B = T > 0 ? (this.shapes[(cur + 1) % SHAPES] as ShapeData) : A;
    const eG = smooth(T);
    const sG = Math.sin(Math.PI * T); // 0 → 1 → 0 over the flow
    // alternate the swirl direction per transition
    const swirl = (cur & 1 ? -1 : 1) * 1.15;

    // ---- camera: a slow sway (±35°, never edge-on) + slight nod and roll, pointer parallax on top
    this.swayT += dt * (1 + 1.4 * burst);
    const st = this.swayT;
    const yaw = (still ? 0 : 0.6 * Math.sin(st * 0.42)) + this.mx * 0.28;
    const pitch = (still ? 0 : 0.09 * Math.sin(st * 0.31 + 1)) + this.my * 0.14;
    const roll = still ? 0 : 0.045 * Math.sin(st * 0.23 + 2);
    const camD = lerp(lerp(5.2, 4.7, m1), 4.6, m2);

    const minDim = Math.min(w, h);
    // phones: the hologram is the only visual above the headline, so it may take more of the width
    const baseScale = minDim * lerp(lerp(0.3, 0.36, m1), 0.35, m2) * (portrait ? 1.15 : 1) * this.zoom * (1 + 0.06 * burst);
    // the flow arcs towards the viewer: allow for it so the swirl never touches the copy
    const pad = 1 + 0.09 * sG;
    const ex = lerp(A.ex, B.ex, eG) * pad;
    const ey = lerp(A.ey, B.ey, eG) * pad;
    const ox = w * this.sax;
    let oy: number;
    if (this.band) {
      // smooth the band edges so stage changes glide instead of jumping
      const k = still ? 1 : 0.08;
      if (this.sBot === 0) { this.sTop = this.band[0]; this.sBot = this.band[1]; }
      this.sTop += (this.band[0] - this.sTop) * k;
      this.sBot += (this.band[1] - this.sBot) * k;
      oy = (this.sTop + this.sBot) / 2;
      const half = Math.max(40, (this.sBot - this.sTop) / 2);
      let want = Math.min(1, half / (ey * baseScale));
      if (bandX) want = Math.min(want, Math.max(40, (bandX[1] - bandX[0]) / 2) / (ex * baseScale));
      // wide shapes (laptop, chart) on narrow screens: keep a side gutter
      else want = Math.min(want, Math.max(40, Math.min(ox, w - ox) - (portrait ? 22 : 40)) / (ex * baseScale));
      this.fit += (want - this.fit) * (still ? 1 : 0.12);
    } else {
      this.fit = 1;
      oy = h * this.say; // free placement (reduced motion: no captions, no band)
    }
    // gentle floating bob (zero-g)
    if (!still) oy += Math.sin(time * 0.7) * minDim * 0.006;
    const scale = baseScale * this.fit;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

    // =================== background: starfield ===================
    // stars zoom out from the hologram (the vanishing point) as we fly in; mouse + scroll parallax
    const stars = this.scene.stars;
    const hw = w * 0.5, hh = h * 0.5;
    const pan = (this.sax - this.sax0) * w; // the camera panning to centre the hologram
    const starAlpha = (dark ? 0.95 : 0.5) * (0.55 + 0.45 * this.sdim);
    const streak = burst * (still ? 0 : 1);
    if (streak > 0.04) {
      ctx.beginPath();
    }
    for (let i = 0; i < stars.n; i++) {
      const d = stars.d[i];
      const par = 0.25 + d;
      let bx = hw + stars.x[i] * hw - this.mx * 14 * par + pan * 0.08 * par;
      let by = hh + stars.y[i] * hh - this.my * 9 * par - p * h * 0.07 * par;
      const zoom = 1 + (0.16 * m1 + 0.12 * m2) * (0.35 + d);
      bx = ox + (bx - ox) * zoom;
      by = oy + (by - oy) * zoom;
      if (bx < -4 || bx > w + 4 || by < -4 || by > h + 4) continue;
      const tw = still ? 0.8 : 0.55 + 0.45 * fsin(time * stars.speed[i] + stars.phase[i]);
      const a = clamp01((0.18 + 0.82 * d) * tw * starAlpha);
      const s = (0.7 + d * 1.5) * (portrait ? 0.85 : 1);
      ctx.fillStyle = styles[stars.hue[i]][(a * 20 + 0.5) | 0];
      ctx.fillRect(bx - s / 2, by - s / 2, s, s);
      if (streak > 0.04) {
        const l = streak * 0.09 * (0.3 + d);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + (bx - ox) * l, by + (by - oy) * l);
      }
    }
    if (streak > 0.04) {
      ctx.strokeStyle = dark ? 'rgb(200,235,255)' : 'rgb(24,40,84)';
      ctx.globalAlpha = (dark ? 0.32 : 0.16) * streak;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // =================== background: planets (pre-baked sprites) ===================
    // far away: they barely zoom; they mostly drift with the pan and rise with the scroll
    const pz = 1 + 0.07 * m1 + 0.05 * m2;
    const pAlpha = (dark ? 0.95 : 0.85) * (1 - 0.3 * m2) * (0.5 + 0.5 * this.sdim);
    const planets = portrait ? PLANETS_PORTRAIT : PLANETS_LANDSCAPE;
    for (let k = 0; k < planets.length; k++) {
      const [which, fx, fy, par, pa] = planets[k];
      const img = which === 0 ? this.spriteA : this.spriteB;
      if (!img) continue;
      let cx = fx * w - this.mx * 24 * par + pan * 0.18 * par;
      let cy = fy * h - this.my * 14 * par - p * h * 0.4 * par;
      cx = ox + (cx - ox) * pz;
      cy = oy + (cy - oy) * pz;
      const size = (img.width / (dpr * 1.5)) * (1 + 0.08 * m1 + 0.05 * m2);
      if (cx + size < 0 || cx - size > w || cy + size < 0 || cy - size > h) continue;
      ctx.globalAlpha = pAlpha * pa;
      ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

    // =================== hologram ===================
    // how solid the scene is: 1 = a shape, 0 = the scattered data cloud (scroll stage B)
    const solid = toStar ? cloudT : 1 - cloudT;
    // soft glow behind the shape (pre-baked sprite, own box only); pulses a little while the particles flow
    ctx.globalCompositeOperation = 'source-over';
    const glowR = scale * Math.max(ex, ey) * 1.5;
    const gA = (dark ? 0.2 : 0.13) * this.sdim * (1 + 0.5 * m2 + 0.35 * sG) * solid * solid;
    if (this.coreGlow && gA > 0.004) {
      ctx.globalAlpha = clamp01(gA);
      ctx.drawImage(this.coreGlow, ox - glowR, oy - glowR, glowR * 2, glowR * 2);
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

    // view matrix V = Rz(roll) · Rx(pitch) · Ry(yaw)
    const V = this.view;
    mul(V, setRotZ(this.tA, roll), setRotX(this.tB, pitch));
    mul(V, V, setRotY(this.tA, yaw));
    const v0 = V[0], v1 = V[1], v2 = V[2], v3 = V[3], v4 = V[4], v5 = V[5], v6 = V[6], v7 = V[7], v8 = V[8];

    const step = this.step;
    // light theme: dark ink on a pale sky needs more weight
    const dimAll = (dark ? 1.15 : 1.35) * this.sdim * (1 + 0.12 * (step - 1));
    const sizeK = this.sizeMul * (dark ? 1 : 1.35) * (1 + 0.22 * (step - 1)) * (1 + 0.15 * burst);
    // hologram scan: a bright band sweeping down the shape every ~6.8 s
    const scanY = still ? 9 : 1.35 - ((time * 0.5) % 3.4);
    const scanAmt = dark ? 0.85 : 0.5;
    const n = this.scene.n;
    const del = this.del, sw = this.sw, zj = this.zj;
    const axs = A.x, ays = A.y, azs = A.z, aba = A.ba, asz = A.size, ahu = A.hue;
    const bxs = B.x, bys = B.y, bzs = B.z, bba = B.ba, bsz = B.size, bhu = B.hue;
    const invSpan = 1 / (1 - STAGGER);
    const flowing = T > 0;
    // data cloud: spread over the whole frame, drifting slowly; nearer motes are bigger, brighter and float more
    const cxs = this.cx, cys = this.cy, cds = this.cd, cph = this.cph, csp = this.csp, chu = this.chue, cdel = this.cdel;
    const invC = 1 / (1 - CLOUD_STAGGER);
    const anyCloud = solid < 0.9995;
    const chw = w * 0.53, chh = h * 0.53;
    const cSizeK = this.sizeMul * (dark ? 1 : 1.25) * (portrait ? 0.85 : 1) * (1 + 0.22 * (step - 1));
    const cDim = (dark ? 0.95 : 0.85) * (0.55 + 0.45 * this.sdim);
    const q = this.quiet;
    const qx0 = q ? q[0] : 0, qy0 = q ? q[1] : 0, qx1 = q ? q[2] : 0, qy1 = q ? q[3] : 0;
    const ctime = still ? 0 : time;
    for (let i = 0; i < n; i++) {
      // reduced quality: keep pairs (i>>1) — indices are in angular order, so the thinning stays even
      if (step > 1 && (i >> 1) % step !== 0) continue;
      // k = how far particle i is into the cloud (staggered); 0 = on the shape, 1 = in the cloud
      let k = 0;
      if (anyCloud) {
        const kt = (cloudT - cdel[i]) * invC;
        k = kt <= 0 ? 0 : kt >= 1 ? 1 : smooth(kt);
        if (toStar) k = 1 - k;
      }
      let px = 0, py = 0, a = 0, sz = 0, hue = 0;
      if (k < 1) {
        let x: number, y: number, z: number, size: number;
        const t = flowing ? (T - del[i]) * invSpan : 0;
        if (t <= 0) {
          x = axs[i]; y = ays[i]; z = azs[i]; a = aba[i]; size = asz[i]; hue = ahu[i];
        } else if (t >= 1) {
          x = bxs[i]; y = bys[i]; z = bzs[i]; a = bba[i]; size = bsz[i]; hue = bhu[i];
        } else {
          const e = smooth(t);
          x = axs[i] + (bxs[i] - axs[i]) * e;
          y = ays[i] + (bys[i] - ays[i]) * e;
          z = azs[i] + (bzs[i] - azs[i]) * e;
          // mid-flight: swirl about the vertical axis and arc towards the viewer (a curved path, not a straight line)
          const s = fsin(t * Math.PI);
          const phi = swirl * sw[i] * s;
          const c = fsin(phi + HALF_PI), sn = fsin(phi);
          const xr = x * c + z * sn;
          z = z * c - x * sn - 0.32 * zj[i] * s;
          x = xr;
          a = (aba[i] + (bba[i] - aba[i]) * e) * (1 + 0.3 * s);
          size = asz[i] + (bsz[i] - asz[i]) * e;
          hue = e < 0.5 ? ahu[i] : bhu[i];
        }
        const ds = y - scanY;
        if (ds > -0.14 && ds < 0.14) a *= 1 + scanAmt * (1 - (ds < 0 ? -ds : ds) * 7.1);
        const x1 = v0 * x + v1 * y + v2 * z;
        const y1 = v3 * x + v4 * y + v5 * z;
        const z1 = v6 * x + v7 * y + v8 * z;
        const zc = camD + z1;
        if (zc < 0.4 && k === 0) continue;
        const persp = camD / (zc < 0.4 ? 0.4 : zc);
        px = ox + x1 * scale * persp;
        py = oy - y1 * scale * persp;
        if (k === 0 && (px < -10 || px > w + 10 || py < -10 || py > h + 10)) continue;
        const depth = clamp01((z1 + 1.2) / 2.4); // 0 near → 1 far
        a *= (1 - 0.45 * depth) * dimAll;
        sz = size * persp * sizeK;
      }
      if (k > 0) {
        const d = cds[i];
        const ph = ctime * csp[i] + cph[i];
        const qx = w * 0.5 + cxs[i] * chw + fsin(ph) * (5 + 22 * d) - this.mx * (4 + 34 * d);
        const qy = h * 0.5 + cys[i] * chh + fsin(ph * 0.83 + 1.7) * (4 + 16 * d) - this.my * (3 + 22 * d);
        let qa = (0.3 + 0.7 * d) * cDim;
        if (q) {
          // thin the cloud over the caption so the text stays legible
          const dx = qx < qx0 ? qx0 - qx : qx > qx1 ? qx - qx1 : 0;
          const dy = qy < qy0 ? qy0 - qy : qy > qy1 ? qy - qy1 : 0;
          const dd = dx > dy ? dx : dy;
          if (dd < 48) qa *= 0.1 + 0.9 * (dd / 48);
        }
        const qs = (1 + 2.6 * d * d) * cSizeK;
        if (k >= 1) {
          px = qx; py = qy; a = qa; sz = qs; hue = chu[i];
        } else {
          // curved path: a sideways bow that peaks mid-way (the scatter swirls out, the gather swirls in)
          const dx = qx - px, dy = qy - py;
          const bow = 0.2 * k * (1 - k) * (toStar ? -1 : 1);
          px += dx * k - dy * bow;
          py += dy * k + dx * bow;
          a += (qa - a) * k;
          sz += (qs - sz) * k;
          if (k > 0.5) hue = chu[i];
        }
        if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;
      }
      if (a > 1) a = 1;
      ctx.fillStyle = styles[hue][(a * 20 + 0.5) | 0];
      // every 4th mote stretches into a short dash in the cloud: reads as bits of data, not stars
      const sw2 = (i & 3) === 0 && k > 0 ? sz * (1 + 1.8 * k) : sz;
      ctx.fillRect(px - sw2 / 2, py - sz / 2, sw2, sz);
    }

    // accent glows (star tips, arrow head, lens…): fade out with the old shape, in with the new one
    const lr = Math.max(4, scale * 0.06) * (portrait ? 0.8 : 1);
    for (let s = 0; s < 2 && solid > 0.02; s++) {
      if (s === 1 && !flowing) break;
      const S = s === 0 ? A : B;
      const wgt = (flowing ? (s === 0 ? 1 - eG : eG) : 1) * solid;
      for (const L of S.lights) {
        const x1 = v0 * L.x + v1 * L.y + v2 * L.z;
        const y1 = v3 * L.x + v4 * L.y + v5 * L.z;
        const z1 = v6 * L.x + v7 * L.y + v8 * L.z;
        const zc = camD + z1;
        if (zc < 0.4) continue;
        const persp = camD / zc;
        const a = wgt * wgt * (still ? 0.9 : 0.75 + 0.25 * Math.sin(time * 1.3 + L.x * 3)) * this.sdim * (dark ? 1 : 0.9);
        const r = lr * L.r * persp;
        ctx.globalAlpha = clamp01(a);
        ctx.drawImage(this.glows[L.hue], ox + x1 * scale * persp - r, oy - y1 * scale * persp - r, r * 2, r * 2);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
