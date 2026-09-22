import { cva } from "class-variance-authority";

// Shared base classes for a plain <input>/<textarea>.
const fieldBase = [
	"input-field w-full min-w-0 rounded-lg bg-[var(--input-bg)] text-[var(--input-text)]",
	"border border-[var(--input-border)]",
	// min-h, not a fixed height - Select's own trigger has no explicit
	// height either (purely padding/line-height driven, same px-3/py-2.5/
	// text-base this has), so this is just a floor matching what that
	// naturally renders at - a <textarea> can still grow taller than it.
	"min-h-12 px-3 py-2.5",
	"font-sans text-base",
	"placeholder:text-[var(--input-placeholder)]",
	"transition",
	"hover:bg-[var(--input-bg-hover)]",
	"focus:border-[var(--input-border-hover)] focus:shadow-[var(--input-hover-shadow)]",
	// Blue, not green - Input never appears in the nav rail, so there's no nav-green case to preserve here.
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
	"disabled:cursor-not-allowed disabled:opacity-60",
];

// A standalone input/textarea with no prefix/suffix content; `status` swaps in the danger/warning-tone border.
export const inputFieldVariants = cva(fieldBase, {
	variants: {
		status: {
			error: "border-[var(--input-error-border)]",
			warning: "border-[var(--tone-warning-border)]",
			none: "",
		},
	},
	defaultVariants: { status: "none" },
});

// The wrapper around an input that has a prefix/suffix (e.g. a search icon), styled to read as one field; `status` swaps in the danger/warning-tone border.
export const inputWrapperVariants = cva(
	[
		"input-affix-wrapper inline-flex w-full min-w-0 items-center gap-2",
		"rounded-lg bg-[var(--input-bg)] text-[var(--input-text)]",
		"border border-[var(--input-border)]",
		"px-3 py-3",
		"transition",
		"hover:bg-[var(--input-bg-hover)]",
		"focus-within:border-[var(--input-border-hover)] focus-within:shadow-[var(--input-hover-shadow)]",
		"focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)]",
	],
	{
		variants: {
			status: {
				error: "border-[var(--input-error-border)]",
				warning: "border-[var(--tone-warning-border)]",
				none: "",
			},
		},
		defaultVariants: { status: "none" },
	},
);

// The actual <input> nested inside inputWrapperVariants - no border/background of its own, since the wrapper already provides those.
export const inputBareClassName = [
	"w-full min-w-0 flex-1 self-stretch border-none bg-transparent p-0 leading-none [font:inherit]",
	"text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)]",
	"disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

// The "clear" (x) button shown once a value is entered, in mode="clearable".
export const inputClearButtonClassName = [
	"inline-grid h-4 w-4 flex-none cursor-pointer appearance-none self-center place-items-center",
	"border-none bg-transparent p-0 leading-none text-[var(--input-icon)] hover:text-[var(--input-text)]",
].join(" ");

// Sizing/color only - pair with <MaskIcon> for the actual icon.
export const inputIconClassName = [
	"h-4 w-4 flex-none bg-[var(--input-icon)]",
	"[mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");

// mode="clearable" + loading - same slot the clear button would otherwise sit in.
export const inputSpinnerClassName = "flex h-4 w-4 flex-none items-center justify-center text-[var(--input-icon)]";

// The trigger for mode="filter" (e.g. a role-filter popover) - icon itself
// stays the same size as inputClearButtonClassName's, but p-2 grows the
// real box (and its real bg) around it. The matching -m-2 cancels that
// growth back out of the flex row's own size calculation (a negative margin
// shrinks the margin box exactly as much as the padding grew the border box),
// so this can have all the padding it wants with zero risk of nudging the
// input's own height.
export const inputFilterTriggerClassName = [
	"inline-grid flex-none cursor-pointer appearance-none self-center place-items-center rounded-md p-2 -m-2",
	"border-none bg-transparent leading-none text-[var(--page-input-search)]",
	"hover:bg-[var(--page-input-search-hover-bg)] hover:text-[var(--page-input-search-hover)]",
].join(" ");
