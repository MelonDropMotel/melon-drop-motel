import { createFileRoute, Link } from "@tanstack/react-router";
import { PRESS } from "@/data/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <div className="flex flex-col gap-12">
      <section className="relative overflow-hidden bg-bg shadow-border">
        <img
          src="/images/banner.jpg"
          alt=""
          className="h-96 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="hud-label">Who?</p>
          <h1 className="mt-3 font-display text-4xl tracking-[0.08em] sm:text-6xl">
            Two idiots.
            <br />
            One hell of a show.
          </h1>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="bg-surface p-6 shadow-border">
          <p className="hud-label">Host</p>
          <h2 className="mt-1 font-display text-4xl tracking-[0.08em]">
            Tyler
          </h2>
          <p className="mt-3 text-muted">
            The first man to be created in a lab, without science. Tyler came
            into existence out of pure willpower, emerging from a cocoon of
            nothing. He spends his time crocheting and scrapbooking.
          </p>
        </article>
        <article className="bg-surface p-6 shadow-border">
          <p className="hud-label">Host</p>
          <h2 className="mt-1 font-display text-4xl tracking-[0.08em]">
            Rusty
          </h2>
          <p className="mt-3 text-muted">
            Born in the sewers, Rusty emerged alongside his cohost in 2025. He
            hopes to build his fortune for cosmetic surgeries, so he can finally
            achieve his dream of becoming a real life dinosaur.
          </p>
        </article>
      </section>

      <section>
        <p className="hud-label">Press, sort of</p>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {PRESS.map((p) => (
            <li key={p.source} className="border-l-2 border-primary bg-surface p-5">
              <p className="text-xl text-fg">“{p.quote}”</p>
              <p className="mt-3 hud-label">{p.source}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative overflow-hidden shadow-border">
        <img
          src="/images/motel-room-v2.jpg"
          alt="Motel room with a glowing CRT"
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-0 bg-bg/55" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
          <p className="hud-label">Booking</p>
          <p className="font-display text-4xl tracking-[0.08em]">
            Lock in your stay now!
          </p>
          <Button asChild className="mt-4">
            <Link to="/desk">Talk to the desk</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
