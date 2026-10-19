export const fieldStackClassName = "flex min-w-0 flex-col gap-2";

export const fieldLabelClassName = "ui-label m-0 block min-h-5 pl-1";

export const sectionHeaderClassName =
	"mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2";

// flex-wrap: lets an overcrowded row (e.g. Producers & Faculty's semester
// filter + Select all + Unselect all) drop items to their own line instead
// of squeezing them until their own text wraps mid-word.
export const inlineActionsClassName = "flex flex-wrap items-center gap-2";

// [data-state=open]>& is Radix Accordion.Item's own open-state attribute —
// both PresentationsField and ProductionsSection (the two Collapse consumers
// in this domain) render through Radix now, so this only needs the one
// selector.
export const productionHeaderClassName =
	"min-h-[3.75rem] items-stretch! rounded-none bg-transparent text-[var(--app-text)]! [[data-state=open]>&]:border-b [[data-state=open]>&]:border-b-[var(--modal-separator)]";

export const presentationHeaderClassName = productionHeaderClassName;

// Merged onto the trigger <button> itself (via Collapse's triggerClassName),
// not the header classes above - the header row uses items-stretch, so
// padding put on the row sits outside the button's own clickable box.
export const collapseTriggerPaddingClassName = "px-4! py-2!";

export const productionBodyClassName = "px-4! pt-4! pb-4! text-[var(--app-text)]!";

export const presentationBodyClassName = "px-4! pt-4! pb-4! text-[var(--app-text)]!";

// Same mask-icon chevron convention used everywhere else (ProductionsCollapse,
// Select, input icons) - h-5 w-5, bg-[var(--input-icon)], rotates via the
// trigger's own Radix data-state.
export const collapseIconClassName =
	"h-5 w-5 flex-none bg-[var(--input-icon)] transition-[background,transform] duration-200 [mask-image:url(./assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] group-hover:bg-[var(--app-text)] group-focus-within:bg-[var(--app-text)] [[data-state=open]_&]:rotate-180";

export const productionItemClassName =
	"overflow-hidden rounded-none border-0 border-b-2 border-solid border-b-[var(--modal-surface-2-border)] bg-transparent transition-colors duration-150 hover:bg-[var(--modal-surface-2)] data-[state=open]:bg-[var(--modal-surface-2)]";

export const presentationItemClassName =
	"overflow-hidden rounded-none border-0 border-b-2 border-solid border-b-[var(--modal-surface-3-border)] bg-transparent transition-colors duration-150 hover:bg-[var(--modal-surface-3)] data-[state=open]:bg-[var(--modal-surface-3)]";

export const collapseLabelClassName =
	"inline-flex min-w-0 items-center gap-2 text-[var(--app-text)]";

// Can't be a real heading tag - it renders inside the Collapse trigger's
// <button>, which HTML doesn't allow heading content inside. Kept as an
// explicit override for that reason (same exception as the Select "title"
// variant in select/styles.ts).
export const collapseTitleTextClassName =
	"min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-heading text-base font-semibold leading-tight text-[var(--app-text)]";

export const presentationTitleTextClassName =
	"min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base leading-tight text-[var(--app-text)]";

export const deleteIconButtonClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-[var(--app-text)] hover:bg-[var(--modal-surface-hover)]";

export const deleteIconClassName = "h-5 w-5 bg-[var(--action-delete-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// Add stays neutral (unlike delete, which stays semantic-red even at rest) -
// matching RepeatableInput's own add/delete row buttons and AddSemesterCard's
// plain "new item" affordance elsewhere. Nothing here treats "add" as a green action.
export const addIconButtonClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-[var(--app-text)] hover:bg-[var(--modal-surface-hover)]";

export const addIconClassName = "h-5 w-5 bg-[var(--button-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";
