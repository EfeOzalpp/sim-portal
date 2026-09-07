import { cva } from "class-variance-authority";

// The alert's outer container; `tone` picks its border/background/text color.
export const alertVariants = cva(
	[
		"alert flex items-start gap-2 rounded-xl border-solid",
		"border px-4 py-2",
	],
	{
		variants: {
			tone: {
				success: "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-text)]",
				danger: "border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-text)]",
				warning: "border-[var(--tone-warning-border)] bg-[var(--tone-warning-bg)] text-[var(--tone-warning-text)]",
				info: "border-[var(--tone-info-border)] bg-[var(--tone-info-bg)] text-[var(--tone-info-text)]",
			},
		},
		defaultVariants: { tone: "info" },
	},
);

// The leading status icon, shown when `showIcon` is set.
export const alertIconClassName = "h-[1.375rem] w-[1.375rem] flex-none";

// The message text itself.
export const alertDescriptionClassName = "min-w-0 flex-1 text-sm leading-normal";

// The dismiss ("x") button, shown when `closable` is set.
export const alertCloseButtonClassName = [
	"inline-grid h-4 w-4 flex-none cursor-pointer place-items-center",
	"border-none bg-transparent p-0 text-current opacity-70 hover:opacity-100",
].join(" ");
