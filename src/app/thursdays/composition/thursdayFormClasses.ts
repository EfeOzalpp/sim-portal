export const fieldStackClassName = "flex min-w-0 flex-col gap-2";

export const sectionHeaderClassName =
	"mb-2 flex items-end justify-between gap-4";

// flex-wrap: lets an overcrowded row (e.g. Producers & Faculty's semester
// filter + Select all + Unselect all) drop items to their own line instead
// of squeezing them until their own text wraps mid-word.
export const inlineActionsClassName = "flex flex-wrap items-center gap-2";

// [data-state=open]>& is Radix Accordion.Item's own open-state attribute —
// both PresentationsField and ProductionsSection (the two Collapse consumers
// in this domain) render through Radix now, so this only needs the one
// selector.
export const collapseHeaderClassName =
	"min-h-[3.75rem] items-stretch! rounded-xl! bg-[var(--app-surface)]! text-[var(--app-text)]! transition-[background] duration-150 hover:bg-[var(--app-card-bg-hover)]! [[data-state=open]>&]:rounded-b-none! [[data-state=open]>&]:border-b [[data-state=open]>&]:border-b-[var(--card-border)]";

// Merged onto the trigger <button> itself (via Collapse's triggerClassName),
// not collapseHeaderClassName above - the header row uses items-stretch, so
// padding put on the row sits outside the button's own clickable box.
export const collapseTriggerPaddingClassName = "px-4! py-2!";

export const collapseBodyClassName = "bg-[var(--app-surface)]! px-4! pt-5! pb-4! text-[var(--app-text)]!";

// Same mask-icon chevron convention used everywhere else (ProductionsCollapse,
// Select, input icons) - h-5 w-5, bg-[var(--input-icon)], rotates via the
// trigger's own Radix data-state.
export const collapseIconClassName =
	"h-5 w-5 flex-none bg-[var(--input-icon)] transition-transform duration-200 [mask-image:url(../assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [[data-state=open]_&]:rotate-180";

export const collapseItemClassName =
	"overflow-hidden rounded-xl! border! border-solid! border-[var(--card-border)]! bg-[var(--app-surface)]!";

export const collapseLabelClassName =
	"inline-flex min-w-0 items-center gap-2 text-[var(--app-text)]";

export const collapseTitleTextClassName =
	"min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-heading text-base font-semibold leading-tight text-[var(--app-text)]";

export const collapseMetaClassName =
	"shrink-0 text-sm font-semibold leading-tight text-[var(--app-label)]";

export const iconButtonClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-solid border-[var(--input-border)] bg-transparent p-0 text-[var(--input-icon)] hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]";
