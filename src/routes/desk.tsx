"use client";

import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { SITE } from "@/data/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desk")({ component: Desk });

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
  const msg = json.message || "";
  if (/activat/i.test(msg)) {
    return "activate" as const;
  }
  const ok = json.success === true || json.success === "true";
  if (!res.ok || !ok) {
    throw new Error(msg || "send failed");
  }
  return "sent" as const;
}

function Desk() {
  const [booked, setBooked] = useState(false);
  const [bookError, setBookError] = useState(false);
  const [booking, setBooking] = useState(false);
  const [listed, setListed] = useState(false);
  const [listError, setListError] = useState(false);
  const [listing, setListing] = useState(false);
  const [activateHint, setActivateHint] = useState(false);

  async function onBook(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setBooking(true);
    setBookError(false);
    setActivateHint(false);
    try {
      const result = await sendDeskMail({
        _subject: `Desk — ${data.kind || "inquiry"} from ${data.name || "someone"}`,
        form: "booking",
        name: data.name ?? "",
        email: data.email ?? "",
        city: data.city ?? "",
        kind: data.kind ?? "",
        note: data.note ?? "",
      });
      if (result === "activate") setActivateHint(true);
      else {
        setBooked(true);
        form.reset();
      }
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
    setActivateHint(false);
    try {
      const result = await sendDeskMail({
        _subject: `Tape drop alert — ${email}`,
        form: "alerts",
        email,
      });
      if (result === "activate") setActivateHint(true);
      else setListed(true);
    } catch {
      setListError(true);
    } finally {
      setListing(false);
    }
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
          Your letter will be delivered directly to the motel staff.
        </p>
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={onBook} className="flex flex-col gap-3 bg-surface p-5 shadow-border">
          <p className="hud-label">Booking</p>
          <h2 className="font-display text-3xl tracking-[0.08em]">
            Put the guys on a bill
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
              {activateHint ? (
                <p className="text-primary">
                  First letter needs a key. Check the motel inbox (and spam)
                  for FormSubmit, click Activate Form, then send again.
                </p>
              ) : null}
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
                {activateHint ? (
                  <p className="mt-3 text-primary">
                    First letter needs a key. Check the motel inbox (and spam)
                    for FormSubmit, click Activate Form, then send again.
                  </p>
                ) : null}
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
    </div>
  );
}
