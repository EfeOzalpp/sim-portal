import { cva } from "class-variance-authority";

// The select's closed trigger button; `error` swaps in the danger-tone border, `variant` picks "default" (plain, blue) or "title" (page-title bar, green, heading-styled text).
export const selectTriggerVariants = cva(
	[
		"select-trigger inline-flex w-full min-w-0 items-center justify-between gap-2",
		"rounded-xl border border-solid",
		// min-h, not a fixed height - matches the multi-select trigger's own
		// min-h-12 (tuned for its h-8 tag pills) so a plain single-select next
		// to one doesn't sit visibly shorter.
		"min-h-12 px-3 py-2.5",
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
					"hover:bg-[var(--select-bg-hover)]",
					"focus-visible:border-[var(--input-border-hover)] focus-visible:shadow-[var(--input-hover-shadow)]",
					"data-[state=open]:border-[var(--input-border-hover)] data-[state=open]:shadow-[var(--input-hover-shadow)]",
				],
				// text-[1.25rem]/font-semibold match h3; bg is --green-select-*, this is a Select not an input field. No border in any state - bg alone carries it.
				title: [
					"border-transparent bg-[var(--green-select-bg)]",
					"font-heading text-[1.25rem] leading-[1.4] font-semibold text-[var(--green-text)]",
					"[&:not([data-state=open])]:hover:bg-[var(--green-select-bg-hover)]",
					"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-theme)]",
					"data-[state=open]:bg-[var(--green-select-bg-active)]",
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
				// --modal-chevron-color/-active-color fall back to --input-icon
				// itself when unset (light theme leaves them unset, so it's
				// unaffected) - dark theme sets them, dimming the chevron at rest
				// and brightening it once the dropdown's actually open.
				default: "bg-[var(--modal-chevron-color,var(--input-icon))] group-data-[state=open]:bg-[var(--modal-chevron-active-color,var(--input-icon))]",
				title: "bg-[var(--green-text)]",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

// Shown in place of the chevron/clear button while `loading` is set. Same
// variant-aware color as the chevron - title's is --green-text, not --input-icon.
export const selectSpinnerVariants = cva(["flex h-4 w-4 flex-none items-center justify-center"], {
	variants: {
		variant: {
			default: "text-[var(--input-icon)]",
			title: "text-[var(--green-text)]",
		},
	},
	defaultVariants: { variant: "default" },
});

// The "clear selection" (x) button, shown once a value is selected when `allowClear` is set.
export const selectClearButtonClassName = [
	"inline-grid h-4 w-4 flex-none cursor-pointer appearance-none self-center place-items-center",
	"border-none bg-transparent p-0 leading-none text-[var(--input-icon)] hover:text-[var(--input-text)]",
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
	"[--input-text:var(--input-dropdown-text,var(--input-text))]",
].join(" ");

// Clears ModalPopup's z-[300] when a Select is used inside one - !important since it layers on top of selectContentClassName's own z-index, not replacing it.
// Also re-points the dropdown's own tokens (bg/text/search-box/hover-row/scrollbar) at
// the --input-modal-* family, which dark theme sets to a dark surface (styling-theme.css) -
// light theme leaves those unset, so the fallback keeps its existing light dropdown as-is.
// Everything else in the dropdown (selected-row bg, tag pills, checkboxes, border) already
// pulls from tokens that are dark-aware globally, so only these need the inModal override.
export const selectContentInModalClassName = [
	"z-[310]!",
	"[--input-dropdown-bg:var(--input-modal-dropdown-bg,var(--input-dropdown-bg))]",
	"[--input-dropdown-text:var(--input-modal-dropdown-text,var(--input-dropdown-text))]",
	"[--input-area-input-bg:var(--input-modal-area-input-bg,var(--input-area-input-bg))]",
	"[--input-area-input-bg-hover:var(--input-modal-area-input-bg-hover,var(--input-area-input-bg-hover))]",
	"[--input-area-input-placeholder:var(--input-modal-area-input-placeholder,var(--input-area-input-placeholder))]",
	"[--input-area-input-text:var(--input-modal-area-input-text,var(--input-area-input-text))]",
	"[--input-area-hovered-item-bg:var(--input-modal-area-hovered-item-bg,var(--input-area-hovered-item-bg))]",
	"[--input-dropdown-scrollbar:var(--input-modal-dropdown-scrollbar,var(--input-dropdown-scrollbar))]",
	"[--input-dropdown-scrollbar-hover:var(--input-modal-dropdown-scrollbar-hover,var(--input-dropdown-scrollbar-hover))]",
].join(" ");

// Padding around the optional search box at the top of the dropdown. The
// --page-input-search* trio re-points a filterTrigger embedded in this box
// (mode="filter") at colors already scoped for this surface, rather than the
// page-level search bar's own tokens it was actually built for.
export const selectSearchWrapperClassName =
	"p-[0.333rem] [&_.input-affix-wrapper]:border-transparent! [--input-bg:var(--input-area-input-bg,var(--input-bg))] [--input-bg-hover:var(--input-area-input-bg-hover,var(--input-bg-hover))] [--input-text:var(--input-area-input-text,var(--input-text))] [--input-placeholder:var(--input-area-input-placeholder,var(--input-placeholder))] [--input-icon:var(--input-area-input-text,var(--input-icon))] [--page-input-search:var(--input-icon)] [--page-input-search-hover:var(--input-text)] [--page-input-search-hover-bg:var(--input-area-hovered-item-bg)]";

// Scrollable container for the option list itself.
export const selectViewportClassName = "select-viewport max-h-60 overflow-y-auto p-1";

// A single option row - same blue for every Select, no green variant.
export const selectItemVariants = cva(
	[
		"select-item relative flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md outline-none select-none",
		"px-2 py-[0.3rem] text-base",
		"hover:bg-[var(--input-area-hovered-item-bg)]",
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
				default: "pl-4!",
				title: "pl-4!",
			},
			// Single-select's dropdown highlights its one current value with a bg;
			// multi-select shows a checkbox instead, so it opts out (no bg) - the
			// checkbox's own border/bg states are the one and only "selected" cue there.
			highlightSelected: {
				true: "",
				false: "",
			},
		},
		compoundVariants: [
			{ selected: true, highlightSelected: true, class: "text-[var(--select-active-text)]! bg-[var(--input-area-selected-item-bg)]! aria-selected:hover:bg-[var(--input-area-selected-item-bg)]!" },
		],
		defaultVariants: { selected: false, disabled: false, variant: "default", highlightSelected: true },
	},
);

