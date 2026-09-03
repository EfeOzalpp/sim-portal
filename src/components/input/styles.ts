import { cva } from "class-variance-authority";

const fieldBase = [
	"input-field w-full min-w-0 rounded-xl border-solid bg-[var(--input-bg)] text-[var(--input-text)]",
	"border border-[var(--input-border)]",
	"px-2 py-[0.325rem]",
	"font-sans text-base",
	"placeholder:text-[var(--input-placeholder)]",
	"transition outline-none",
	"hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:shadow-[var(--input-hover-shadow)]",
	"focus:border-[var(--input-border-active)] focus:shadow-[var(--input-hover-shadow)]",
	"disabled:cursor-not-allowed disabled:opacity-60",
];

export const inputFieldVariants = cva(fieldBase, {
	variants: {
		error: {
			true: "border-[var(--input-error-border)]",
			false: "",
		},
	},
	defaultVariants: { error: false },
});

export const inputWrapperVariants = cva(
	[
		"input-affix-wrapper inline-flex w-full min-w-0 items-center gap-2",
		"rounded-xl border-solid bg-[var(--input-bg)] text-[var(--input-text)]",
		"border border-[var(--input-border)]",
		"px-2 py-[0.325rem]",
		"transition",
		"hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:shadow-[var(--input-hover-shadow)]",
		"focus-within:border-[var(--input-border-active)] focus-within:shadow-[var(--input-hover-shadow)]",
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

export const inputBareClassName = [
	"w-full min-w-0 flex-1 border-none bg-transparent p-0 [font:inherit]",
	"text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)]",
	"disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

export const inputClearButtonClassName = [
	"inline-grid h-4 w-4 flex-none cursor-pointer place-items-center",
	"border-none bg-transparent p-0 text-[var(--input-icon)] hover:text-[var(--input-text)]",
].join(" ");

// Sizing/color only — pair with <MaskIcon> for the actual icon (see
// components/theme/icons.ts for why a dynamic icon can't be a Tailwind class).
export const inputIconClassName = [
	"h-4 w-4 flex-none bg-[var(--input-icon)]",
	"[mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");
