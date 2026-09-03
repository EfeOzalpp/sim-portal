import { cva } from "class-variance-authority";

export const selectTriggerVariants = cva(
	[
		"select-trigger inline-flex w-full min-w-0 items-center justify-between gap-2",
		"rounded-xl border-solid bg-[var(--input-bg)] text-[var(--input-text)]",
		"border border-[var(--input-border)]",
		"px-2 py-[0.325rem]",
		"font-sans text-base text-left",
		"cursor-pointer transition outline-none",
		"hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:shadow-[var(--input-hover-shadow)]",
		"focus-visible:border-[var(--input-border-active)] focus-visible:shadow-[var(--input-hover-shadow)]",
		"data-[state=open]:border-[var(--input-border-active)] data-[state=open]:shadow-[var(--input-hover-shadow)]",
		"disabled:cursor-not-allowed disabled:opacity-60",
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

export const selectValueClassName = "min-w-0 flex-1 truncate";
export const selectPlaceholderClassName = "min-w-0 flex-1 truncate text-[var(--input-placeholder)]";

export const selectIndicatorsClassName = "flex flex-none items-center gap-1";

export const selectChevronClassName = [
	"h-4 w-4 flex-none bg-[var(--input-icon)]",
	"transition-transform duration-150 group-data-[state=open]:rotate-180",
	"[mask-image:url(../assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");

export const selectSpinnerClassName = "flex h-4 w-4 flex-none items-center justify-center text-[var(--input-icon)]";

export const selectClearButtonClassName = [
	"inline-grid h-4 w-4 flex-none cursor-pointer place-items-center",
	"border-none bg-transparent p-0 text-[var(--input-icon)] hover:text-[var(--input-text)]",
].join(" ");

export const selectClearIconClassName = [
	"h-full w-full bg-current",
	"[mask-image:url(../assets/close/close.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");

export const selectContentClassName = [
	// z-[1100]: Select/Popover content and ModalPopup's dialog both portal to
	// document.body, landing as siblings there — so this has to clear
	// ModalPopup's z-[1000] explicitly, not just out-stack whatever's on the
	// page itself.
	"select-content z-[1100] overflow-hidden rounded-xl border-solid bg-[var(--input-dropdown-bg)] text-[var(--input-text)]",
	"border border-[var(--input-border)] shadow-lg",
].join(" ");

export const selectSearchWrapperClassName = "border-b border-b-[var(--input-border)] p-[0.333rem]";

export const selectViewportClassName = "max-h-72 overflow-y-auto p-1";

export const selectItemVariants = cva(
	[
		"select-item relative flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md outline-none select-none",
		"px-2 py-[0.3rem] text-base",
		"data-[highlighted]:bg-[var(--input-dropdown-bg-hover)]",
	],
	{
		variants: {
			selected: {
				// !important: data-[highlighted] is an attribute-selector rule, so
				// it outranks a plain bg-[...] class on specificity alone — without
				// this, hovering a selected item would show the hover color instead
				// of the selected one.
				true: "bg-[var(--input-dropdown-bg-active)]! font-semibold",
				false: "",
			},
			disabled: {
				true: "cursor-not-allowed opacity-50",
				false: "",
			},
		},
		defaultVariants: { selected: false, disabled: false },
	},
);

export const selectEmptyClassName = "px-2 py-4 text-center text-sm text-[var(--app-muted)] italic";

export const selectTagClassName = [
	"inline-flex max-w-full items-center gap-1 rounded-md",
	"border-solid border border-[var(--input-tag-border)]",
	"bg-[var(--input-tag-bg)] px-[0.3rem] py-[0.1rem]",
	"text-[0.6875rem] text-[var(--input-tag-text)]",
].join(" ");

export const selectTagRemoveClassName = "inline-grid h-3 w-3 flex-none place-items-center text-[var(--input-tag-icon)] hover:text-[var(--input-text)]";

// The "Selected"/"Unselected" badge baked into every multi-select row —
// every antd-era consumer (SemesterForm, ProductionForm, PresentationsField)
// hand-rolled the same badge independently; centralizing it here instead of
// exposing a renderOption prop each consumer would reimplement identically.
export const selectOptionBadgeVariants = cva(
	[
		"shrink-0 rounded-md border border-solid px-1.5 py-0.5",
		"text-[0.65rem] font-bold tracking-[0.05em] uppercase",
	],
	{
		variants: {
			selected: {
				true: "border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-text)]",
				false: "border-[var(--app-border)] bg-[var(--app-subtle)] text-[var(--app-muted)]",
			},
		},
		defaultVariants: { selected: false },
	},
);
