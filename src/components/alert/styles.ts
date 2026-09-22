import { cva } from "class-variance-authority";

// The alert's outer container; `tone` picks its border/background/text color.
export const alertVariants = cva(
	[
		"alert flex items-start gap-2 rounded-xl border-solid",
		// pr-3, not pl-4's own value - the close button's own -m-1 already pulls
		// it inward a bit, so matching pl-4 on the right left it sitting too far
		// in from the edge.
		"border pl-4 pr-3 py-2",
	],
	{
		variants: {
			tone: {
				success: "border-transparent bg-[var(--tone-success-bg)] text-[var(--tone-success-text)]",
				danger: "border-transparent bg-[var(--tone-danger-bg)] text-[var(--tone-danger-text)]",
				warning: "border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] text-[var(--tone-warning-text)]",
				// Plain status/info messaging - not a success/danger/warning outcome.
				neutral: "border-transparent bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-text)]",
			},
		},
		defaultVariants: { tone: "danger" },
	},
);

// The leading status icon, shown when `showIcon` is set. grid/place-items-center
// isn't just for centering - it's what makes the icon's own h-full/w-full
// actually apply: a plain <span> child of a non-flex/grid parent stays
// display:inline, and inline elements ignore explicit height/width entirely.
export const alertIconClassName = "grid h-[1.375rem] w-[1.375rem] flex-none place-items-center";

// The message text itself.
export const alertDescriptionClassName = "is-body min-w-0 flex-1";

// The dismiss ("x") button, shown when `closable` is set. No h-*/w-* here on
// purpose - this app has no Tailwind Preflight, so Antd's own reset sets
// box-sizing: border-box globally, and a fixed h-4 w-4 alongside p-2 would
// eat directly into that same 16px (leaving only 0px for the icon). The
// actual h-4 w-4 lives one level in, on the icon's own wrapper (index.tsx),
// so this button's real size is emergent (icon + padding), matching
// inputFilterTriggerClassName's own p-2 pattern - it still grows the real
// hover box (and its bg) without nudging the row's own layout, borderless
// like that one too. -mr-2/-my-2 cancel the right/vertical growth exactly
// (flush with the alert's own edge, no extra row height), but -ml-1 (not
// -ml-2) leaves a small real gap from the description text instead of
// canceling the row's own gap-2 completely there. --tones-close-hover is
// shared across every tone (not tone-specific), same as the icon's own
// color already just following text-current.
export const alertCloseButtonClassName = [
	"inline-grid flex-none cursor-pointer place-items-center rounded-md p-2 -mr-2 -my-2 -ml-1",
	"border-none bg-transparent text-current opacity-70 hover:opacity-100 hover:bg-[var(--tones-close-hover)]",
].join(" ");
