// Lightweight 3D particle engine (Canvas 2D, no WebGL/three.js dependency).
// Hero story "Fazodagi stansiya", driven by a 0..1 "progress" value:
//   0.00 → far away: a ringed space station drifts in deep space, seen at a steep angle
//   0.50 → approach: the camera flies in, data packets race round the station, pulses run along the rings
//   1.00 → arrival: the station turns to face us — the DATA 4-point star glows in its hub
// Background: twinkling starfield and two particle planets (baked into sprites) with mouse/scroll parallax.
// Shapes live in stationScene.ts; this file only animates and draws them.

import {
  buildScene, GROUPS, G_CORE, G_HUB, G_RING, G_INNER, G_ORBIT_A, G_ORBIT_B,
  TAU,
  type SceneData, type PlanetData,
} from './stationScene';

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
// light theme: deep ink (#0052d9 / #0891b2 / #00995c) so the station keeps its shape on a pale sky
const RGB_LIGHT = ['0,82,217', '8,145,178', '0,153,92', '24,40,84'];
const STYLES_DARK = buildStyles(RGB_DARK);
const STYLES_LIGHT = buildStyles(RGB_LIGHT);

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// sine lookup (ring pulses + twinkle run per particle per frame)
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

/** The station's soft core glow, baked once: blue centre → faint cyan → transparent (drawn with globalAlpha). */
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

/** 99th percentile of a |offset| histogram (32 bins per unit) — a few stray particles may bleed past the band. */
function pct99(hist: Uint16Array, counted: number) {
  const target = counted * 0.99;
  let acc = 0;
  let b = 0;
  for (; b < hist.length; b++) {
    acc += hist[b];
    if (acc >= target) break;
  }
  return Math.max(0.5, (b + 1) / 32);
}

// adaptive quality: this many consecutive slow frames step the quality down one notch.
// A frame is slow when the interval is > SLOW_MS AND our own draw cost is heavy (> BUSY_MS), or the interval is
// beyond HARD_MS. A steady ~33ms interval with a cheap draw is a 30Hz display / Low Power mode cap, not slowness.
const SLOW_MS = 24;
const BUSY_MS = 12;
const HARD_MS = 40;
const SLOW_RUN = 20;

