// z-[300]: above ActionMode (<= 270) and the nav rail (z-[200]) - an open modal always wins. A Select inside needs selectContentInModalClassName's even-higher tier.
export const modalBackdropClassName =
	"fixed inset-0 z-[300] grid box-border place-items-center overflow-auto bg-[var(--scrim)] p-6 overscroll-contain max-[768px]:items-end max-[768px]:p-0";

// The dialog box, centered by modalBackdropClassName's grid. bg-[var(--modal-surface)], not --app-surface - modals get their own neutral gray.
export const modalDialogClassName = [
	"modal-surface relative box-border flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-[0.375rem]",
	"border border-solid border-[var(--modal-border)] bg-[var(--modal-surface)] text-[var(--app-text)] shadow-[var(--modal-shadow,none)]",
	"max-[768px]:max-h-dvh max-[768px]:w-full max-[768px]:animate-[modal-slide-up_300ms_cubic-bezier(0.32,0.72,0,1)] max-[768px]:rounded-none max-[768px]:border-x-0 max-[768px]:border-b-0",
].join(" ");

// Default dialog width when a call site doesn't supply its own dialogClassName width.
export const modalDialogDefaultWidthClassName = "w-[min(48rem,100%)]";

// The title bar - a plain row now, not a button; only modalCloseButtonClassName actually closes the modal.
export const modalHeaderClassName = [
	"m-0 flex w-full items-center justify-between gap-4 rounded-t-[0.375rem]",
	"relative z-[1] border-b border-b-[var(--modal-border)] bg-transparent py-5 pr-6 pl-8 max-[768px]:pr-4 max-[768px]:pl-5",
	"text-left text-[var(--app-text)] max-[768px]:rounded-none",
].join(" ");

export const modalHeaderMinimalClassName =
	"absolute top-3 right-3 z-10 m-0 flex items-center justify-end bg-transparent";

// The title text inside modalHeaderClassName.
export const modalTitleClassName = "m-0 min-w-0";

// The actual close button - the only clickable part of the header now.
export const modalCloseButtonClassName =
	"m-0 inline-grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-full border-0 bg-transparent text-[var(--app-text)] hover:bg-[var(--modal-tint-hover,var(--modal-surface-hover))]";

// The "x" icon inside modalCloseButtonClassName.
export const modalCloseIconClassName =
	"h-5 w-5 flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// The scrollable content area below the header. flex-1 (not just max-[768px])
// so it actually fills a dialog that's been given a fixed height (see
// dialogClassName usages with an explicit h-*) instead of leaving dead space
// below shorter content - a no-op for the common auto-height dialogs, since
// flex-basis:0 still respects a flex item's own min-content floor.
export const modalBodyClassName = "input-theme-surface min-h-0 flex-1 overflow-auto px-8 pt-4 pb-8 max-[768px]:px-5";

// Dims the dialog (not just the backdrop behind it) once a backdrop click is caught with unsaved changes pending -
// a gradient rather than a flat scrim, so it reads as the action row's own footer fading up into the content
// above it rather than a hard-edged box dropped on top.
export const modalCloseGuardOverlayClassName =
	"absolute inset-0 z-10 flex items-end justify-center rounded-[0.375rem] bg-[linear-gradient(to_top,var(--modal-surface)_120px,transparent_340px)] p-6";

// The "keep editing / save changes / exit view" row itself.
export const modalCloseGuardActionsClassName = "flex flex-wrap items-center justify-center gap-2";
