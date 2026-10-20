/**
 * Site colour shift: a straight port of the OBS stream kit's theme engine
 * (mdm-stream-kit/assets/js/mdm.js, the SHIFT-CORE block). Same four themes,
 * same 3-6 min random holds, same 30 s fade, same fixed Etc/GMT+8 clock and
 * daily seed, so the site lands on the same theme as the stream at the same
 * moment. Keep the schedule maths identical to the kit; `scripts/stream-theme
 * -parity.test.mjs` checks that both compute the same answer.
 */

export type ThemeName = "teal" | "red" | "purple" | "green";
export const THEME_NAMES: ThemeName[] = ["teal", "red", "purple", "green"];

/** accent filter per theme: hue-rotate deg, saturate (kit SHIFT_ACCENT) */
export const SHIFT_ACCENT: Record<ThemeName, [number, number]> = {
  teal: [0, 1],
  red: [198, 1.7],
  purple: [95, 1.5],
  green: [225, 1.6],
};

export const SHIFT_TZ = "Etc/GMT+8";
export const SHIFT_OFF = 0;
export const SHIFT_RULES = { minMinutes: 3, maxMinutes: 6, fadeSeconds: 30 };

type RGB = [number, number, number];
const hexRGB = (h: string): RGB =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;

const NIGHT = ["#050716", "#0c2350", "#0b7486", "#00ffb5", "#b9f3ff"].map(hexRGB);
const RIND = ["#03140d", "#0b4f27", "#27a83f", "#00ffb5", "#e4ffe9"].map(hexRGB); // Starting Soon swirl
const ACID = ["#0a1204", "#2c7a10", "#b9e021", "#ff9a1f", "#fff1a8"].map(hexRGB);

/** CSS hue-rotate(deg) then saturate(s) on an [r,g,b] 0-255 colour (kit `filt`) */
export function filt(c: RGB, deg: number, s: number): RGB {
  const a = (deg * Math.PI) / 180,
    co = Math.cos(a),
    si = Math.sin(a);
  const m = [
    0.213 + co * 0.787 - si * 0.213, 0.715 - co * 0.715 - si * 0.715, 0.072 - co * 0.072 + si * 0.928,
    0.213 - co * 0.213 + si * 0.143, 0.715 + co * 0.285 + si * 0.14, 0.072 - co * 0.072 - si * 0.283,
    0.213 - co * 0.213 - si * 0.787, 0.715 - co * 0.715 + si * 0.715, 0.072 + co * 0.928 + si * 0.072,
  ];
  const cl = (v: number) => Math.max(0, Math.min(255, v));
  const h = [0, 3, 6].map((k) => cl(m[k] * c[0] + m[k + 1] * c[1] + m[k + 2] * c[2]));
  const S = [
    0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
    0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
  ];
  return [0, 3, 6].map((k) => cl(S[k] * h[0] + S[k + 1] * h[1] + S[k + 2] * h[2])) as RGB;
}

export type Theme = { pal: RGB[]; bgHue: number; bgSat: number; hue: number; sat: number; rgb: RGB };
const base: Record<ThemeName, Omit<Theme, "hue" | "sat" | "rgb">> = {
  teal: { pal: RIND, bgHue: 0, bgSat: 1 },
  red: { pal: NIGHT, bgHue: 198, bgSat: 1.7 },
  purple: { pal: NIGHT, bgHue: 95, bgSat: 1.5 },
  green: { pal: ACID, bgHue: 0, bgSat: 1 },
};
export const THEMES = Object.fromEntries(
  THEME_NAMES.map((n) => {
    const [hue, sat] = SHIFT_ACCENT[n];
    const rgb = filt([0, 255, 181], hue, sat).map(Math.round) as RGB;
    return [n, { ...base[n], hue, sat, rgb }];
  }),
) as Record<ThemeName, Theme>;

