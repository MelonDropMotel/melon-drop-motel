import { createFileRoute } from "@tanstack/react-router";
import { MotelSign } from "@/components/motel-sign";

export const Route = createFileRoute("/shop")({ component: Shop });

function Shop() {
  return (
    <section className="theme-panel flex flex-col items-center px-6 py-10 text-center sm:py-14">
      <MotelSign className="w-full max-w-[13rem]" />
      <div className="mt-6 flex flex-col items-center">
        <p className="hud-label text-primary">Gift shop</p>
        <h1 className="mt-3 font-display text-6xl tracking-[0.08em] chromatic sm:text-8xl">
          No signal
        </h1>
        <p className="mt-4 max-w-md text-xl text-fg">
          The store is empty. Come back when the clerk finds the key.
        </p>
      </div>
    </section>
  );
}
