"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tyler's TV piece from the stream kit (white boxy CRT, two antennas, purple line):
 * the kit's own tv1-turnon.mp4 then tv1-hold-loop.mp4 (byte copies), drawn with a small
 * WebGL shader so it looks like the kit's "screen" blend on black but with the black made
 * transparent:
 *  - black point lift (6/255) so decoded video black is exactly 0,
 *  - outside the body: "un-blend from black" (alpha = max(r,g,b), colour kept premultiplied),
 *    so the soft halo/bloom fades out exactly as in the original,
 *  - the TV body (kit brb.html plate polygon, pulled in 5 px, 8 px feather) is opaque, so the
 *    screen black and the faces stay solid,
 *  - only the dim halo (not the body or the bright antenna cores) is hue-rotated/saturated by
 *    the synced theme (--shift-hue / --shift-sat, the kit's accent filter; teal = untouched).
 * No WebGL: a transparent still made with the same maths (scripts/tv-still.py).
 */

const BLACK = 6 / 255,
  SHRINK = 5,
  FEATHER = 8,
  VW = 1152,
  VH = 1024;
const POLY: [number, number][] = [
  [10, 26.5],
  [78.6, 23],
  [90.3, 27.5],
  [90.6, 81.4],
  [78, 91.3],
  [10.5, 84.5],
];

/** inward edge lines (nx, ny, c) in video pixels: d = nx*x + ny*y + c, > 0 inside */
function edges() {
  const pts = POLY.map(([x, y]) => [(x * VW) / 100, (y * VH) / 100]);
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length,
    cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const out: number[] = [];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length];
    let nx = y0 - y1,
      ny = x1 - x0;
    const n = Math.hypot(nx, ny);
    nx /= n;
    ny /= n;
    let c = -(nx * x0 + ny * y0);
    if (nx * cx + ny * cy + c < 0) {
      nx = -nx;
      ny = -ny;
      c = -c;
    }
    out.push(nx, ny, c);
  });
  return new Float32Array(out);
}

/** CSS filter: hue-rotate(h) saturate(s) as a 3x3 matrix, column-major for GLSL */
function accentMatrix(hueDeg: number, sat: number) {
  const r = (hueDeg * Math.PI) / 180,
    c = Math.cos(r),
    s = Math.sin(r);
  const H = [
    [0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928],
    [0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283],
    [0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072],
  ];
  const S = [
    [0.213 + 0.787 * sat, 0.715 - 0.715 * sat, 0.072 - 0.072 * sat],
    [0.213 - 0.213 * sat, 0.715 + 0.285 * sat, 0.072 - 0.072 * sat],
    [0.213 - 0.213 * sat, 0.715 - 0.715 * sat, 0.072 + 0.928 * sat],
  ];
  const M = S.map((row) => [0, 1, 2].map((j) => row.reduce((a, v, k) => a + v * H[k][j], 0)));
  return new Float32Array([0, 1, 2].flatMap((col) => [M[0][col], M[1][col], M[2][col]]));
}

function readAccent() {
  const cs = getComputedStyle(document.documentElement);
  const hue = parseFloat(cs.getPropertyValue("--shift-hue")) || 0;
  const sat = parseFloat(cs.getPropertyValue("--shift-sat"));
  return [hue, Number.isFinite(sat) ? sat : 1] as const;
}

const VERT = `attribute vec2 p; varying vec2 uv;
void main(){ uv = vec2((p.x+1.)*.5, (1.-p.y)*.5); gl_Position = vec4(p,0.,1.); }`;
const FRAG = `precision highp float; varying vec2 uv; uniform sampler2D t;
uniform vec3 E[6]; uniform mat3 A; uniform vec2 R;
void main(){
  vec2 px = uv * R;
  float d = 1e9;
  for (int i = 0; i < 6; i++) d = min(d, dot(E[i].xy, px) + E[i].z);
  float body = smoothstep(${SHRINK.toFixed(1)}, ${(SHRINK + FEATHER).toFixed(1)}, d);
  vec3 c = texture2D(t, uv).rgb;
  vec3 cp = clamp((c - ${BLACK.toFixed(5)}) / ${(1 - BLACK).toFixed(5)}, 0., 1.);
  float L = max(cp.r, max(cp.g, cp.b));
  float halo = (1. - body) * (1. - smoothstep(.45, .85, L));
  cp = mix(cp, clamp(A * cp, 0., 1.), halo);
  float a = mix(L, 1., body);
  vec3 pm = min(mix(cp, c, body), vec3(a));
  gl_FragColor = vec4(pm, a);
}`;

