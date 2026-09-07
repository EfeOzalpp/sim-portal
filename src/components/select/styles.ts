import { cva } from "class-variance-authority";

// The select's closed trigger button; `error` swaps in the danger-tone border.
export const selectTriggerVariants = cva(
	[
		"select-trigger inline-flex w-full min-w-0 items-center justify-between gap-2",
		"rounded-xl border-solid bg-[var(--select-bg)] text-[var(--input-text)]",
		"border border-[var(--input-border)]",
		"px-3 py-1.5",
		"font-sans text-base text-left",
		"cursor-pointer transition outline-none",
		"hover:border-[var(--input-border-hover)] hover:bg-[var(--select-bg-hover)] hover:shadow-[var(--input-hover-shadow)]",
		"focus-visible:border-[var(--input-border-hover)] focus-visible:shadow-[var(--input-hover-shadow)]",
		"data-[state=open]:border-[var(--input-border-hover)] data-[state=open]:shadow-[var(--input-hover-shadow)]",
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

// The trigger's label text once a value is selected.
export const selectValueClassName = "min-w-0 flex-1 truncate";
// The trigger's label text while no value is selected yet.
export const selectPlaceholderClassName = "min-w-0 flex-1 truncate text-[var(--input-placeholder)]";

// Wraps whatever sits at the trigger's trailing edge (clear button, chevron, spinner).
export const selectIndicatorsClassName = "flex flex-none items-center gap-1";

// The trigger's dropdown chevron; flips 180° when the popover is open.
export const selectChevronClassName = [
	"h-5 w-5 flex-none bg-[var(--input-icon)]",
	"transition-transform duration-150 group-data-[state=open]:rotate-180",
	"[mask-image:url(../assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");

// Shown in place of the chevron/clear button while `loading` is set.
export const selectSpinnerClassName = "flex h-4 w-4 flex-none items-center justify-center text-[var(--input-icon)]";

// The "clear selection" (x) button, shown once a value is selected when `allowClear` is set.
export const selectClearButtonClassName = [
	"inline-grid h-5 w-5 flex-none cursor-pointer place-items-center",
	"border-none bg-transparent p-0 text-[var(--input-icon)] hover:text-[var(--input-text)]",
].join(" ");

// The icon glyph inside selectClearButtonClassName.
export const selectClearIconClassName = [
	"h-full w-full bg-current",
	"[mask-image:url(../assets/close/close.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");

// The dropdown popover itself.
export const selectContentClassName = [
	// z-[150]: below the nav rail (z-[200], layout.tsx), which always wins
	// over a plain page-level select like this - but above ordinary page
	// content. A select rendered inside a modal needs the higher
	// selectContentInModalClassName tier instead (see below).
	"select-content z-[150] overflow-hidden rounded-xl border-solid bg-[var(--input-dropdown-bg)] text-[var(--input-text)]",
	"border border-[var(--input-border)] shadow-lg",
].join(" ");

// Applied instead of (on top of) the z-index above when a <Select> is used
// inside a ModalPopup form field - Select's dropdown and Modal's dialog both
// portal to document.body as siblings, so this has to clear ModalPopup's
// z-[300] explicitly (components/modal/styles.ts), not just out-stack
// whatever's on the page itself. "!important" because it's layered on top of
// the same z-[150] utility above, not replacing it.
export const selectContentInModalClassName = "z-[310]!";

// Padding around the optional search box at the top of the dropdown.
export const selectSearchWrapperClassName = "p-[0.333rem]";

// Scrollable container for the option list itself.
export const selectViewportClassName = "max-h-60 overflow-y-auto p-1";

// A single option row; `selected` highlights the current value(s), `disabled` dims an unselectable option.
export const selectItemVariants = cva(
	[
		"select-item relative flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md outline-none select-none",
		"px-2 py-[0.3rem] text-base",
		"hover:bg-[var(--nav-button-bg-hover)]",
	],
	{
		variants: {
			selected: {
				// !important: data-[highlighted] is an attribute-selector rule, so
				// it outranks a plain bg-[...] class on specificity alone — without
				// this, hovering a selected item would show the hover color instead
				// of the selected one.
				true: "bg-[var(--nav-button-bg-active)]! font-semibold",
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

// Shown in place of the option list when a search filters every option out.
export const selectEmptyClassName = "px-2 py-4 text-center text-sm text-[var(--app-muted)] italic";

// A single chip in the multi-select trigger, one per selected option (up to maxTagCount).
export const selectTagClassName = [
	"inline-flex max-w-full items-center gap-1 rounded-md",
	"border-solid border border-[var(--input-border-hover)]",
	"bg-[var(--nav-button-bg-active)] px-[0.3rem] py-[0.1rem]",
	"text-[0.6875rem] text-[var(--input-tag-text)]",
].join(" ");

// The "x" on a selected-option tag, removing it from the selection.
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
