import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({ component: NotFound });

function NotFound() {
  return (
    <div className="relative overflow-hidden shadow-border">
      <img
        src="/images/ice-machine.jpg"
        alt="Ice machine in a motel breezeway"
        className="h-[min(70vh,640px)] w-full object-cover"
      />
      <div className="absolute inset-0 bg-bg/70" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <img
          src="/images/mark.png"
          alt=""
          className="mark mb-4 h-28 w-auto"
        />
        <p className="hud-label text-primary">NO SIGNAL · ROOM 404</p>
        <h1 className="mt-2 font-display text-6xl tracking-[0.08em] chromatic sm:text-8xl">
          Ice machine ate it
        </h1>
        <p className="mt-3 max-w-md text-muted">
          That page doesn't come in. The clerk shrugged.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to the lobby</Link>
        </Button>
      </div>
    </div>
  );
}
