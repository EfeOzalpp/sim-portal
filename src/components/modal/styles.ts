export const modalBackdropClassName =
	"fixed inset-0 z-[1000] grid box-border place-items-center overflow-auto bg-[var(--scrim)] p-[var(--spacing-lg)] overscroll-contain max-[768px]:items-end max-[768px]:p-0";

export const modalDialogClassName = [
	"box-border flex max-h-[calc(100dvh-(var(--spacing-lg)*2))] flex-col overflow-hidden rounded-[var(--border-lg)] border-solid border-[var(--app-border)]",
	"bg-[var(--app-surface)] text-[var(--app-text)] [border-width:var(--app-border-width)]",
	"max-[768px]:max-h-dvh max-[768px]:w-full max-[768px]:animate-[modal-slide-up_300ms_cubic-bezier(0.32,0.72,0,1)] max-[768px]:rounded-none max-[768px]:border-x-0 max-[768px]:border-b-0",
].join(" ");

export const modalDialogDefaultWidthClassName = "w-[min(52rem,100%)]";

export const modalHeaderButtonClassName = [
	"m-0 flex w-full cursor-pointer items-center justify-between gap-[var(--gap-md)] rounded-t-[var(--border-lg)] border-0",
	"border-b-[length:var(--app-border-width)] border-solid border-[var(--app-border)] bg-transparent p-[var(--spacing-md)]",
	"text-left text-[var(--app-text)] hover:bg-[var(--nav-button-bg-hover)] max-[768px]:rounded-none",
].join(" ");

export const modalTitleClassName =
	"min-w-0 font-[family-name:var(--font-family-heading)] text-[length:var(--font-size-h3)] leading-[var(--line-height-tight)] font-[var(--font-weight-bold)]";

export const modalCloseIconClassName =
	"h-[var(--svg-size-md)] w-[var(--svg-size-md)] flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

export const modalBodyClassName = "input-theme-surface min-h-0 overflow-auto p-[var(--spacing-md)] max-[768px]:flex-1";