export class ParticleField {
  private ctx: CanvasRenderingContext2D;
  private scene: SceneData;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private maxDpr: number;
  private raf = 0;
  // adaptive quality: draw every `step`-th station particle (1, 2, 3), each a touch larger to keep the density
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
  /** horizontal anchor of the station (0..1 of width) */
  anchorX = 0.5;
  private sax = 0.5;
  private sax0 = -1; // anchor at first frame: background parallax is measured from here
  /** vertical anchor (0..1 of height); phones park the station above the headline */
  anchorY = 0.5;
  /** particle size multiplier (phones use finer dust) */
  sizeMul = 1;
  /** station size multiplier for band-less (static) layouts */
  zoom = 1;
  private say = 0.5;
  private spinAcc = 0;
  private lastT = 0;
  /** overall brightness (0..1), e.g. lowered behind text on small screens */
  dim = 1;
  private sdim = 1;
  /**
   * Vertical band [top, bottom] in canvas px that the station must stay inside (below the navbar,
   * above the caption / headline). When set, the station centres itself in the band and shrinks to fit,
   * measured from the particles' own projected extent. null = free placement (anchorY, no fit).
   * The starfield and planets always fill the whole canvas.
   */
  band: [number, number] | null = null;
  /**
   * Optional horizontal band [left, right] in canvas px: the station centres between them and shrinks so its
   * hull never crosses `left` (desktop first screen: keeps a clear gap to the headline). Overrides anchorX.
   */
  bandX: [number, number] | null = null;
  private sTop = 0;
  private sBot = 0;
  private fit = 1;
  private extent = 1.1; // projected half-height of the station in "scale" units (measured)
  private extentX = 1.1;
  private hist = new Uint16Array(96);
  private histX = new Uint16Array(96);
  // per-frame group matrices + scratch
  private gm: M3[] = Array.from({ length: GROUPS }, m3);
  private ga = new Float32Array(GROUPS);
  private tA = m3();
  private tB = m3();
  private view = m3();
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
    this.dark = opts.dark;
    this.maxDpr = opts.maxDpr ?? 2;
    this.resize();
  }

  /** Current render quality, for QA: "dpr|step|particles" (also mirrored to canvas[data-q]). */
  get quality() {
    return `${this.dpr}|${this.step}|${this.scene.station.n}`;
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

  /** Steps quality down after a run of slow frames: first DPR → 1, then 1/2 (desktop: 1/3) of the station particles. */
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
    } else if (this.step < (this.scene.station.n > 2500 ? 3 : 2)) {
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
  }

  /** Render a single frame (used for reduced-motion static rendering). */
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
    // far → approach over [0, .5], approach → arrival over [.5, 1]
    const m1 = ease(clamp01(p / 0.5));
    const m2 = ease(clamp01((p - 0.5) / 0.5));
    // "burst": peaks mid-transition — the camera surges forward, stars streak, the station spins up
    const burst = Math.sin(Math.PI * m1) * (1 - m2) + Math.sin(Math.PI * m2);
    this.spinAcc += dt * (0.16 + 0.9 * burst);
    const spin = still ? 0 : this.spinAcc;
    const dark = this.dark;
    const styles = dark ? STYLES_DARK : STYLES_LIGHT;
    const portrait = this.portrait;

    // ---- camera keyframes
    const sway = still ? 0 : Math.sin(time * 0.23);
    // first screen: the rings read as a ~1:0.6 ellipse (a station, not a dust cloud) and the hub star is legible
    const pitch = lerp(lerp(0.62, 0.5, m1), 0.1, m2) + this.my * 0.18 + (still ? 0 : Math.sin(time * 0.31) * 0.04);
    const yaw = lerp(lerp(-0.3, -0.22, m1), 0, m2) + sway * 0.22 * (1 - 0.6 * m2) + this.mx * 0.35;
    const roll = lerp(lerp(-0.12, -0.08, m1), 0, m2);
    const camD = lerp(lerp(6.5, 3.5, m1), 3.1, m2);
    const coreScale = lerp(lerp(1, 1.05, m1), 1.22, m2);
    const pulseAmt = clamp01(0.25 + 0.75 * m1 - 0.7 * m2);

    const minDim = Math.min(w, h);
    // phones: the station is the only visual above the headline, so it may take more of the width
    const baseScale = minDim * lerp(lerp(0.22, 0.35, m1), 0.335, m2) * (portrait ? 1.18 : 1) * this.zoom * (1 + 0.1 * burst);
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
      let want = Math.min(1, half / (this.extent * baseScale));
      if (bandX) want = Math.min(want, Math.max(40, (bandX[1] - bandX[0]) / 2) / (this.extentX * baseScale));
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
    // stars zoom out from the station (the vanishing point) as we fly in; mouse + scroll parallax
    const st = this.scene.stars;
    const hw = w * 0.5, hh = h * 0.5;
    const pan = (this.sax - this.sax0) * w; // the camera panning to centre the station
    const starAlpha = (dark ? 0.95 : 0.5) * (0.55 + 0.45 * this.sdim);
    const streak = burst * (still ? 0 : 1);
    if (streak > 0.04) {
      ctx.beginPath();
    }
    for (let i = 0; i < st.n; i++) {
      const d = st.d[i];
      const par = 0.25 + d;
      let bx = hw + st.x[i] * hw - this.mx * 14 * par + pan * 0.08 * par;
      let by = hh + st.y[i] * hh - this.my * 9 * par - p * h * 0.07 * par;
      const zoom = 1 + (0.16 * m1 + 0.12 * m2) * (0.35 + d);
      bx = ox + (bx - ox) * zoom;
      by = oy + (by - oy) * zoom;
      if (bx < -4 || bx > w + 4 || by < -4 || by > h + 4) continue;
      const tw = still ? 0.8 : 0.55 + 0.45 * fsin(time * st.speed[i] + st.phase[i]);
      const a = clamp01((0.18 + 0.82 * d) * tw * starAlpha);
      const s = (0.7 + d * 1.5) * (portrait ? 0.85 : 1);
      ctx.fillStyle = styles[st.hue[i]][(a * 20 + 0.5) | 0];
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

    // =================== station ===================
    // soft core glow behind the station (brightens as the star module lights up)
    ctx.globalCompositeOperation = 'source-over';
    // pre-baked sprite drawn over its own box only (was: a new gradient + a full-screen fill every frame)
    const glowR = scale * (1.55 + 0.1 * m2);
    const gA = (dark ? 0.22 : 0.16) * this.sdim * (1 + 0.35 * m1 + 0.5 * m2 + 0.6 * burst);
    if (this.coreGlow) {
      ctx.globalAlpha = clamp01(gA);
      ctx.drawImage(this.coreGlow, ox - glowR, oy - glowR, glowR * 2, glowR * 2);
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';

    // view matrix V = Rz(roll) · Rx(pitch) · Ry(yaw); group matrices = V · local motion
    const V = this.view, A = this.tA, B = this.tB, gm = this.gm, ga = this.ga;
    mul(V, setRotZ(A, roll), setRotX(B, pitch));
    mul(V, V, setRotY(A, yaw));
    // core: counter-rotated against the camera (V⁻¹ = Ry(-yaw)·Rx(-pitch)·Rz(-roll)), so the brand star faces us
    // from the very first frame while the rings stay tilted; a small 3D sway still shows the lens depth
    const C = gm[G_CORE];
    mul(B, setRotY(A, -yaw), setRotX(B, -pitch));
    mul(B, B, setRotZ(A, -roll));
    mul(C, V, B);
    mul(B, setRotY(A, still ? 0 : Math.sin(time * 0.5) * 0.22 * (1 - 0.65 * m2)), setRotX(B, still ? 0 : Math.sin(time * 0.37) * 0.08));
    mul(C, C, B);
    for (let k = 0; k < 9; k++) C[k] *= coreScale;
    gm[G_HUB].set(V);
    mul(gm[G_RING], V, setRotZ(A, spin));
    mul(gm[G_INNER], V, setRotZ(A, -spin * 1.5));
    mul(B, setRotX(A, 1.12), setRotY(B, 0.32));
    mul(gm[G_ORBIT_A], V, mul(B, B, setRotZ(A, still ? 0.6 : time * 0.55)));
    mul(B, setRotY(A, 1.18), setRotX(B, 0.42));
    mul(gm[G_ORBIT_B], V, mul(B, B, setRotZ(A, still ? 2.2 : 1 - time * 0.42)));
    ga[G_CORE] = 0.78 + 0.22 * m2;
    ga[G_HUB] = 0.85 * (1 - 0.75 * m2);
    ga[G_RING] = 1;
    ga[G_INNER] = 1;
    // light theme: the orbiting packets are halved so they don't read as noise around the hull
    ga[G_ORBIT_A] = ga[G_ORBIT_B] = (0.35 + 0.65 * m1) * (1 - 0.4 * m2) * (dark ? 1 : 0.5);

    const S = this.scene.station;
    const hist = this.hist, histX = this.histX;
    hist.fill(0);
    if (bandX) histX.fill(0);
    let counted = 0;
    // light theme: dark ink on a pale sky needs more weight; far away is only a touch hazier
    const step = this.step;
    const dimAll = (dark ? 1.15 : 1.35) * this.sdim * (0.94 + 0.06 * m1) * (1 + 0.12 * (step - 1));
    const sizeK = this.sizeMul * (dark ? 1 : 1.35) * (1 + 0.35 * burst) * (1 + 0.22 * (step - 1));
    const pulseT = still ? 0 : time * 2.6;
    for (let i = 0; i < S.n; i++) {
      // reduced quality: keep pairs (i>>1), so alternating sets (e.g. the two data orbits) both stay visible
      if (step > 1 && (i >> 1) % step !== 0) continue;
      const g = S.grp[i];
      const M = gm[g];
      const x = S.x[i], y = S.y[i], z = S.z[i];
      const x1 = M[0] * x + M[1] * y + M[2] * z;
      const y1 = M[3] * x + M[4] * y + M[5] * z;
      const z1 = M[6] * x + M[7] * y + M[8] * z;
      const zc = camD + z1;
      if (zc < 0.4) continue;
      const persp = camD / zc;
      const px = ox + x1 * scale * persp;
      const py = oy - y1 * scale * persp;
      // fit measures the hull only — faint orbiting packets may cross the band edge
      if (g < G_ORBIT_A) {
        const bin = (Math.abs(y1 * persp) * 32) | 0;
        if (bin < 96) { hist[bin]++; counted++; }
        if (bandX) {
          const bxn = (Math.abs(x1 * persp) * 32) | 0;
          if (bxn < 96) histX[bxn]++;
        }
      }
      if (px < -10 || px > w + 10 || py < -10 || py > h + 10) continue;

      const depth = clamp01((z1 + 1.3) / 2.6); // 0 near → 1 far
      let a = S.ba[i] * ga[g] * (1 - 0.5 * depth) * dimAll;
      const an = S.ang[i];
      if (an === an && pulseAmt > 0.01) {
        // data pulses travelling along the rings
        const wv = 0.5 + 0.5 * fsin(an * 5 - pulseT);
        a *= 1 - 0.45 * pulseAmt + pulseAmt * 0.9 * wv * wv * wv;
      }
      if (a > 1) a = 1;
      const size = S.size[i] * persp * sizeK;
      ctx.fillStyle = styles[S.hue[i]][(a * 20 + 0.5) | 0];
      ctx.fillRect(px - size / 2, py - size / 2, size, size);
    }

    // running lights (blinking) and star-tip beacons
    for (const L of S.lights) {
      const M = gm[L.g];
      const x1 = M[0] * L.x + M[1] * L.y + M[2] * L.z;
      const y1 = M[3] * L.x + M[4] * L.y + M[5] * L.z;
      const z1 = M[6] * L.x + M[7] * L.y + M[8] * L.z;
      const zc = camD + z1;
      if (zc < 0.4) continue;
      const persp = camD / zc;
      const depth = clamp01((z1 + 1.3) / 2.6);
      let a: number;
      if (L.blink) {
        const b = still ? 0.5 : 0.5 + 0.5 * Math.sin(time * 1.9 + L.phase);
        a = (0.25 + 0.75 * b * b * b * b) * (1 - 0.55 * depth);
      } else {
        a = (0.35 + 0.65 * m2) * (still ? 1 : 0.8 + 0.2 * Math.sin(time * 1.3 + L.phase));
      }
      a *= this.sdim * (dark ? 1 : 0.95);
      const r = (L.blink ? 9 : 12 + 8 * m2) * persp * (portrait ? 0.75 : 1) * this.fit;
      ctx.globalAlpha = clamp01(a);
      ctx.drawImage(this.glows[L.hue], ox + x1 * scale * persp - r, oy - y1 * scale * persp - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // measured extent = 99th percentile of |offset| (a few stray particles may bleed past the band)
    if (this.band && counted > 0) {
      const k = still ? 1 : 0.1;
      this.extent += (pct99(hist, counted) - this.extent) * k;
      if (bandX) this.extentX += (pct99(histX, counted) - this.extentX) * k;
    }
  }
}