// Shown in place of the option list when a search filters every option out.
export const selectEmptyClassName = "px-2 py-4 text-center text-sm text-[var(--label-text)] italic";

// A single chip in the multi-select trigger, one per selected option (up to
// maxTagCount) - same compact pill shape as UserProfileView's role-label tag
// (uppercase, semibold), own blue coloring kept. text-sm, not the role-pill's
// text-[0.6875rem] - the bigger h-4 w-4 "x" (selectTagRemoveClassName) made
// that read too small next to it. No border (removed) - bg alone carries it.
// p-2 uniformly, not px-2 + a fixed h-8 - real padding on every side instead
// of centering inside a hardcoded height. --select-tag-color/-hover-color
// fall back to the older --select-tag-text name, and -hover-color/-bg-hover
// fall back to their own rest-state value, so a theme that hasn't defined
// the new hover tokens yet just doesn't react on hover instead of going blank.
export const selectTagClassName = [
	"inline-flex max-w-full items-center gap-1 rounded-md p-2",
	"bg-[var(--select-tag-bg)] hover:bg-[var(--select-tag-bg-hover,var(--select-tag-bg))]",
	"text-sm leading-tight font-semibold uppercase",
	"text-[var(--select-tag-color,var(--select-tag-text))] hover:text-[var(--select-tag-hover-color,var(--select-tag-color,var(--select-tag-text)))]",
].join(" ");

// The "x" on a selected-option tag, removing it from the selection - same
// color and size as RepeatableInput's +/- icons (--input-icon, h-4 w-4), not
// the dimmer, smaller --input-tag-icon/h-3 w-3 this used before.
export const selectTagRemoveClassName = "inline-grid h-4 w-4 flex-none place-items-center text-[var(--select-tag-color,var(--select-tag-text))] hover:opacity-70";

// mode="tags" only - commits the draft input text as a new tag, same
// position/size family as selectClearButtonClassName (trailing edge, h-4 w-4)
// but stays around whenever there's draft text, rather than only once a
// value exists - pressing Enter in the draft input does the same thing.
export const selectTagCommitButtonClassName = [
	"inline-grid h-4 w-4 flex-none cursor-pointer appearance-none self-center place-items-center",
	"border-none bg-transparent p-0 leading-none text-[var(--input-icon)] hover:text-[var(--input-text)]",
	"disabled:cursor-not-allowed disabled:opacity-40",
].join(" ");

// The icon glyph inside selectTagCommitButtonClassName.
export const selectTagCommitIconClassName = [
	"h-full w-full bg-current",
	"[mask-image:url(../assets/add/add.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");

// mode="tags"' own boxed container - reuses selectTriggerVariants({error})
// for the same border/bg/text coloring as every other Select, plus
// multi-select's own flex-wrap/py-1.5 tuning (see MultiSelectImpl). Focus
// lands on the draft input inside it, not the box itself, so this swaps
// focus-visible for focus-within and cursor-pointer for cursor-text.
export const selectTagsBoxClassName =
	"cursor-text! flex-wrap py-1.5! focus-within:border-[var(--input-border-hover)]! focus-within:shadow-[var(--input-hover-shadow)]!";

// The freeform draft input inside mode="tags" - transparent, borderless, grows to fill leftover row width next to existing pills.
export const selectTagDraftInputClassName =
	"min-w-[6rem] flex-1 border-none bg-transparent p-0 text-base text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)]";

// The checkbox indicating selection in a multi-select row - appearance-none,
// not accent-color, so the unchecked border/checked bg are both fully ours to
// draw rather than whatever the browser's native rendering defaults to.
export const selectOptionCheckboxClassName =
	"h-4 w-4 flex-none cursor-pointer appearance-none rounded-xs border-2 border-solid border-[var(--select-checkbox-border)] bg-transparent checked:border-[var(--select-checkbox-active-bg)] checked:bg-[var(--select-checkbox-active-bg)] hover:border-[var(--select-checkbox-hovered-border)] checked:hover:border-[var(--select-checkbox-hovered-bg)] checked:hover:bg-[var(--select-checkbox-hovered-bg)]";

// The manually-drawn checkmark overlay shown when selectOptionCheckboxClassName's input is checked - paired with <MaskIcon icon="check/check.svg">.
export const selectOptionCheckmarkClassName =
	"pointer-events-none absolute inset-0 h-4 w-4 bg-[var(--selected-checkbox-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:85%]";

// mode="filterableMultiselect" only - the label + headerFilter + Select
// all/Unselect all row above the trigger. Was hand-rolled separately in
// ProductionForm/PresentationsField/SemesterForm (each with its own gap
// value, which had drifted) - owned here now so every instance matches.
export const selectFilterableHeaderClassName = "mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3";
export const selectFilterableLabelClassName = "ui-label m-0 block pl-1";
export const selectFilterableActionsClassName = "flex flex-wrap items-center gap-2";
