// z-[300]: above ActionMode (<= 270) and the nav rail (z-[200]) - an open modal always wins. A Select inside needs selectContentInModalClassName's even-higher tier.
export const modalBackdropClassName =
	"fixed inset-0 z-[300] grid box-border place-items-center overflow-auto bg-[var(--scrim)] p-6 overscroll-contain max-[768px]:items-end max-[768px]:p-0";

// The dialog box, centered by modalBackdropClassName's grid. bg-[var(--app-gray-surface)], not --app-surface - modals get their own neutral gray.
export const modalDialogClassName = [
	"relative box-border flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-[0.5rem] border-solid border-[var(--modal-border)]",
	"bg-[var(--app-gray-surface)] text-[var(--app-text)] border",
	"max-[768px]:max-h-dvh max-[768px]:w-full max-[768px]:animate-[modal-slide-up_300ms_cubic-bezier(0.32,0.72,0,1)] max-[768px]:rounded-none max-[768px]:border-x-0 max-[768px]:border-b-0",
].join(" ");

// Default dialog width when a call site doesn't supply its own dialogClassName width.
export const modalDialogDefaultWidthClassName = "w-[min(52rem,100%)]";

// The title bar - a plain row now, not a button; only modalCloseButtonClassName actually closes the modal.
export const modalHeaderClassName = [
	"m-0 flex w-full items-center justify-between gap-4 rounded-t-[0.5rem]",
	"border-b border-b-[var(--modal-border)] bg-transparent py-5 pr-4 pl-6",
	"text-left text-[var(--app-text)] max-[768px]:rounded-none",
].join(" ");

// The title text inside modalHeaderClassName.
export const modalTitleClassName =
	"min-w-0 font-heading text-xl leading-tight font-bold tracking-[1px]";

// The actual close button - the only clickable part of the header now.
export const modalCloseButtonClassName =
	"m-0 inline-grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-[var(--app-text)] hover:bg-[var(--modal-button-bg-hover)]";

// The "x" icon inside modalCloseButtonClassName.
export const modalCloseIconClassName =
	"h-[1.375rem] w-[1.375rem] flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// The scrollable content area below the header. flex-1 (not just max-[768px])
// so it actually fills a dialog that's been given a fixed height (see
// dialogClassName usages with an explicit h-*) instead of leaving dead space
// below shorter content - a no-op for the common auto-height dialogs, since
// flex-basis:0 still respects a flex item's own min-content floor.
export const modalBodyClassName = "input-theme-surface min-h-0 flex-1 overflow-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

// Dims the dialog (not just the backdrop behind it) once a backdrop click is caught with unsaved changes pending -
// a gradient rather than a flat scrim, so it reads as the action row's own footer fading up into the content
// above it rather than a hard-edged box dropped on top.
export const modalCloseGuardOverlayClassName =
	"absolute inset-0 z-10 flex items-end justify-center rounded-[0.5rem] bg-[linear-gradient(to_top,var(--app-gray-surface)_120px,transparent_340px)] p-6";

// The "keep editing / save changes / exit view" row itself.
export const modalCloseGuardActionsClassName = "flex flex-wrap items-center justify-center gap-2";
