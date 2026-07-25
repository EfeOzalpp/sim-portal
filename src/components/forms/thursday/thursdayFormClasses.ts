import { cva } from "class-variance-authority";

export const fieldStackClassName = "flex min-w-0 flex-col gap-[var(--gap-sm)]";

export const sectionHeaderClassName =
	"mb-[var(--gap-sm)] flex items-end justify-between gap-[var(--gap-md)]";

export const inlineActionsClassName = "flex items-center gap-[var(--gap-sm)]";

export const selectionButtonVariants = cva(
	"inline-flex min-h-[1.875rem] cursor-pointer items-center justify-center rounded-[var(--border-sm)] border-[length:var(--app-border-width)] border-solid px-[var(--spacing-sm)] py-0 text-[length:var(--font-size-sm)] font-semibold [background:var(--button-bg,var(--app-surface))] [border-color:var(--button-border,var(--app-border))] [color:var(--button-text,var(--app-text))] [font-family:inherit] hover:[background:var(--button-bg-hover,var(--app-subtle))] hover:[border-color:var(--button-border-hover,var(--app-border))] hover:[color:var(--button-text-hover,var(--app-text))]",
	{
		variants: {
			intent: {
				default: "",
				danger:
					"[--button-bg:#f7dddd] [--button-bg-hover:#efcccc] [--button-border:#e4baba] [--button-border-hover:#d9a8a8] [--button-text:#421717] [--button-text-hover:#421717] dark:[--button-bg:#462d2d] dark:[--button-bg-hover:#553535] dark:[--button-border:#6f4747] dark:[--button-border-hover:#805252] dark:[--button-text:#fff0f0] dark:[--button-text-hover:#fff]",
			},
		},
		defaultVariants: {
			intent: "default",
		},
	},
);

export const optionRowClassName = "flex items-center gap-[var(--gap-sm)]";

export const optionBadgeVariants = cva(
	"shrink-0 rounded-[var(--border-sm)] border-[length:var(--app-border-width)] border-solid px-1.5 py-0.5 text-[0.65rem] font-bold tracking-[0.05em] uppercase [background:var(--option-badge-bg,var(--app-subtle))] [border-color:var(--option-badge-border,var(--app-border))] [color:var(--option-badge-text,var(--app-muted))]",
	{
		variants: {
			selected: {
				true: "[--option-badge-bg:#b9e2c9] [--option-badge-border:#98c9ad] [--option-badge-text:#143821] dark:[--option-badge-bg:#4c7154] dark:[--option-badge-border:#548a69] dark:[--option-badge-text:#fff]",
				false: "",
			},
		},
		defaultVariants: {
			selected: false,
		},
	},
);

export const optionNameClassName = "font-semibold text-[var(--input-text)]";

export const collapseRootClassName = "border-0! bg-transparent!";

export const collapseHeaderClassName =
	"min-h-[3.75rem] items-center! rounded-[var(--border-md)]! bg-[var(--app-surface)]! py-[var(--spacing-sm)]! text-[var(--app-text)]! transition-[background] duration-150 hover:bg-[var(--app-card-bg-hover)]! [.ant-collapse-item-active_&]:rounded-b-none! [.ant-collapse-item-active_&]:border-b-[length:var(--app-border-width)] [.ant-collapse-item-active_&]:border-solid [.ant-collapse-item-active_&]:border-[var(--app-border)]";

export const collapseTitleClassName = "flex min-w-0 items-center";

export const collapseBodyClassName = "bg-[var(--app-surface)]! text-[var(--app-text)]!";

export const collapseIconClassName =
	"inline-flex! h-9 items-center justify-center pe-[var(--spacing-sm)]!";

export const collapseArrowVariants = cva(
	"inline-flex h-[var(--svg-size-md)] w-[var(--svg-size-md)] items-center justify-center text-[var(--app-text)]",
	{
		variants: {
			expanded: {
				true: "rotate-180",
				false: "rotate-0",
			},
		},
		defaultVariants: {
			expanded: false,
		},
	},
);

export const collapseItemClassName =
	"overflow-hidden rounded-[var(--border-md)]! border-[length:var(--app-border-width)]! border-solid! border-[var(--app-border)]! bg-[var(--app-surface)]!";

export const collapseLabelClassName =
	"inline-flex min-w-0 items-center gap-[var(--gap-sm)] text-[var(--app-text)]";

export const collapseTitleTextClassName =
	"min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-[family-name:var(--font-family-heading)] text-[length:var(--font-size-h4)] font-semibold leading-[var(--line-height-tight)] text-[var(--app-text)]";

export const collapseMetaClassName =
	"shrink-0 text-[length:var(--font-size-sm)] font-semibold leading-[var(--line-height-tight)] text-[var(--app-muted)]";

export const iconButtonClassName =
	"m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-[var(--border-md)] border-[length:var(--app-border-width)] border-solid border-[var(--input-border)] bg-transparent p-0 text-[var(--input-icon)] hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]";
