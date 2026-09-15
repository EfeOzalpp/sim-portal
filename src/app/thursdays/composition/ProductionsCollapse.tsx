"use client";

// React & Next.js
import { useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

// Components
import { Collapse } from "@/components/collapse";
import { useActionMode } from "@/components/layout/ActionMode";
import { MaskIcon } from "@/theme/MaskIcon";

// Helpers
import { ACTION_MODES } from "@/constants/action-modes";
import { THURSDAY_MODAL_PARAMS, type ThursdayModalParam } from "@/constants/modal-params";

const chevronClassName =
  "h-5 w-5 flex-none bg-[var(--input-icon)] transition-transform duration-250 [mask-image:url(../assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [[data-state=open]_&]:rotate-180";

// Same convention as RoleFilterPopover's trigger button.
const printButtonClassName =
  "m-0 inline-grid h-9 w-9 flex-none cursor-pointer place-items-center self-center rounded-xl border border-solid border-[var(--input-border)] bg-[var(--btn-default-bg)] p-0 text-[var(--input-icon)] hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]";

// Marks every sibling along target's ancestor chain (up to <body>) with
// data-print-hidden, so @media print's [data-print-hidden] rule (tailwind.css)
// leaves only target's own subtree in the printed output - then clears those
// marks again once print() returns.
function printOnlyElement(target: HTMLElement) {
  const marked: HTMLElement[] = [];
  let node: HTMLElement | null = target;

  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (parent) {
      Array.from(parent.children).forEach((sibling) => {
        if (sibling !== node && sibling instanceof HTMLElement) {
          sibling.setAttribute("data-print-hidden", "true");
          marked.push(sibling);
        }
      });
    }
    node = parent;
  }

  window.print();
  marked.forEach((el) => el.removeAttribute("data-print-hidden"));
}

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
  checker?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function ProductionsCollapse({ productions, checker, isFirst, isLast }: ProductionsCollapseProps) {
  const { activeMode } = useActionMode();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contentRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
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

  // Force the item open (if it isn't already) so its content actually exists
  // to print, isolate just the productions inside it (not the trigger row's
  // date/name/location) via printOnlyElement, then put the open state back.
  async function handlePrintClick(productionId: string) {
    const wasOpen = openValues.includes(productionId);

    if (!wasOpen) {
      setOpenValues((current) => [...current, productionId]);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }

    const contentEl = contentRefs.current.get(productionId);
    if (contentEl) {
      printOnlyElement(contentEl);
    } else {
      window.print();
    }

    if (!wasOpen) {
      setOpenValues((current) => current.filter((value) => value !== productionId));
    }
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
          "overflow-hidden text-[var(--app-text)]",
          "[&:has([data-state=open])]:rounded-xl [&:has([data-state=open])]:border [&:has([data-state=open])]:border-solid [&:has([data-state=open])]:border-[var(--card-border)]",
          !isFirst && "[&:has([data-state=open])]:mt-2",
          !isLast && "[&:has([data-state=open])]:mb-2",
          isFirst && "[&:not(:has([data-state=open]))]:rounded-t-xl",
          isLast && "[&:not(:has([data-state=open]))]:rounded-b-xl",
          checker ? "bg-[var(--checker-bg)]" : "bg-[var(--checker-bg-2)]",
        )}
        items={productions.map((p, pIndex) => ({
          value: p.id,
          itemClassName: pIndex > 0 ? "border-t border-t-[var(--card-border)]" : "",
          headerClassName: clsx(
            "items-center text-[var(--app-text)] transition-[background] duration-150",
            checker ? "hover:bg-[var(--checker-bg-hover)]" : "hover:bg-[var(--checker-bg-hover-2)]",
          ),
          triggerClassName: "px-4 py-5",
          contentClassName: "px-4 pt-3 pb-4 text-[var(--app-text)]",
          trigger: (
            <>
              <span className="flex min-w-0 flex-1 items-center gap-3 min-[769px]:hidden">
                <span className={chevronClassName} aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  {p.date && <span className="ui-label m-0 block w-fit">{p.date}</span>}
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
              <span className="hidden items-stretch gap-[0.85rem] self-stretch min-[769px]:inline-flex">
                {p.date && (
                  <span className="ui-label m-0 min-w-[5.5rem] shrink-0 self-center text-center">{p.date}</span>
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
                    <span className="self-stretch border-l border-l-[var(--card-border)]" aria-hidden="true" />
                    <span className="self-center text-[1.05rem] font-bold">{p.location}</span>
                  </>
                )}
              </span>
            </>
          ),
          extra: (
            <button
              type="button"
              className={clsx(printButtonClassName, "mr-4")}
              aria-label="Print"
              onClick={(event) => {
                event.stopPropagation();
                handlePrintClick(p.id);
              }}
            >
              <MaskIcon icon="download/download.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
            </button>
          ),
          content: (
            <div ref={(el) => { contentRefs.current.set(p.id, el); }}>
              {p.content}
            </div>
          ),
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
