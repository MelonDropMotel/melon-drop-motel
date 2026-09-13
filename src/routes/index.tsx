import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { TubePlayer } from "@/components/tube-player";
import { Button } from "@/components/ui/button";
import { formatAirDate, ytThumb, cn } from "@/lib/utils";
import { getChannelVideos } from "@/lib/youtube";
import { getPodcastEpisodes } from "@/lib/podcast";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [videos, tapes] = await Promise.all([
      getChannelVideos(),
      getPodcastEpisodes(),
    ]);
    return { ...videos, tapes };
  },
  component: Home,
});

function Home() {
  const { episodes, clips, latest, tapes } = Route.useLoaderData();
  const strip = episodes.slice(0, 6);
  const latestTape = tapes[0];

  return (
    <div className="flex flex-col gap-14">
      <section className="relative overflow-hidden bg-bg shadow-border">
        <img
          src="/images/banner.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/40" />
        <div className="relative flex flex-col items-center px-5 py-12 text-center sm:py-16">
          <p className="hud-label text-primary">
            Current Events · Movies and Television · Unintelligible Rambling
          </p>
          <img
            src="/images/lockup.png"
            alt={SITE.name}
            className="mark mt-5 w-80 sm:w-96"
          />
          <p className="mt-5 max-w-lg text-xl text-fg sm:text-2xl">
            {SITE.tagline} Tyler and Rusty, giving their thoughtful insight on
            just about everything. Weekly, on the motel TV.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/watch">Watch the latest</Link>
            </Button>
            {latestTape ? (
              <Button asChild variant="ghost">
                <Link to="/watch" search={{ tape: latestTape.id }}>
                  Play the tape
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link to="/about">Meet the guys</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="hud-label">Now showing</p>
            <h2 className="mt-1 font-display text-3xl tracking-[0.08em] sm:text-4xl">
              {latest.ep
                ? `EP.${String(latest.ep).padStart(3, "0")} · ${latest.title}`
                : latest.title}
            </h2>
          </div>
          <p className="hud-label hidden lg:block">TV guide</p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(19rem,1fr)]">
          <div className="flex h-full min-h-0 min-w-0 flex-col">
            <TubePlayer video={latest} />
            <p className="mt-3 shrink-0 text-sm tracking-[0.08em] text-muted">
              {formatAirDate(latest.date)}
            </p>
            {latest.blurb ? (
              <p className="mt-2 min-h-0 flex-1 overflow-hidden whitespace-pre-line text-muted">
                {latest.blurb}
              </p>
            ) : null}
          </div>

          <aside className="flex flex-col bg-surface shadow-border">
            <p className="hud-label px-4 pt-4 lg:hidden">TV guide</p>
            <ul className="flex flex-1 flex-col">
              {strip.map((ep) => {
                const on = ep.id === latest.id;
                return (
                  <li key={ep.id} className="border-b border-fg/10 last:border-b-0">
                    <Link
                      to="/watch"
                      search={{ v: ep.id }}
                      className={cn(
                        "quiet flex gap-3 px-4 py-3 transition-colors",
                        on ? "bg-bg text-fg" : "hover:bg-bg/60 hover:text-primary",
                      )}
                    >
                      <img
                        src={ytThumb(ep.id)}
                        alt=""
                        className="h-16 w-[6.75rem] shrink-0 object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        {ep.ep ? (
                          <span className="block text-sm tracking-[0.16em] text-primary">
                            EP.{String(ep.ep).padStart(3, "0")}
                          </span>
                        ) : null}
                        <span className="block font-display text-xl leading-none tracking-[0.06em]">
                          {ep.title}
                        </span>
                        <span className="mt-1 block text-sm tracking-[0.08em] text-muted">
                          {formatAirDate(ep.date)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              to="/watch"
              className="quiet hud-label border-t border-fg/10 px-4 py-3 text-primary hover:text-fg"
            >
              Full tape list →
            </Link>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Link to="/about" className="group relative overflow-hidden bg-bg shadow-border">
          <img
            src="/images/mark.png"
            alt="Tyler and Rusty as comedy and tragedy masks"
            className="mark mx-auto h-72 w-auto object-contain p-8 transition-transform duration-200 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="hud-label">Who?</p>
            <p className="font-display text-4xl tracking-[0.08em]">
              Tyler & Rusty
            </p>
          </div>
        </Link>
        <Link to="/shop" className="group relative overflow-hidden shadow-border">
          <img
            src="/images/crt-snow.jpg"
            alt="Television static"
            className="h-72 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="hud-label">Gift shop</p>
            <p className="font-display text-4xl tracking-[0.08em]">
              No signal
            </p>
          </div>
        </Link>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="hud-label">Clips</p>
            <h2 className="font-display text-4xl tracking-[0.08em]">
              After the hour
            </h2>
          </div>
          <Link to="/watch" className="hud-label text-primary">
            See all →
          </Link>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clips.slice(0, 3).map((clip) => (
            <li key={clip.id}>
              <Link to="/watch" search={{ v: clip.id }} className="block">
                <img
                  src={ytThumb(clip.id)}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
                <p className="mt-2 font-display text-2xl tracking-[0.06em]">
                  {clip.title}
                </p>
                {clip.blurb ? (
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-muted">
                    {clip.blurb}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
