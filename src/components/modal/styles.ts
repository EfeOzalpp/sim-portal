export const modalBackdropClassName =
	"fixed inset-0 z-[1000] grid box-border place-items-center overflow-auto bg-[var(--scrim)] p-6 overscroll-contain max-[768px]:items-end max-[768px]:p-0";

export const modalDialogClassName = [
	"box-border flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-2xl border-solid border-[var(--app-border)]",
	"bg-[var(--app-surface)] text-[var(--app-text)] border",
	"max-[768px]:max-h-dvh max-[768px]:w-full max-[768px]:animate-[modal-slide-up_300ms_cubic-bezier(0.32,0.72,0,1)] max-[768px]:rounded-none max-[768px]:border-x-0 max-[768px]:border-b-0",
].join(" ");

export const modalDialogDefaultWidthClassName = "w-[min(52rem,100%)]";

export const modalHeaderButtonClassName = [
	"m-0 flex w-full cursor-pointer items-center justify-between gap-4 rounded-t-2xl border-0",
	"border-b border-solid border-[var(--app-border)] bg-transparent p-4",
	"text-left text-[var(--app-text)] hover:bg-[var(--nav-button-bg-hover)] max-[768px]:rounded-none",
].join(" ");

export const modalTitleClassName =
	"min-w-0 font-heading text-xl leading-tight font-bold";

export const modalCloseIconClassName =
	"h-[1.375rem] w-[1.375rem] flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

export const modalBodyClassName = "input-theme-surface min-h-0 overflow-auto p-4 max-[768px]:flex-1";
