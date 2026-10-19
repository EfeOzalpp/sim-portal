export const POPOVER_DISMISS_EVENT = "sim:popover-dismiss";

export function dismissPopovers() {
	window.dispatchEvent(new Event(POPOVER_DISMISS_EVENT));
}
