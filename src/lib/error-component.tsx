import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="hud-label text-primary">NO SIGNAL</p>
      <h1 className="font-display text-6xl tracking-[0.08em] chromatic">
        TRACKING ERROR
      </h1>
      <p className="max-w-md break-words text-muted">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex h-12 items-center bg-primary px-6 font-display text-xl tracking-[0.14em] text-bg"
      >
        Back to lobby
      </Link>
    </main>
  );
}