function setupGl(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform3fv(gl.getUniformLocation(prog, "E"), edges());
  gl.uniform2f(gl.getUniformLocation(prog, "R"), VW, VH);
  const uA = gl.getUniformLocation(prog, "A");
  let last = "";
  return (v: HTMLVideoElement, accent: readonly [number, number]) => {
    const key = accent.join();
    if (key !== last) {
      gl.uniformMatrix3fv(uA, false, accentMatrix(accent[0], accent[1]));
      last = key;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, v);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

export function TvArt({ className, turnOn = true }: { className?: string; turnOn?: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onRef = useRef<HTMLVideoElement>(null);
  const holdRef = useRef<HTMLVideoElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [noGl, setNoGl] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(rm);
    const canvas = canvasRef.current,
      on = onRef.current,
      hold = holdRef.current;
    if (!canvas || !on || !hold) return;
    const draw = setupGl(canvas);
    if (!draw) {
      setNoGl(true);
      return;
    }
    let accent = readAccent();
    let dead = false,
      raf = 0,
      frame = 0;
    const timers: number[] = [];

    if (rm) {
      // reduced motion: one still frame of the loop (colour bars + faces), redrawn when the theme moves
      const show = () => {
        if (hold.readyState >= 2) {
          draw(hold, accent);
          setDrawn(true);
        }
      };
      hold.addEventListener("seeked", show);
      hold.addEventListener("loadeddata", () => (hold.currentTime = 1.5), { once: true });
      if (hold.readyState >= 1) hold.currentTime = 1.5;
      timers.push(
        window.setInterval(() => {
          const a = readAccent();
          if (a.join() !== accent.join()) {
            accent = a;
            show();
          }
        }, 500),
      );
      return () => {
        timers.forEach(clearInterval);
        hold.removeEventListener("seeked", show);
      };
    }

    let cur: HTMLVideoElement = turnOn ? on : hold;
    let visible = true;
    const tick = () => {
      if (dead) return;
      if (++frame % 15 === 0) accent = readAccent();
      if (cur.readyState >= 2) {
        draw(cur, accent);
        if (!drawn) setDrawn(true);
      }
      raf = requestAnimationFrame(tick);
    };
    const play = (v: HTMLVideoElement) => v.play().catch(() => {});
    on.onended = () => {
      cur = hold;
      hold.currentTime = 0;
      play(hold);
    };
    on.onerror = () => on.onended?.(new Event("ended"));
    play(cur);
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting === visible) return;
      visible = e.isIntersecting;
      if (visible) {
        play(cur);
        raf = requestAnimationFrame(tick);
      } else {
        cur.pause();
        cancelAnimationFrame(raf);
      }
    });
    if (wrap.current) io.observe(wrap.current);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      on.pause();
      hold.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnOn]);

  const poster = reduce || !turnOn ? "/images/tv/tv1-hold.webp" : "/images/tv/tv1-turnon-first.webp";

  return (
    <div ref={wrap} className={cn("tv-art", className)} aria-hidden>
      <img
        src={poster}
        alt=""
        width={VW}
        height={VH}
        className={cn("tv-art-layer", drawn && "opacity-0")}
        decoding="async"
      />
      {!noGl ? (
        <>
          <canvas ref={canvasRef} width={VW} height={VH} className="tv-art-layer" />
          <video ref={onRef} className="tv-art-src" src="/video/tv1-turnon.mp4" muted playsInline preload="auto" tabIndex={-1} />
          <video ref={holdRef} className="tv-art-src" src="/video/tv1-hold-loop.mp4" muted loop playsInline preload="auto" tabIndex={-1} />
        </>
      ) : null}
    </div>
  );
}
