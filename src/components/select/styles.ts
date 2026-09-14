import { cva } from "class-variance-authority";

// The select's closed trigger button; `error` swaps in the danger-tone border, `variant` picks "default" (plain, blue) or "title" (page-title bar, green, heading-styled text).
export const selectTriggerVariants = cva(
	[
		"select-trigger inline-flex w-full min-w-0 items-center justify-between gap-2",
		"rounded-xl border border-solid",
		"px-3 py-2.5",
		"font-sans text-base text-left",
		"cursor-pointer transition outline-none",
		"disabled:cursor-not-allowed disabled:opacity-60",
	],
	{
		variants: {
			error: {
				true: "border-[var(--input-error-border)]",
				false: "",
			},
			variant: {
				default: [
					"text-[var(--input-text)]",
					"border-[var(--input-border)] bg-[var(--select-bg)]",
					"hover:border-[var(--input-border-hover)] hover:bg-[var(--select-bg-hover)] hover:shadow-[var(--input-hover-shadow)]",
					"focus-visible:border-[var(--input-border-hover)] focus-visible:shadow-[var(--input-hover-shadow)]",
					"data-[state=open]:border-[var(--input-border-hover)] data-[state=open]:shadow-[var(--input-hover-shadow)]",
				],
				// text-[1.25rem]/font-semibold match h3; bg/border are --green-select-*, this is a Select not an input field.
				title: [
					"border-[var(--green-select-border)] bg-[var(--green-select-bg)]",
					"font-heading text-[1.25rem] leading-[1.4] font-semibold text-[var(--green-text)]",
					"[&:not([data-state=open])]:hover:border-[var(--nav-hover-bg)] [&:not([data-state=open])]:hover:bg-[var(--green-select-bg-hover)]",
					"focus-visible:border-[var(--app-theme)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-theme)]",
					"data-[state=open]:border-[var(--app-theme)] data-[state=open]:bg-[var(--green-select-bg-active)]",
					"data-[state=open]:hover:bg-[var(--green-select-bg-active-hover)]",
				],
			},
		},
		defaultVariants: { error: false, variant: "default" },
	},
);

// The trigger's label text once a value is selected.
export const selectValueClassName = "min-w-0 flex-1 truncate";
// The trigger's label text while no value is selected yet.
export const selectPlaceholderClassName = "min-w-0 flex-1 truncate text-[var(--input-placeholder)]";

// Wraps whatever sits at the trigger's trailing edge (clear button, chevron, spinner).
export const selectIndicatorsClassName = "flex flex-none items-center gap-1";

// The trigger's dropdown chevron; flips 180° when the popover is open. Color
// follows the trigger's own variant - title's is --green-text, not --input-icon.
export const selectChevronVariants = cva(
	[
		"h-4 w-4 flex-none",
		"transition-transform duration-150 group-data-[state=open]:rotate-180",
		"[mask-image:url(../assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
	],
	{
		variants: {
			variant: {
				default: "bg-[var(--input-icon)]",
				title: "bg-[var(--green-text)]",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

// Shown in place of the chevron/clear button while `loading` is set.
export const selectSpinnerClassName = "flex h-4 w-4 flex-none items-center justify-center text-[var(--input-icon)]";

// The "clear selection" (x) button, shown once a value is selected when `allowClear` is set.
export const selectClearButtonClassName = [
	"inline-grid h-4 w-4 flex-none cursor-pointer place-items-center",
	"border-none bg-transparent p-0 text-[var(--input-icon)] hover:text-[var(--input-text)]",
].join(" ");

// The icon glyph inside selectClearButtonClassName.
export const selectClearIconClassName = [
	"h-full w-full bg-current",
	"[mask-image:url(../assets/close/close.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");

// The dropdown popover itself - same for every Select variant, including title (only its closed trigger is green).
export const selectContentClassName = [
	// z-[150]: below the nav rail (z-[200]) but above page content; a select inside a modal needs selectContentInModalClassName instead.
	"select-content z-[150] overflow-hidden rounded-xl border-solid bg-[var(--input-dropdown-bg)] text-[var(--input-text)]",
	"border border-[var(--input-border)] shadow-lg",
].join(" ");

// Clears ModalPopup's z-[300] when a Select is used inside one - !important since it layers on top of selectContentClassName's own z-index, not replacing it.
export const selectContentInModalClassName = "z-[310]!";

// Padding around the optional search box at the top of the dropdown.
export const selectSearchWrapperClassName = "p-[0.333rem] [&_.input-affix-wrapper]:border-[var(--input-dropdown-border)]!";

// Scrollable container for the option list itself.
export const selectViewportClassName = "max-h-60 overflow-y-auto p-1";

// A single option row - same blue for every Select, no green variant.
export const selectItemVariants = cva(
	[
		"select-item relative flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md outline-none select-none",
		"px-2 py-[0.3rem] text-base",
		"hover:bg-[var(--nav-button-bg-hover)]",
	],
	{
		variants: {
			selected: {
				true: "font-semibold",
				false: "",
			},
			disabled: {
				true: "cursor-not-allowed opacity-50",
				false: "",
			},
			// title (the green Semester picker in the page-title bar) wants a bit
			// more room before its option text - left side only, and only the
			// text shifts; the selected/hover background still fills the same row,
			// unaffected either way. ! forces it over the base px-2.
			variant: {
				default: "pl-3!",
				title: "pl-4!",
			},
			// Single-select's dropdown highlights its one current value with a bg;
			// multi-select shows a checkbox instead, so it opts out (no bg, just
			// the blue text above) rather than layering both cues.
			highlightSelected: {
				true: "",
				false: "",
			},
		},
		compoundVariants: [
			{ selected: true, highlightSelected: true, class: "text-[var(--select-active-text)]! bg-[var(--select-active-bg)]! aria-selected:hover:bg-[var(--select-active-bg)]!" },
			{ selected: true, highlightSelected: false, class: "text-[var(--select-checkbox-active-text)]!" },
		],
		defaultVariants: { selected: false, disabled: false, variant: "default", highlightSelected: true },
	},
);

// Shown in place of the option list when a search filters every option out.
export const selectEmptyClassName = "px-2 py-4 text-center text-sm text-[var(--app-label)] italic";

// A single chip in the multi-select trigger, one per selected option (up to
// maxTagCount) - same compact pill shape as UserProfileView's role-label tag
// (uppercase, semibold), own blue coloring kept. text-sm, not the role-pill's
// text-[0.6875rem] - the bigger h-4 w-4 "x" (selectTagRemoveClassName) made
// that read too small next to it.
export const selectTagClassName = [
	"inline-flex h-6 max-w-full items-center gap-1 rounded-md",
	"border-solid border border-[var(--select-active-border)]",
	"bg-[var(--select-active-bg)] px-2",
	"text-sm leading-tight font-semibold text-[var(--select-active-text)] uppercase",
].join(" ");

// The "x" on a selected-option tag, removing it from the selection - same
// color and size as RepeatableInput's +/- icons (--input-icon, h-4 w-4), not
// the dimmer, smaller --input-tag-icon/h-3 w-3 this used before.
export const selectTagRemoveClassName = "inline-grid h-4 w-4 flex-none place-items-center text-[var(--select-active-text)] hover:opacity-70";

// The checkbox indicating selection in a multi-select row - accent-color, not
// a checked-bg on the row itself, so it's the one and only "selected" cue there.
export const selectOptionCheckboxClassName = "h-4 w-4 flex-none cursor-pointer accent-[var(--select-checkbox-active-bg)]";
