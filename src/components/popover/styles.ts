// The popover content box - same visual language as the modal (border/bg
// tokens, rounded corners) but lighter-weight: no header/close button, sized
// to its own content instead of a fixed dialog width.
export const popoverContentClassName = [
	"popover-content z-[280] overflow-hidden rounded-2xl border-solid border-[var(--modal-border)]",
	"bg-[var(--app-gray-surface)] text-[var(--app-text)] border shadow-lg",
	"p-2",
].join(" ");