/* ---- schedule: ported line for line from the kit's SHIFT-CORE ---- */
let shiftFmt: Intl.DateTimeFormat | null = null;
function shiftDay(now: Date | number) {
  const ms = +now + SHIFT_OFF * 60000;
  let wall: number;
  try {
    if (!shiftFmt)
      shiftFmt = new Intl.DateTimeFormat("en-US", {
        timeZone: SHIFT_TZ, hourCycle: "h23", year: "numeric", month: "numeric",
        day: "numeric", hour: "numeric", minute: "numeric", second: "numeric",
      });
    const p = shiftFmt.formatToParts(new Date(ms));
    const o: Record<string, number> = {};
    for (const x of p) o[x.type] = +x.value;
    wall = Date.UTC(o.year, o.month - 1, o.day, o.hour % 24, o.minute, o.second) + (((ms % 1000) + 1000) % 1000);
  } catch {
    wall = ms - new Date(ms).getTimezoneOffset() * 60000;
  }
  const day = Math.floor(wall / 864e5),
    md = new Date(day * 864e5);
  return {
    t: (wall - day * 864e5) / 1000,
    seed: (md.getUTCFullYear() * 400 + md.getUTCMonth() * 32 + md.getUTCDate()) >>> 0,
  };
}

export type ShiftState = { from: ThemeName; to: ThemeName; e: number; fading: boolean };

export function shiftLevel(lo: number, hi: number, fade: number, now: Date | number): ShiftState {
  const D = shiftDay(now);
  let t = D.t,
    seed = D.seed,
    cur = 0;
  function rnd() {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let x = seed;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  }
  for (;;) {
    const hold = lo + rnd() * (hi - lo),
      next = (cur + 1 + Math.floor(rnd() * 3)) % 4;
    if (t < hold) return { from: THEME_NAMES[cur], to: THEME_NAMES[cur], e: 0, fading: false };
    t -= hold;
    if (t < fade) {
      const p = t / fade;
      return { from: THEME_NAMES[cur], to: THEME_NAMES[next], e: p * p * (3 - 2 * p), fading: true };
    }
    t -= fade;
    cur = next;
  }
}

export function shiftAccent(from: ThemeName, to: ThemeName, e: number) {
  const A = SHIFT_ACCENT[from],
    B = SHIFT_ACCENT[to],
    dh = ((((B[0] - A[0]) % 360) + 540) % 360) - 180;
  return { hue: A[0] + dh * e, sat: A[1] + (B[1] - A[1]) * e };
}

/** the theme on the stream right now (kit defaults: 3-6 min holds, 30 s fade) */
export function themeAt(now: Date | number = Date.now()): ShiftState {
  const r = SHIFT_RULES;
  return shiftLevel(r.minMinutes * 60, r.maxMinutes * 60, r.fadeSeconds, now);
}

/** CSS custom properties for a blend between two themes */
export function themeVars(from: ThemeName, to: ThemeName, e: number) {
  const A = THEMES[from],
    B = THEMES[to];
  const { hue, sat } = shiftAccent(from, to, e);
  const rgb = A.rgb.map((v, k) => Math.round(v + (B.rgb[k] - v) * e));
  const dbh = ((((B.bgHue - A.bgHue) % 360) + 540) % 360) - 180;
  const wt = (th: ThemeName) => (from === th ? 1 - e : 0) + (to === th ? e : 0);
  const tw = Object.fromEntries(THEME_NAMES.map((th) => [`--tw-${th}`, wt(th).toFixed(3)]));
  return {
    ...tw,
    "--color-primary": `rgb(${rgb.join(" ")})`,
    "--shift-rgb": rgb.join(" "),
    "--shift-hue": `${hue.toFixed(1)}deg`,
    "--shift-sat": sat.toFixed(3),
    "--bg-hue": `${(A.bgHue + dbh * e).toFixed(1)}deg`,
    "--bg-sat": (A.bgSat + (B.bgSat - A.bgSat) * e).toFixed(3),
  };
}

/** blended 5-stop swirl palette, 0-1 floats */
export function swirlPalette(from: ThemeName, to: ThemeName, e: number) {
  const A = THEMES[from].pal,
    B = THEMES[to].pal;
  return A.map((c, i) => c.map((v, k) => (v + (B[i][k] - v) * e) / 255));
}
