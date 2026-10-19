// The popover content box uses the same inverted dropdown token layer as Select
// dropdowns. Modal surfaces can still override those tokens before this renders.
export const popoverContentClassName = [
	"popover-content z-[280] overflow-hidden rounded-none",
	"bg-[var(--contrast-surface-bg)] text-[var(--contrast-surface-text)]",
	"[--label-text:var(--contrast-surface-label)]",
	"shadow-[0_16px_36px_rgba(0,0,0,0.22)]",
	"py-2",
].join(" ");
