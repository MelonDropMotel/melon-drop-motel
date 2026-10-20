"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tyler's TV piece from the stream kit (white boxy CRT, two antennas, purple line).
 * The kit's tv1-turnon / tv1-hold-loop videos are on black and the kit hides that
 * black with mix-blend-mode: screen + a black body plate (brb.html). On the site the
 * page behind is not black, so that leaves a faint box; instead the site uses a
 * web-only derivative (scripts/tv-alpha.py): same frames, stacked colour (top) +
 * alpha matte (bottom) in one H.264 file, drawn with a tiny WebGL shader so only the
 * TV itself is opaque. Works in every browser that plays H.264 + WebGL (incl. iOS);
 * otherwise, and with reduced motion, a transparent still of the same frame shows.
 * The glow is a CSS drop-shadow of that alpha shape in the current theme colour.
 */

const VERT = `attribute vec2 p; varying vec2 uv;
void main(){ uv = vec2((p.x+1.)*.5, (1.-p.y)*.5); gl_Position = vec4(p,0.,1.); }`;
const FRAG = `precision mediump float; varying vec2 uv; uniform sampler2D t;
void main(){ vec3 c = texture2D(t, vec2(uv.x, uv.y*.5)).rgb; float a = texture2D(t, vec2(uv.x, .5+uv.y*.5)).r;
  gl_FragColor = vec4(c*a, a); }`;

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
  return (v: HTMLVideoElement) => {
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
  const [still, setStill] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    const canvas = canvasRef.current,
      on = onRef.current,
      hold = holdRef.current;
    if (!canvas || !on || !hold) return;
    const draw = setupGl(canvas);
    if (!draw) {
      setStill(true);
      return;
    }
    let cur: HTMLVideoElement = turnOn ? on : hold;
    let raf = 0,
      visible = true,
      dead = false;
    const tick = () => {
      if (dead) return;
      if (cur.readyState >= 2) {
        draw(cur);
        setDrawn(true);
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
    if (turnOn) play(on);
    else play(hold);
    raf = requestAnimationFrame(tick);
    // pause off-screen
    const io = new IntersectionObserver(([e]) => {
      const now = e.isIntersecting;
      if (now === visible) return;
      visible = now;
      if (now) {
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
  }, [turnOn]);

  const poster = still || !turnOn ? "/images/tv/tv1-hold.webp" : "/images/tv/tv1-turnon-first.webp";

  return (
    <div ref={wrap} className={cn("tv-art", className)} aria-hidden>
      <img
        src={poster}
        alt=""
        width={1152}
        height={1024}
        className={cn("tv-art-layer", drawn && !still && "opacity-0")}
        decoding="async"
      />
      {!still ? (
        <>
          <canvas ref={canvasRef} width={1152} height={1024} className="tv-art-layer" />
          <video ref={onRef} className="tv-art-src" src="/video/tv1-turnon-alpha.mp4" muted playsInline preload="auto" tabIndex={-1} />
          <video ref={holdRef} className="tv-art-src" src="/video/tv1-hold-loop-alpha.mp4" muted loop playsInline preload="auto" tabIndex={-1} />
        </>
      ) : null}
    </div>
  );
}
