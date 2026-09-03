"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Collapse } from "@/components/collapse";
import { useActionMode } from "@/components/layout/ActionMode";

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

  function openThursdayModal(thursdayId: string, modalParam: "editThursdayId" | "deleteThursdayId") {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("addThursday");
    params.delete("thursdayId");
    params.delete("editThursdayId");
    params.delete("deleteThursdayId");
    params.set(modalParam, thursdayId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleActionModeClick(thursdayId: string) {
    if (activeMode === "edit-thursdays") {
      openThursdayModal(thursdayId, "editThursdayId");
      return true;
    }

    if (activeMode === "delete-thursdays") {
      openThursdayModal(thursdayId, "deleteThursdayId");
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
        className="overflow-hidden rounded-xl border border-solid border-[var(--app-border)] bg-[var(--app-card-bg)] text-[var(--app-text)]"
        items={productions.map((p, pIndex) => ({
          value: p.id,
          itemClassName: pIndex > 0 ? "border-t border-solid border-[var(--app-border)]" : "",
          headerClassName: "items-center bg-[var(--app-card-bg)] text-[var(--app-text)] transition-[background] duration-150 hover:bg-[var(--app-card-bg-hover)]",
          contentClassName: "bg-[var(--app-card-bg)] text-[var(--app-text)]",
          // The title used to double as both the toggle trigger and a
          // navigation link when p.href was set (relying on stopPropagation
          // to keep the two from fighting). Radix's Trigger renders as a
          // real <button>, which an <a> can't legally nest inside — so the
          // title is now toggle-only, and navigation moved to a separate
          // link in `extra` below. A real, visible behavior change from the
          // antd version, not just a technical swap.
          trigger: (
            <span className="inline-flex items-center gap-[0.85rem]">
              <h3 className="m-0 font-heading text-xl font-bold leading-tight text-[var(--app-text)]">
                {p.name}
              </h3>
              {p.location && (
                <>
                  <span className="text-[1.05rem] font-normal text-[var(--app-muted)]">|</span>
                  <span className="text-[1.05rem] font-bold">{p.location}</span>
                </>
              )}
              <span
                className="flex items-center text-[var(--app-text)] transition-transform duration-250 [&_svg]:h-4 [&_svg]:w-4 [[data-state=open]_&]:rotate-180"
                aria-hidden="true"
              >
                <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          ),
          extra: (p.date || p.href) ? (
            <span className="flex items-center gap-[0.6rem] pr-4">
              {p.date && (
                <span className="inline-block whitespace-nowrap rounded-sm bg-[var(--app-border)] px-[0.8rem] py-[0.3rem] text-[0.8rem] font-bold text-[var(--app-text)]">
                  {p.date}
                </span>
              )}
              {p.href && (
                <Link
                  className="text-inherit! whitespace-nowrap no-underline hover:text-[var(--brand-color)]! hover:underline hover:underline-offset-[0.14em]"
                  href={p.href}
                  onClick={(event) => {
                    if (handleActionModeClick(p.id)) {
                      event.preventDefault();
                    }
                    event.stopPropagation();
                  }}
                >
                  View →
                </Link>
              )}
            </span>
          ) : undefined,
          content: p.content,
        }))}
      />
      <span
        className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-[var(--app-card-action-overlay)] text-[var(--app-card-action-icon)] opacity-0"
        data-thursday-action-overlay
        aria-hidden="true"
      >
        <span className="h-7 w-7 origin-center scale-100">
          <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d={
                activeMode === "delete-thursdays"
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
