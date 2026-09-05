import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({ component: Shop });

function Shop() {
  return (
    <section className="relative overflow-hidden shadow-border">
      <img
        src="/images/crt-snow.jpg"
        alt="Television static. The gift shop has no signal."
        className="h-96 w-full object-cover"
      />
      <div className="absolute inset-0 bg-bg/55" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className="hud-label text-primary">Gift shop</p>
        <h1 className="mt-3 font-display text-6xl tracking-[0.08em] chromatic sm:text-8xl">
          No signal
        </h1>
        <p className="mt-4 max-w-md text-xl text-fg">
          The store is empty. The ice machine ate the inventory.
        </p>
      </div>
    </section>
  );
}
