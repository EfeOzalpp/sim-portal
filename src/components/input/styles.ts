import { cva } from "class-variance-authority";

// Shared base classes for a plain <input>/<textarea>.
const fieldBase = [
	"input-field w-full min-w-0 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)]",
	"border border-[var(--input-border)]",
	"px-2 py-[0.325rem]",
	"font-sans text-base",
	"placeholder:text-[var(--input-placeholder)]",
	"transition",
	"hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:shadow-[var(--input-hover-shadow)]",
	"focus:border-[var(--input-border-hover)] focus:shadow-[var(--input-hover-shadow)]",
	"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-theme)]",
	"disabled:cursor-not-allowed disabled:opacity-60",
];

// A standalone input/textarea with no prefix/suffix content; `error` swaps in the danger-tone border.
export const inputFieldVariants = cva(fieldBase, {
	variants: {
		error: {
			true: "border-[var(--input-error-border)]",
			false: "",
		},
	},
	defaultVariants: { error: false },
});

// The wrapper around an input that has a prefix/suffix (e.g. a search icon), styled to read as one field; `error` swaps in the danger-tone border.
export const inputWrapperVariants = cva(
	[
		"input-affix-wrapper inline-flex w-full min-w-0 items-center gap-2",
		"rounded-xl bg-[var(--input-bg)] text-[var(--input-text)]",
		"border border-[var(--input-border)]",
		"px-3 py-2",
		"transition",
		"hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:shadow-[var(--input-hover-shadow)]",
		"focus-within:border-[var(--input-border-hover)] focus-within:shadow-[var(--input-hover-shadow)]",
		"focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--app-theme)]",
	],
	{
		variants: {
			error: {
				true: "border-[var(--input-error-border)]",
				false: "",
			},
		},
		defaultVariants: { error: false },
	},
);

// The actual <input> nested inside inputWrapperVariants - no border/background of its own, since the wrapper already provides those.
export const inputBareClassName = [
	"w-full min-w-0 flex-1 border-none bg-transparent p-0 [font:inherit]",
	"text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)]",
	"disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

// The "clear" (x) button shown once a value is entered, when `allowClear` is set.
export const inputClearButtonClassName = [
	"inline-grid h-4 w-4 flex-none cursor-pointer place-items-center",
	"border-none bg-transparent p-0 text-[var(--input-icon)] hover:text-[var(--input-text)]",
].join(" ");

// Sizing/color only — pair with <MaskIcon> for the actual icon (see
// components/theme/icons.ts for why a dynamic icon can't be a Tailwind class).
export const inputIconClassName = [
	"h-5 w-5 flex-none bg-[var(--input-icon)]",
	"[mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");
