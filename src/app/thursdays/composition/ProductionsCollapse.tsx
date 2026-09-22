"use client";

// React & Next.js
import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

// Components
import { Collapse } from "@/components/collapse";
import { useActionMode } from "@/components/layout/ActionMode";
import { ThursdayCheckbox, useSelectedThursdays } from "@/app/thursdays/composition/SelectedThursdaysProvider";

// Helpers
import { ACTION_MODES } from "@/constants/action-modes";
import { THURSDAY_MODAL_PARAMS, type ThursdayModalParam } from "@/constants/modal-params";
import { getLabelColors } from "@/constants/labelColors";

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
  isFirst?: boolean;
  isLast?: boolean;
}

function DateLabel({ date, className }: { date: string; className?: string }) {
  const colors = getLabelColors(date);

  return (
    <span
      className={clsx("ui-label m-0 block w-fit rounded-md px-2 py-1 font-sans text-xs leading-tight font-semibold uppercase", className)}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {date}
    </span>
  );
}

export default function ProductionsCollapse({ productions, isFirst, isLast }: ProductionsCollapseProps) {
  const { activeMode } = useActionMode();
  const { selectedThursdayIds, setSelectedThursdayIds } = useSelectedThursdays();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openValues, setOpenValues] = useState<string[]>([]);

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

  function toggleThursday(thursdayId: string) {
    const next = new Set(selectedThursdayIds);

    if (next.has(thursdayId)) {
      next.delete(thursdayId);
    } else {
      next.add(thursdayId);
    }

    setSelectedThursdayIds(next);
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
        value={openValues}
        onValueChange={setOpenValues}
        className={clsx(
          "overflow-hidden rounded-xl bg-[var(--elevated-surface)] text-[var(--app-text)]",
        )}
        items={productions.map((p, pIndex) => ({
          value: p.id,
          itemClassName: pIndex > 0 ? "border-t border-t-[var(--card-border)]" : "",
          headerClassName: clsx(
            "group items-center text-[var(--app-text)] transition-[background] duration-150",
            // --elevated-surface(-hover), not --app-gray-surface(-hover) - these
            // rows are page content, not a modal; --app-gray-surface is scoped to
            // modals/the expanded nav rail, and --elevated-surface is already
            // this same collapse's own open-state background two lines up.
            "hover:bg-[var(--elevated-surface-hover)]",
            // border-b alone (not the all-sides border-solid/border-[color]
            // utilities) - those set the border-style/border-color shorthand
            // on every side, which turns on the browser's default ~3px
            // border-width for the sides that were never explicitly zeroed.
            "[[data-state=open]_&]:border-b [[data-state=open]_&]:border-b-[var(--modal-border)]",
          ),
          triggerClassName: "px-4 py-5",
          contentClassName: "px-4 pt-3 pb-4 text-[var(--app-text)]",
          extra: (
            <span className="order-first flex w-10 flex-none items-center justify-center self-stretch pl-4">
              <ThursdayCheckbox
                checked={selectedThursdayIds.has(p.id)}
                ariaLabel={`Select ${p.name}`}
                onChange={() => toggleThursday(p.id)}
              />
            </span>
          ),
          trigger: (
            <>
              <span className="flex min-w-0 flex-1 items-center gap-3 min-[769px]:hidden">
                <span className={chevronClassName} aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  {p.date && <DateLabel date={p.date} />}
                  <h3
                    className="m-0 w-full truncate text-[var(--app-text)]"
                    title={p.name}
                  >
                    {p.name}
                  </h3>
                  {p.location && (
                    <span className="truncate text-[1.05rem] font-bold">{p.location}</span>
                  )}
                </span>
              </span>
              <span className="hidden min-w-0 flex-1 items-stretch gap-[0.85rem] self-stretch min-[769px]:inline-flex">
                {p.date && (
                  <DateLabel date={p.date} className="min-w-[5.5rem] shrink-0 self-center text-center" />
                )}
                <span className={`${chevronClassName} self-center`} aria-hidden="true" />
                <h3
                  className="m-0 min-w-0 flex-1 self-center truncate text-[var(--app-text)]"
                  title={p.name}
                >
                  {p.name}
                </h3>
                {p.location && (
                  <>
                    <span className="self-stretch border-l border-l-[var(--card-border)]" aria-hidden="true" />
                    <span className="self-center text-[1.05rem] font-bold">{p.location}</span>
                  </>
                )}
              </span>
            </>
          ),
          content: p.content,
        }))}
      />
      <span
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
