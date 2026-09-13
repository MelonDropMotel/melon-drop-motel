"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { WikiKind } from "@/lib/wiki";
import { WIKI_KINDS } from "@/lib/wiki";
import { landNoise, pegDoot, resumeArcade } from "@/lib/arcade-sfx";
import { Button } from "@/components/ui/button";

export const LABELS: Record<WikiKind, string> = {
  person: "Person",
  place: "Place",
  thing: "Thing",
  action: "Action",
  event: "Event",
};

export const PLINKO_SLOTS = 9;

type Peg = {
  x: number;
  y: number;
  gone: boolean;
  kind: "round" | "square";
  spin: number;
  spinRate: number;
  lastHit: number;
};
type Puck = { x: number; y: number; vx: number; vy: number };

type Props = {
  slots: WikiKind[];
  glow: number | null;
  disabled?: boolean;
  overlay?: ReactNode;
  onLand: (kind: WikiKind, index: number) => void;
};

const W = 920;
const SLOTS = PLINKO_SLOTS;
const WALL = 10;
const HEADER = 34;
const MARGIN = WALL;
const SLOT_W = (W - WALL * 2) / SLOTS;
const ROW_H = SLOT_W * 0.66;
const ROWS = 10;
const PEG_R = 7.5;
const PUCK_R = 16.5;
const RAIL_Y = HEADER + 10 + PUCK_R;
const START_Y = RAIL_Y + PUCK_R + 46;
const FLOOR = START_Y + ROWS * ROW_H + 8;
const H = FLOOR + 88;
const GREEN = 0.25;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function makePeg(x: number, y: number): Peg {
  const square = Math.random() < 0.12;
  return {
    x,
    y,
    gone: false,
    kind: square ? "square" : "round",
    spin: Math.random() * Math.PI,
    spinRate: square
      ? (0.002 + Math.random() * 0.005) * (Math.random() < 0.5 ? -1 : 1)
      : 0,
    lastHit: -999,
  };
}

function buildPegs(): Peg[] {
  const pegs: Peg[] = [];
  for (let r = 0; r < ROWS; r++) {
    const y = START_Y + r * ROW_H;
    if (r % 2 === 0) {
      for (let i = 1; i < SLOTS; i++) {
        pegs.push(makePeg(MARGIN + i * SLOT_W, y));
      }
    } else {
      for (let i = 0; i < SLOTS; i++) {
        pegs.push(makePeg(MARGIN + (i + 0.5) * SLOT_W, y));
      }
    }
  }
  return pegs;
}

function spawnPuck(x = W / 2): Puck {
  return { x: clamp(x, MARGIN + PUCK_R + 4, W - WALL - PUCK_R - 4), y: RAIL_Y, vx: 0, vy: 0 };
}

export function shuffleTopics(live: WikiKind[]): WikiKind[] {
  const bag = live.length ? [...live] : [...WIKI_KINDS];
  const slots: WikiKind[] = [...bag].sort(() => Math.random() - 0.5);
  while (slots.length < SLOTS) {
    slots.push(bag[Math.floor(Math.random() * bag.length)]);
  }
  return slots.sort(() => Math.random() - 0.5);
}

