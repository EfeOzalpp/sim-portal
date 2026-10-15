// Fixed stack of toasts, centered along the top edge - z-[400], above ModalPopup's z-[300] and the nav rail's z-[200], so a toast is always the topmost thing on screen.
export const toastViewportClassName =
	"pointer-events-none fixed top-4 left-1/2 z-[400] flex w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 flex-col items-center gap-2 print:hidden";

// Each toast: pointer-events restored over the (otherwise click-through)
// viewport above. Match ScopePill's neutral Alert treatment: center the row
// and keep Alert's own py-2/close-button spacing math intact.
export const toastItemClassName =
	"pointer-events-auto w-full items-center! py-2! [&>*]:self-center!";

export const toastItemEnterClassName = "animate-[toast-in_200ms_ease-out]";
export const toastItemLeaveClassName = "animate-[toast-out_200ms_ease-in_forwards]";
