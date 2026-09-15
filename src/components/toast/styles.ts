// Fixed stack of toasts, centered along the top edge - z-[400], above ModalPopup's z-[300] and the nav rail's z-[200], so a toast is always the topmost thing on screen.
export const toastViewportClassName =
	"pointer-events-none fixed top-4 left-1/2 z-[400] flex w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 flex-col items-center gap-2 print:hidden";

// Each toast: pointer-events restored over the (otherwise click-through) viewport above.
// items-center!/py-3! override Alert's own items-start/py-2. [&_button]: makes the close button (h-4 w-4, opacity-70 at rest) bigger and fully opaque.
export const toastItemClassName =
	"pointer-events-auto w-full items-center! py-3! [&_button]:h-6 [&_button]:w-6 [&_button]:opacity-100";

export const toastItemEnterClassName = "animate-[toast-in_200ms_ease-out]";
export const toastItemLeaveClassName = "animate-[toast-out_200ms_ease-in_forwards]";
