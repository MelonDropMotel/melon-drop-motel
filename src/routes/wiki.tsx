"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LABELS, WikiPlinko, shuffleTopics } from "@/components/wiki-plinko";
import { Button } from "@/components/ui/button";
import {
  getWikiRack,
  WIKI_KINDS,
  type WikiArticle,
  type WikiKind,
} from "@/lib/wiki";

export const Route = createFileRoute("/wiki")({
  loader: () => getWikiRack(),
  component: Wiki,
});

function editionDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ResultCard({
  pick,
  emptyKind,
  onAgain,
}: {
  pick: WikiArticle | null;
  emptyKind: boolean;
  onAgain: () => void;
}) {
  return (
    <div className="wiki-paper flex h-full min-h-0 flex-col p-5 sm:p-7">
      <p className="wiki-masthead text-center text-xs text-[#1a1214]">
        Late city final · Vol. 69
      </p>
      <h2 className="wiki-masthead mt-1 text-center text-4xl leading-none sm:text-5xl">
        The Motel Dispatch
      </h2>
      <p className="mt-1 text-center text-xs tracking-[0.14em] uppercase">
        {editionDate()}
      </p>
      <hr className="wiki-rule my-3" />

      {pick ? (
        <div className="grid min-h-0 flex-1 items-stretch gap-5 overflow-hidden sm:grid-cols-[minmax(10rem,16rem)_minmax(0,1fr)]">
          {pick.thumb ? (
            <img
              src={pick.thumb}
              alt=""
              className="wiki-halftone h-full max-h-56 w-full object-cover sm:max-h-none"
            />
          ) : (
            <div className="hidden bg-[#d9cfc4] sm:block" />
          )}
          <div className="flex min-h-0 min-w-0 flex-col">
            <p className="text-xs tracking-[0.18em] uppercase">
              {LABELS[pick.kind]} · Encyclopedia desk
            </p>
            <h3 className="wiki-masthead mt-1 text-4xl leading-[0.92] sm:text-6xl">
              {pick.title}
            </h3>
            {pick.description ? (
              <p className="mt-2 line-clamp-2 text-base italic">
                {pick.description}
              </p>
            ) : null}
            {pick.extract ? (
              <p className="mt-3 flex-1 text-[1.05rem] leading-[1.45]">
                {pick.extract}
              </p>
            ) : null}
          </div>
        </div>
      ) : emptyKind ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="wiki-masthead text-5xl">No copy</p>
          <p className="mt-2">That slot was vacant. Try another drop.</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {pick ? (
          <Button
            asChild
            className="bg-[#1a1214] text-[#f3ebe3] hover:bg-[#1a1214] hover:text-[#f3ebe3] hover:brightness-125"
          >
            <a href={pick.url} target="_blank" rel="noreferrer">
              Wikipedia
            </a>
          </Button>
        ) : null}
        <Button type="button" onClick={onAgain}>
          Play again
        </Button>
      </div>
    </div>
  );
}

function Wiki() {
  const articles = Route.useLoaderData();
  const [pick, setPick] = useState<WikiArticle | null>(null);
  const [empty, setEmpty] = useState(false);
  const [board, setBoard] = useState(0);
  const [glow, setGlow] = useState<number | null>(null);
  const showing = Boolean(pick) || empty;

  const counts = useMemo(() => {
    const next = { person: 0, place: 0, thing: 0, action: 0, event: 0 };
    for (const a of articles) next[a.kind] += 1;
    return next;
  }, [articles]);

  const liveKinds = useMemo(
    () => WIKI_KINDS.filter((k) => counts[k] > 0),
    [counts],
  );

  const [slots, setSlots] = useState<WikiKind[]>(() =>
    shuffleTopics(liveKinds),
  );

  function land(kind: WikiKind, index: number) {
    setGlow(index);
    if (!kind) {
      setPick(null);
      setEmpty(true);
      return;
    }
    const pool = articles.filter((a) => a.kind === kind);
    if (!pool.length) {
      setPick(null);
      setEmpty(true);
      return;
    }
    setEmpty(false);
    setPick(pool[Math.floor(Math.random() * pool.length)]);
  }

  function playAgain() {
    setPick(null);
    setEmpty(false);
    setGlow(null);
    setSlots(shuffleTopics(liveKinds));
    setBoard((n) => n + 1);
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="hud-label">Encyclopedia night</p>
          <h1 className="font-display text-4xl tracking-[0.08em] chromatic sm:text-5xl">
            THE WIKIPEDIAFILES
          </h1>
        </div>
        <p className="hidden text-sm tracking-[0.08em] text-muted md:block">
          {articles.length} clippings on file
        </p>
      </div>

      <div className="relative">
        <WikiPlinko
          key={board}
          slots={slots}
          glow={glow}
          disabled={showing}
          onLand={land}
          overlay={
            showing ? (
              <div className="absolute inset-0 z-10 overflow-hidden p-[0.7rem]">
                <div className="wiki-tv wiki-print h-full">
                  <ResultCard
                    pick={pick}
                    emptyKind={empty}
                    onAgain={playAgain}
                  />
                </div>
              </div>
            ) : null
          }
        />
      </div>

      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-center text-sm tracking-[0.12em] text-muted">
        {WIKI_KINDS.map((k) => (
          <li key={k}>
            {LABELS[k]} · {counts[k]}
          </li>
        ))}
      </ul>
    </div>
  );
}