export function WikiPlinko({
  slots,
  glow,
  disabled,
  overlay,
  onLand,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pegsRef = useRef<Peg[]>(buildPegs());
  const puckRef = useRef<Puck>(spawnPuck());
  const fallingRef = useRef(false);
  const dragRef = useRef(false);
  const greenRef = useRef(Math.random() < GREEN);
  const slotsRef = useRef(slots);
  const glowRef = useRef(glow);
  const onLandRef = useRef(onLand);
  const [busy, setBusy] = useState(false);
  const [grab, setGrab] = useState(false);
  slotsRef.current = slots;
  glowRef.current = glow;
  onLandRef.current = onLand;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    let raf = 0;
    let dead = false;
    const floor = FLOOR;

    function toLocal(clientX: number, clientY: number) {
      const r = canvas!.getBoundingClientRect();
      return {
        x: ((clientX - r.left) * W) / r.width,
        y: ((clientY - r.top) * H) / r.height,
      };
    }

    function onDown(e: PointerEvent) {
      if (fallingRef.current || disabled) return;
      const p = toLocal(e.clientX, e.clientY);
      const puck = puckRef.current;
      if (Math.hypot(p.x - puck.x, p.y - puck.y) > PUCK_R * 2.4) return;
      dragRef.current = true;
      setGrab(true);
      canvas!.setPointerCapture(e.pointerId);
      puck.x = clamp(p.x, MARGIN + PUCK_R + 4, W - WALL - PUCK_R - 4);
      puck.y = RAIL_Y;
      puck.vx = 0;
      puck.vy = 0;
    }
    function onMove(e: PointerEvent) {
      if (!dragRef.current || fallingRef.current) return;
      const p = toLocal(e.clientX, e.clientY);
      puckRef.current.x = clamp(p.x, MARGIN + PUCK_R + 4, W - WALL - PUCK_R - 4);
      puckRef.current.y = RAIL_Y;
    }
    function onUp() {
      dragRef.current = false;
      setGrab(false);
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    function pixelDisc(cx: number, cy: number, r: number, fill: string) {
      const x0 = Math.round(cx);
      const y0 = Math.round(cy);
      const rr = Math.round(r);
      ctx.fillStyle = fill;
      for (let y = -rr; y <= rr; y++) {
        const span = Math.round(Math.sqrt(Math.max(0, rr * rr - y * y)));
        ctx.fillRect(x0 - span, y0 + y, span * 2 + 1, 1);
      }
    }

    function paint(t: number) {
      if (!ctx) return;
      ctx.fillStyle = "#050405";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#ff4b6e";
      ctx.fillRect(0, 0, W, HEADER);
      ctx.fillStyle = "#1a1416";
      ctx.fillRect(0, HEADER, W, 4);
      ctx.fillStyle = "#050405";
      ctx.font = "18px VT323, ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText("WIKI  PLINKO", W / 2, 23);

      ctx.fillStyle = "#1a1416";
      ctx.fillRect(0, HEADER + 4, WALL, H);
      ctx.fillRect(W - WALL, HEADER + 4, WALL, H);
      ctx.fillStyle = "#ff4b6e";
      ctx.fillRect(WALL - 2, HEADER + 4, 2, H);
      ctx.fillRect(W - WALL, HEADER + 4, 2, H);

      const lit = glowRef.current;
      ctx.strokeStyle = "#f3ebe3";
      ctx.lineWidth = 2;
      for (let i = 0; i <= SLOTS; i++) {
        const x = Math.round(MARGIN + i * SLOT_W);
        ctx.fillStyle = "#1a1416";
        ctx.fillRect(x - 2, floor, 4, H - floor);
      }
      slotsRef.current.forEach((k, i) => {
        const x = Math.round(MARGIN + i * SLOT_W);
        const on = lit === i;
        const pulse = on && Math.floor(t / 140) % 2 === 0;
        ctx.fillStyle = on ? (pulse ? "#ff4b6e" : "#f3ebe3") : "#1a1416";
        ctx.fillRect(x + 3, floor + 3, Math.round(SLOT_W) - 6, H - floor - 6);
        ctx.fillStyle = on && !pulse ? "#050405" : "#f3ebe3";
        ctx.font = "13px VT323, ui-monospace, monospace";
        const label = LABELS[k];
        if (label) {
          ctx.fillText(label.toUpperCase(), MARGIN + (i + 0.5) * SLOT_W, H - 14);
        }
      });

      const pegs = pegsRef.current;
      for (const p of pegs) {
        if (p.gone) continue;
        if (p.kind === "square") {
          p.spin += p.spinRate * 16;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin);
          ctx.fillStyle = "#f3ebe3";
          ctx.fillRect(-PEG_R, -PEG_R, PEG_R * 2, PEG_R * 2);
          ctx.restore();
        } else {
          ctx.fillStyle = "#f3ebe3";
          ctx.beginPath();
          ctx.arc(p.x, p.y, PEG_R, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const puck = puckRef.current;
      const green = greenRef.current;

      if (fallingRef.current) {
        puck.vy += 0.085;
        puck.vx *= 0.995;
        puck.x += puck.vx;
        puck.y += puck.vy;
        if (puck.x < MARGIN + PUCK_R + 2) {
          puck.x = MARGIN + PUCK_R + 2;
          puck.vx *= -0.82;
        }
        if (puck.x > W - WALL - PUCK_R - 2) {
          puck.x = W - WALL - PUCK_R - 2;
          puck.vx *= -0.82;
        }

        for (const p of pegsRef.current) {
          if (p.gone) continue;
          if (puck.y > floor - PUCK_R * 0.4) continue;
          const dx = puck.x - p.x;
          const dy = puck.y - p.y;
          const d = Math.hypot(dx, dy);
          const min = PUCK_R + PEG_R;
          if (d > 0 && d < min) {
            if (t - p.lastHit > 90) {
              p.lastHit = t;
              pegDoot(green ? 7 : 0);
            }
            const nx = dx / d;
            const ny = dy / d;
            puck.x += nx * (min - d);
            puck.y += ny * (min - d);
            const dot = puck.vx * nx + puck.vy * ny;
            const spinKick = p.kind === "square" ? p.spinRate * 40 : 0;
            puck.vx =
              (puck.vx - 1.85 * dot * nx) * 0.9 +
              (Math.random() - 0.5) * 0.35 -
              ny * spinKick;
            puck.vy = (puck.vy - 1.85 * dot * ny) * 0.9 + nx * spinKick;
            if (puck.vy > 0 && ny < 0) puck.vy -= 0.35;
          }
        }

        if (puck.y + PUCK_R > floor) {
          const idx = Math.min(
            SLOTS - 1,
            Math.max(0, Math.floor((puck.x - MARGIN) / SLOT_W)),
          );
          const left = MARGIN + idx * SLOT_W + PUCK_R + 2;
          const right = MARGIN + (idx + 1) * SLOT_W - PUCK_R - 2;
          if (puck.x < left) {
            puck.x = left;
            puck.vx *= -0.25;
          }
          if (puck.x > right) {
            puck.x = right;
            puck.vx *= -0.25;
          }
          const nest = H - 20 - PUCK_R;
          if (puck.y > nest) {
            puck.y = nest;
            puck.vy *= -0.22;
            puck.vx *= 0.55;
            if (Math.abs(puck.vy) < 0.16 && Math.abs(puck.vx) < 0.16) {
              puck.x = MARGIN + (idx + 0.5) * SLOT_W;
              puck.vx = 0;
              puck.vy = 0;
              fallingRef.current = false;
              setBusy(false);
              landNoise();
              onLandRef.current(slotsRef.current[idx], idx);
            }
          }
        }
      }

      pixelDisc(puck.x, puck.y, PUCK_R, green ? "#2f9e44" : "#ff4b6e");
      pixelDisc(puck.x - 4, puck.y - 4, 4, "#f3ebe3");
    }

    function loop(t: number) {
      if (dead) return;
      try {
        paint(t);
      } catch {
        /* keep the tube on */
      }
      raf = requestAnimationFrame(loop);
    }
    paint(0);
    raf = requestAnimationFrame(loop);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [disabled]);

  return (
    <div className="flex flex-col gap-3">
      <div className="crt-bezel relative min-w-0">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="wiki-board block h-auto w-full bg-[#050405]"
        />
        {overlay}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          disabled={busy || disabled}
          onClick={() => {
            if (busy || disabled || fallingRef.current) return;
            const puck = puckRef.current;
            greenRef.current = Math.random() < GREEN;
            puck.y = RAIL_Y;
            puck.vx = 0;
            puck.vy = 0.2;
            resumeArcade();
            fallingRef.current = true;
            setBusy(true);
          }}
        >
          {busy ? "Falling…" : "Drop"}
        </Button>
        <p className="text-sm tracking-[0.08em] text-muted">
          Drag, then drop.
        </p>
      </div>
    </div>
  );
}
