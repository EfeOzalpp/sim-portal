"use client";

// React & Next.js
import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

// Components
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { Collapse } from "@/components/collapse";
import { useOptionalActionMode } from "@/components/layout/ActionMode";
import { ThursdayCheckbox, useSelectedThursdays } from "@/app/thursdays/composition/selection/SelectedThursdaysProvider";
import ThursdayProducerAvatarStack, { type ThursdayProducerPreview } from "@/app/thursdays/composition/ThursdayProducerAvatarStack";
import { MaskIcon } from "@/theme/MaskIcon";

// Helpers
import { ACTION_MODES } from "@/constants/action-modes";
import { THURSDAY_MODAL_PARAMS, type ThursdayModalParam } from "@/constants/modal-params";
import StringLabel from "@/components/primitives/StringLabel";
import ThursdayDateIndicator from "@/app/thursdays/composition/ThursdayDateIndicator";
import styles from "./ProductionsCollapse.module.css";

const chevronClassName =
  "h-5 w-5 flex-none bg-[var(--input-icon)] transition-[background,transform] duration-250 [mask-image:url(./assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] group-hover:bg-[var(--app-text)] group-focus-within:bg-[var(--app-text)] [[data-state=open]_&]:rotate-180";

interface ProductionItem {
  id: string;
  name: string;
  href?: string;
  location?: string;
  date?: string;
  calendarDate?: string;
  productionCount?: number;
  presentationCount?: number;
  producerCount?: number;
  producerPreviews?: ThursdayProducerPreview[];
  isEmpty?: boolean;
  canEdit?: boolean;
  content: ReactNode;
}

interface ProductionsCollapseProps {
  productions: ProductionItem[];
  isFirst?: boolean;
  isLast?: boolean;
}

function DateLabel({ date, className }: { date: string; className?: string }) {
  return (
    <StringLabel colorKey={date.split(" ", 1)[0]} className={className}>
      {date}
    </StringLabel>
  );
}

function MetaSummary({ productionCount = 0, presentationCount = 0, producerCount = 0, producerPreviews }: Pick<ProductionItem, "productionCount" | "presentationCount" | "producerCount" | "producerPreviews">) {
  return (
    <span className={clsx("ui-small hidden min-w-0 flex-shrink flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[var(--subtle-text)] min-[769px]:inline-flex", styles.metaSummary)}>
      <span className="inline-flex flex-none items-center gap-3 whitespace-nowrap">
        <span>{productionCount} prod.</span>
        <span>{presentationCount} pres.</span>
      </span>
      <ThursdayProducerAvatarStack producerCount={producerCount} producerPreviews={producerPreviews} />
    </span>
  );
}

function getEditHref(thursdayId: string) {
  return `/thursdays?${THURSDAY_MODAL_PARAMS.edit}=${thursdayId}`;
}

export default function ProductionsCollapse({ productions, isFirst, isLast }: ProductionsCollapseProps) {
  const { activeMode } = useOptionalActionMode();
  const { selectedThursdayIds, setSelectedThursdayIds } = useSelectedThursdays();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openValues, setOpenValues] = useState<string[]>([]);
  const hasOpenItem = openValues.length > 0;

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
      className={clsx("group relative mx-auto w-[90%] transition-colors duration-150", styles.root)}
      style={{ backgroundColor: hasOpenItem ? "var(--page-card-hover)" : undefined }}
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
          "overflow-hidden rounded-none border-0 border-b border-solid bg-transparent text-[var(--app-text)] transition-[background,border-color] duration-150",
          hasOpenItem
            ? "border-b-[var(--card-border-hover)]"
            : "border-b-[var(--card-border)] hover:border-b-[var(--card-border-hover)] hover:bg-[var(--page-card-hover)]",
        )}
        items={productions.map((p, pIndex) => ({
          value: p.id,
          itemClassName: clsx(
            pIndex > 0 && "border-t border-t-[var(--card-border)]",
            "transition-colors duration-150",
          ),
          headerClassName: clsx("group items-center text-[var(--app-text)] transition-[background] duration-150 [[data-state=open]>&]:border-b [[data-state=open]>&]:border-b-[var(--modal-separator)]", styles.header),
          triggerClassName: clsx("px-5 py-4", styles.trigger),
          contentClassName: clsx("px-5 pt-3 pb-4 text-[var(--app-text)]", styles.content),
          extra: (
            <>
              <span className={clsx("order-first flex w-12 flex-none items-center justify-center self-stretch pl-4", styles.checkbox)}>
                <ThursdayCheckbox
                  checked={selectedThursdayIds.has(p.id)}
                  ariaLabel={`Select ${p.name}`}
                  onChange={() => toggleThursday(p.id)}
                />
              </span>
              <span className={clsx("flex flex-none items-center gap-3 self-stretch pr-4", styles.summary)}>
                {p.calendarDate && <span className="hidden min-[769px]:contents"><ThursdayDateIndicator date={p.calendarDate} /></span>}
                {p.isEmpty ? (
                  <>
                    <span className="ui-note text-[var(--content-muted)]">Empty</span>
                    {p.canEdit && (
                      <>
                        <Button surface="page" href={getEditHref(p.id)} variant="action" className="min-h-9 whitespace-nowrap max-[768px]:hidden">
                          <MaskIcon icon="edit/edit.svg" className={actionButtonIconClassName} />
                          Edit
                        </Button>
                        <Button surface="page" href={getEditHref(p.id)} variant="tool" icon="edit/edit.svg" aria-label={`Edit ${p.name}`} className="min-[769px]:hidden" />
                      </>
                    )}
                  </>
                ) : (
                  <MetaSummary
                    productionCount={p.productionCount}
                    presentationCount={p.presentationCount}
                    producerCount={p.producerCount}
                    producerPreviews={p.producerPreviews}
                  />
                )}
              </span>
            </>
          ),
          trigger: (
            <>
              <span className="flex min-w-0 flex-1 items-center gap-3 min-[769px]:hidden">
                <span className={chevronClassName} aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="flex min-w-0 items-center justify-between gap-2">
                    {p.date && <DateLabel date={p.date} />}
                    {p.calendarDate && <ThursdayDateIndicator date={p.calendarDate} />}
                  </span>
                  <h3
                    className="m-0 w-full break-words text-[var(--app-text)]"
                    title={p.name}
                  >
                    {p.name}
                  </h3>
                  {p.location && (
                    <span className="is-body truncate">{p.location}</span>
                  )}
                </span>
              </span>
              <span className="hidden min-w-0 flex-1 items-stretch gap-[0.85rem] self-stretch min-[769px]:inline-flex">
                <span className={`${chevronClassName} self-center`} aria-hidden="true" />
                <span className="w-16 shrink-0 self-center">
                  {p.date && <DateLabel date={p.date} />}
                </span>
                <h3
                  className="m-0 min-w-0 flex-1 self-center truncate text-[var(--app-text)]"
                  title={p.name}
                >
                  {p.name}
                </h3>
                {p.location && (
                  <>
                    <span className="self-stretch border-l border-l-[var(--card-border)]" aria-hidden="true" />
                    <span className="is-body self-center">{p.location}</span>
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
        <span className="h-7 w-7 origin-center scale-100" />
      </span>
    </div>
  );
}
