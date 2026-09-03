export const fieldStackClassName = "flex min-w-0 flex-col gap-2";

export const sectionHeaderClassName =
	"mb-2 flex items-end justify-between gap-4";

export const inlineActionsClassName = "flex items-center gap-2";

// [data-state=open]>& is Radix Accordion.Item's own open-state attribute —
// both PresentationsField and ProductionsSection (the two Collapse consumers
// in this domain) render through Radix now, so this only needs the one
// selector. ProductionsCollapse (still antd, a separate file with its own
// local styling) doesn't use these constants at all.
export const collapseHeaderClassName =
	"min-h-[3.75rem] items-center! rounded-xl! bg-[var(--app-surface)]! py-2! text-[var(--app-text)]! transition-[background] duration-150 hover:bg-[var(--app-card-bg-hover)]! [[data-state=open]>&]:rounded-b-none! [[data-state=open]>&]:border-b [[data-state=open]>&]:border-b-[var(--app-border)]";

export const collapseBodyClassName = "bg-[var(--app-surface)]! text-[var(--app-text)]!";

export const collapseIconClassName =
	"inline-flex! h-9 items-center justify-center pe-2!";

export const collapseItemClassName =
	"overflow-hidden rounded-xl! border! border-solid! border-[var(--app-border)]! bg-[var(--app-surface)]!";

export const collapseLabelClassName =
	"inline-flex min-w-0 items-center gap-2 text-[var(--app-text)]";

export const collapseTitleTextClassName =
	"min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-heading text-base font-semibold leading-tight text-[var(--app-text)]";

export const collapseMetaClassName =
	"shrink-0 text-sm font-semibold leading-tight text-[var(--app-muted)]";

export const iconButtonClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-solid border-[var(--input-border)] bg-transparent p-0 text-[var(--input-icon)] hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]";
