"use client";

// React & Next.js
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Components
import { Collapse } from "@/components/collapse";
import { Button } from "@/components/button";
import { useActionMode } from "@/components/layout/ActionMode";

// Helpers
import { ACTION_MODES } from "@/constants/action-modes";
import { THURSDAY_MODAL_PARAMS, type ThursdayModalParam } from "@/constants/modal-params";

// Shared by the mobile and desktop trigger layouts below.
const chevronClassName =
  "h-5 w-5 flex-none bg-[var(--input-icon)] transition-transform duration-250 [mask-image:url(../assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [[data-state=open]_&]:rotate-180";

interface ProductionItem {
  id: string;
  name: string;
  href?: string;
  location?: string;
  date?: string;
  content: ReactNode;
}

interface ProductionsCollapseProps {
  productions: ProductionItem[];
}

export default function ProductionsCollapse({ productions }: ProductionsCollapseProps) {
  const { activeMode } = useActionMode();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function openThursdayModal(thursdayId: string, modalParam: ThursdayModalParam) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(THURSDAY_MODAL_PARAMS.add);
    params.delete(THURSDAY_MODAL_PARAMS.view);
    params.delete(THURSDAY_MODAL_PARAMS.edit);
    params.delete(THURSDAY_MODAL_PARAMS.delete);
    params.set(modalParam, thursdayId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleActionModeClick(thursdayId: string) {
    if (activeMode === ACTION_MODES.editThursdays) {
      openThursdayModal(thursdayId, THURSDAY_MODAL_PARAMS.edit);
      return true;
    }

    if (activeMode === ACTION_MODES.deleteThursdays) {
      openThursdayModal(thursdayId, THURSDAY_MODAL_PARAMS.delete);
      return true;
    }

    return false;
  }

  return (
    <div
      className="relative"
      data-action-mode-target="thursday-card"
      data-thursday-id={productions[0]?.id}
      onClickCapture={(event) => {
        const thursdayId = productions[0]?.id;
        if (!thursdayId || !handleActionModeClick(thursdayId)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Collapse
        className="overflow-hidden rounded-xl border border-solid border-[var(--app-border)] text-[var(--app-text)]"
        items={productions.map((p, pIndex) => ({
          value: p.id,
          itemClassName: pIndex > 0 ? "border-t border-t-[var(--app-border)]" : "",
          // bg lives on the header only - it's the title row, not the body content below it.
          headerClassName: "items-center bg-[var(--app-secondary)] text-[var(--app-text)] transition-[background] duration-150 hover:bg-[var(--app-card-bg-hover)]",
          // Padding lives on the trigger button itself (not headerClassName,
          // the row around it) - the row uses items-stretch, so padding put
          // there sits outside the button's own box, unclickable despite
          // looking like part of the header.
          triggerClassName: "px-4 py-5",
          contentClassName: "px-4 pt-3 pb-4 text-[var(--app-text)]",
          // The title used to double as both the toggle trigger and a
          // navigation link when p.href was set (relying on stopPropagation
          // to keep the two from fighting). Radix's Trigger renders as a
          // real <button>, which an <a> can't legally nest inside — so the
          // title is now toggle-only, and navigation moved to a separate
          // link in `extra` below. A real, visible behavior change from the
          // antd version, not just a technical swap.
          trigger: (
            <>
              {/* Mobile: date/title/location stack vertically instead of
                  running in one row, which is what was overflowing the
                  viewport - the chevron sits to their left, centered against
                  the whole stack's height rather than stretched full-height
                  like the desktop dividers (there's nothing to divide here). */}
              <span className="flex min-w-0 flex-1 items-center gap-3 min-[769px]:hidden">
                <span className={chevronClassName} aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  {p.date && (
                    <span className="w-fit rounded-md border border-solid border-[var(--app-border)] bg-[var(--app-card-label-bg)] px-2 py-1 font-sans text-[0.6875rem] leading-tight font-semibold text-[var(--app-muted)] uppercase">
                      {p.date}
                    </span>
                  )}
                  <h3
                    className="m-0 w-full truncate font-heading text-xl font-bold leading-tight text-[var(--app-text)]"
                    title={p.name}
                  >
                    {p.name}
                  </h3>
                  {p.location && (
                    <span className="truncate text-[1.05rem] font-bold">{p.location}</span>
                  )}
                </span>
              </span>
              {/* Desktop: everything in one row - items-stretch (not center)
                  lets the border dividers below reach the row's full height,
                  self-center on the text/badge siblings keeps their own
                  vertical centering unaffected. self-stretch on this span
                  itself: collapseTriggerClassName (the <button> wrapping
                  this, shared by every Collapse consumer) centers its own
                  child instead of stretching it, so without this the
                  dividers would only reach this span's own content height,
                  not the button's full padded height. */}
              <span className="hidden items-stretch gap-[0.85rem] self-stretch min-[769px]:inline-flex">
                {p.date && (
                  // Same role-badge style as UserProfileView's role pill,
                  // not the mismatched ad-hoc styling this used to have.
                  // min-w keeps every date badge the same width, so the
                  // chevron/title after it start at a consistent line
                  // regardless of how long the date string is.
                  <span className="min-w-[5.5rem] self-center text-center rounded-md border border-solid border-[var(--app-border)] bg-[var(--app-card-label-bg)] px-2 py-1 font-sans text-[0.6875rem] leading-tight font-semibold text-[var(--app-muted)] uppercase">
                    {p.date}
                  </span>
                )}
                <span className={`${chevronClassName} self-center`} aria-hidden="true" />
                <h3
                  className="m-0 w-48 shrink-0 self-center truncate font-heading text-xl font-bold leading-tight text-[var(--app-text)]"
                  title={p.name}
                >
                  {p.name}
                </h3>
                {p.location && (
                  <>
                    <span className="self-stretch border-l border-l-[var(--app-border)]" aria-hidden="true" />
                    <span className="self-center text-[1.05rem] font-bold">{p.location}</span>
                  </>
                )}
              </span>
            </>
          ),
          extra: p.href ? (
            <Button
              href={p.href}
              variant="action"
              icon="view/forward.svg"
              iconPosition="end"
              className="self-center mr-4"
              onClick={(event) => {
                if (handleActionModeClick(p.id)) {
                  event.preventDefault();
                }
                event.stopPropagation();
              }}
            >
              View
            </Button>
          ) : undefined,
          content: p.content,
        }))}
      />
      <span
        // --app-text (not --app-card-action-icon): that token is a fixed
        // white, meant for icons sitting on top of a photo (UserCard) - this
        // card has no photo, just the flat surface color, so a hardcoded
        // white icon is invisible in light mode. --app-text already flips
        // dark/light with the theme, so it reliably contrasts either way.
        className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center text-[var(--app-text)] opacity-0"
        data-thursday-action-overlay
        aria-hidden="true"
      >
        <span className="h-7 w-7 origin-center scale-100">
          <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d={
                activeMode === ACTION_MODES.deleteThursdays
                  ? "M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                  : "M5 19H6.425L16.2 9.225L14.775 7.8L5 17.575V19ZM3 21V16.75L16.2 3.575C16.4 3.39167 16.6208 3.25 16.8625 3.15C17.1042 3.05 17.3583 3 17.625 3C17.8917 3 18.15 3.05 18.4 3.15C18.65 3.25 18.8667 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.7708 5.4 20.8625 5.65C20.9542 5.9 21 6.15 21 6.4C21 6.66667 20.9542 6.92083 20.8625 7.1625C20.7708 7.40417 20.625 7.625 20.425 7.825L7.25 21H3ZM15.475 8.525L14.775 7.8L16.2 9.225L15.475 8.525Z"
              }
              fill="currentColor"
            />
          </svg>
        </span>
      </span>
    </div>
  );
}
