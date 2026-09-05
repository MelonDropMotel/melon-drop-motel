import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ytThumb(id: string, quality: "hq" | "mq" | "max" = "hq") {
  const file =
    quality === "max"
      ? "maxresdefault.jpg"
      : quality === "mq"
        ? "mqdefault.jpg"
        : "hqdefault.jpg";
  return `https://i.ytimg.com/vi/${id}/${file}`;
}

export function ytWatch(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function formatAirDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m`;
}
