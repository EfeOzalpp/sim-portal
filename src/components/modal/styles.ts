// z-[300]: above ActionMode's entire tier (backdrop/active-button/highlighted
// cards, all <= 270, ActionMode.module.css) and above the nav rail (z-[200],
// layout.tsx) - an open modal always wins over both. A select rendered
// inside this modal needs the even-higher selectContentInModalClassName tier
// (components/select/styles.ts) to stay usable. The dialog itself needs no
// separate z-index: it's a plain child of this element, so it already paints
// above this same backdrop just by being later in the same stacking context.
export const modalBackdropClassName =
	"fixed inset-0 z-[300] grid box-border place-items-center overflow-auto bg-[var(--scrim)] p-6 overscroll-contain max-[768px]:items-end max-[768px]:p-0";

// The dialog box itself, centered by modalBackdropClassName's grid.
export const modalDialogClassName = [
	"box-border flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-2xl border-solid border-[var(--app-border)]",
	"bg-[var(--app-surface)] text-[var(--app-text)] border",
	"max-[768px]:max-h-dvh max-[768px]:w-full max-[768px]:animate-[modal-slide-up_300ms_cubic-bezier(0.32,0.72,0,1)] max-[768px]:rounded-none max-[768px]:border-x-0 max-[768px]:border-b-0",
].join(" ");

// Default dialog width when a call site doesn't supply its own dialogClassName width.
export const modalDialogDefaultWidthClassName = "w-[min(52rem,100%)]";

// The dialog's title bar, which doubles as a full-width close button.
export const modalHeaderButtonClassName = [
	"m-0 flex w-full cursor-pointer items-center justify-between gap-4 rounded-t-2xl border-0",
	"border-b border-b-[var(--app-border)] bg-transparent p-4",
	"text-left text-[var(--app-text)] hover:bg-[var(--nav-button-bg-hover)] max-[768px]:rounded-none",
].join(" ");

// The title text inside modalHeaderButtonClassName.
export const modalTitleClassName =
	"min-w-0 font-heading text-xl leading-tight font-bold";

// The "x" icon inside modalHeaderButtonClassName.
export const modalCloseIconClassName =
	"h-[1.375rem] w-[1.375rem] flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// The scrollable content area below the header.
export const modalBodyClassName = "input-theme-surface min-h-0 overflow-auto p-4 max-[768px]:flex-1";
