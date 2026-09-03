import { cva } from "class-variance-authority";

export const alertVariants = cva(
	[
		"alert flex items-start gap-[var(--gap-sm)] rounded-[var(--border-md)] border-solid",
		"[border-width:var(--app-border-width)] px-[var(--spacing-md)] py-[var(--spacing-sm)]",
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

export const alertIconClassName = "h-[var(--svg-size-md)] w-[var(--svg-size-md)] flex-none";

export const alertDescriptionClassName = "min-w-0 flex-1 text-[length:var(--font-size-sm)] leading-[var(--line-height-base)]";

export const alertCloseButtonClassName = [
	"inline-grid h-[var(--svg-size-sm)] w-[var(--svg-size-sm)] flex-none cursor-pointer place-items-center",
	"border-none bg-transparent p-0 text-current opacity-70 hover:opacity-100",
].join(" ");
