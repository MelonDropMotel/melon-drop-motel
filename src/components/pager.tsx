"use client";

import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { pageItems, pageParam, type PageSlice } from "@/lib/paginate";

/**
 * Prev / numbered / Next links for a paginated list. Stays on the current route and
 * only changes one search param (default "page"; page 1 drops it), so URLs are shareable.
 * On page change the list (anchorId) is scrolled into view.
 */
export function Pager({
  slice,
  param = "page",
  anchorId,
  label = "Pages",
}: {
  slice: PageSlice;
  param?: string;
  anchorId: string;
  label?: string;
}) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = document.getElementById(anchorId);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - 96; // clear the sticky header
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }, [slice.page, anchorId]);

  if (slice.pages <= 1) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const to = (n: number): any => (prev: Record<string, unknown>) => ({ ...prev, [param]: pageParam(n) });

  return (
    <nav aria-label={label} className="pager">
      {slice.prev ? (
        <Link to="." search={to(slice.prev)} resetScroll={false} rel="prev" className="pager-btn">
          ← Prev
        </Link>
      ) : (
        <span className="pager-btn is-disabled" aria-disabled="true">
          ← Prev
        </span>
      )}
      <ul className="flex flex-wrap items-center gap-1.5">
        {pageItems(slice.pages, slice.page).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} className="px-1 text-muted" aria-hidden>
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                to="." search={to(n)} resetScroll={false}
                aria-label={`Page ${n}`}
                aria-current={n === slice.page ? "page" : undefined}
                className={cn("pager-num", n === slice.page && "is-current")}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ul>
      {slice.next ? (
        <Link to="." search={to(slice.next)} resetScroll={false} rel="next" className="pager-btn">
          Next →
        </Link>
      ) : (
        <span className="pager-btn is-disabled" aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  );
}
