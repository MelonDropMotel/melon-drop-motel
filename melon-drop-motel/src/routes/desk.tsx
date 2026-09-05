"use client";

import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { SITE } from "@/data/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desk")({ component: Desk });

type Guest = { name: string; note: string; at: number };

const GUEST_KEY = "mdm-guest-list";
const MAIL_URL = `https://formsubmit.co/ajax/${SITE.email}`;

async function sendDeskMail(payload: Record<string, string>) {
  const res = await fetch(MAIL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _captcha: "false",
      _template: "table",
      ...payload,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean | string;
    message?: string;
  };
  const ok = json.success === true || json.success === "true";
  if (!res.ok || !ok) {
    throw new Error(json.message || "send failed");
  }
}

function Desk() {
  const [booked, setBooked] = useState(false);
  const [bookError, setBookError] = useState(false);
  const [booking, setBooking] = useState(false);
  const [listed, setListed] = useState(false);
  const [listError, setListError] = useState(false);
  const [listing, setListing] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestNote, setGuestNote] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(GUEST_KEY);
      if (raw) setGuests(JSON.parse(raw) as Guest[]);
    } catch {
      /* ignore */
    }
  }, []);

  async function onBook(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setBooking(true);
    setBookError(false);
    try {
      await sendDeskMail({
        _subject: `Desk — ${data.kind || "inquiry"} from ${data.name || "someone"}`,
        form: "booking",
        name: data.name ?? "",
        email: data.email ?? "",
        city: data.city ?? "",
        kind: data.kind ?? "",
        note: data.note ?? "",
      });
      setBooked(true);
      form.reset();
    } catch {
      setBookError(true);
    } finally {
      setBooking(false);
    }
  }

  async function onNews(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") || "");
    setListing(true);
    setListError(false);
    try {
      await sendDeskMail({
        _subject: `Tape drop alert — ${email}`,
        form: "alerts",
        email,
      });
      setListed(true);
    } catch {
      setListError(true);
    } finally {
      setListing(false);
    }
  }

  function onGuest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!guestName.trim() || !guestNote.trim()) return;
    const next = [
      { name: guestName.trim(), note: guestNote.trim(), at: Date.now() },
      ...guests,
    ].slice(0, 12);
    setGuests(next);
    try {
      window.localStorage.setItem(GUEST_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setGuestName("");
    setGuestNote("");
  }

  const field =
    "h-12 w-full bg-bg px-3 text-fg shadow-border outline-none placeholder:text-muted focus:shadow-border-hover";

  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="hud-label">Front desk</p>
        <h1 className="font-display text-5xl tracking-[0.08em] chromatic sm:text-7xl">
          Ring the bell
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Bookings, guest list, complaints about the ice machine. Your letter
          will be delivered directly to the motel staff. We'll get back to you
          when the tracking settles.
        </p>
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={onBook} className="flex flex-col gap-3 bg-surface p-5 shadow-border">
          <p className="hud-label">Booking</p>
          <h2 className="font-display text-3xl tracking-[0.08em]">
            Put the boys on a bill
          </h2>
          <label className="mt-2">
            <span className="hud-label">Name</span>
            <input name="name" required className={`mt-1 ${field}`} />
          </label>
          <label>
            <span className="hud-label">Email</span>
            <input
              name="email"
              type="email"
              required
              className={`mt-1 ${field}`}
            />
          </label>
          <label>
            <span className="hud-label">City</span>
            <input name="city" className={`mt-1 ${field}`} />
          </label>
          <label>
            <span className="hud-label">What is this</span>
            <select name="kind" className={`mt-1 ${field}`}>
              <option value="Live show">Live show</option>
              <option value="Podcast guest">Podcast guest</option>
              <option value="Weird purpose">Weird purpose</option>
              <option value="Suggestion">Suggestion</option>
            </select>
          </label>
          <label>
            <span className="hud-label">Note</span>
            <textarea
              name="note"
              rows={4}
              className="mt-1 min-h-28 w-full bg-bg p-3 text-fg shadow-border outline-none placeholder:text-muted focus:shadow-border-hover"
            />
          </label>
          {booked ? (
            <p className="text-primary">
              Transmission received. The clerk will pretend to look for a pen.
            </p>
          ) : (
            <>
              {bookError ? (
                <p className="text-primary">
                  The clerk lost the fax. Try again in a minute.
                </p>
              ) : null}
              <Button type="submit" className="mt-2" disabled={booking}>
                {booking ? "Sending…" : "Send it"}
              </Button>
            </>
          )}
        </form>

        <div className="flex flex-col gap-6">
          <form onSubmit={onNews} className="bg-surface p-5 shadow-border">
            <p className="hud-label">Permanent guest list</p>
            <h2 className="font-display text-3xl tracking-[0.08em]">
              Tape drop alerts
            </h2>
            <p className="mt-2 text-muted">
              Get pinged when a new tape lands. Sign up for our mailing list!
            </p>
            {listed ? (
              <p className="mt-4 text-primary">
                You're on the list. Don't lose the key.
              </p>
            ) : (
              <>
                {listError ? (
                  <p className="mt-3 text-primary">
                    Didn't go through. Hit check-in again.
                  </p>
                ) : null}
                <div className="mt-4 flex flex-row items-center gap-3">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@motel.tv"
                    className="h-12 min-w-0 flex-1 bg-bg px-3 text-fg shadow-border outline-none placeholder:text-muted focus:shadow-border-hover"
                  />
                  <Button type="submit" className="shrink-0 whitespace-nowrap" disabled={listing}>
                    {listing ? "…" : "Check in"}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="bg-surface p-5 shadow-border">
            <p className="hud-label">Find us</p>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {SITE.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 items-center px-3 text-fg shadow-border transition-colors hover:text-primary"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <p className="hud-label">Guestbook</p>
        <h2 className="font-display text-4xl tracking-[0.08em]">
          Who else is staying
        </h2>
        <form
          onSubmit={onGuest}
          className="mt-4 grid gap-3 md:grid-cols-[1fr_2fr_auto]"
        >
          <input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Name"
            className={field}
          />
          <input
            value={guestNote}
            onChange={(e) => setGuestNote(e.target.value)}
            placeholder="Something unwise"
            className={field}
          />
          <Button type="submit">Sign</Button>
        </form>
        <ul className="mt-6 divide-y divide-fg/10 border-y border-fg/10">
          {guests.length === 0 ? (
            <li className="py-4 text-muted">Nobody signed. Typical.</li>
          ) : (
            guests.map((g) => (
              <li key={g.at} className="py-4">
                <p className="font-display text-2xl tracking-[0.08em]">{g.name}</p>
                <p className="text-muted">{g.note}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
