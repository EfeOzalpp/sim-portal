import { cva } from "class-variance-authority";
import { buttonVariants } from "@/components/button/styles";

// Trigger variants do not change the dropdown's palette.
export const selectTriggerVariants = cva(
	[
		"select-trigger inline-flex min-w-0 items-center justify-between gap-2",
		"rounded-full border border-solid",
		// min-h, not a fixed height - matches the multi-select trigger's own
		// min-h-12 (tuned for its h-8 tag pills) so a plain single-select next
		// to one doesn't sit visibly shorter.
		"min-h-12 px-3 py-2.5",
		"ui-control text-left",
		"cursor-pointer transition",
		"disabled:cursor-not-allowed disabled:opacity-60",
	],
	{
		variants: {
			error: {
				true: "border-[var(--input-error-border)]",
				false: "",
			},
			variant: {
				button: [buttonVariants({ surface: "modal" }), "justify-between!"],
				default: [
					"w-full text-[var(--input-text)]",
					"border-[var(--select-border,var(--input-border))] bg-[var(--select-bg)]",
					"hover:border-[var(--select-border-hover,var(--input-border-hover))] hover:bg-[var(--select-bg-hover)]",
					"active:bg-[var(--select-bg-hover)] data-[state=open]:bg-[var(--select-bg-hover)] data-[state=open]:border-[var(--select-border-hover,var(--input-border-hover))]",
					"focus-visible:border-[var(--select-border-hover,var(--input-border-hover))] focus-visible:shadow-[var(--input-hover-shadow)]",
					"data-[state=open]:border-[var(--select-border-hover,var(--input-border-hover))] data-[state=open]:shadow-[var(--input-hover-shadow)]",
				],
				// Title keeps its color/surface treatment, but uses the same typography as the other Select triggers.
				title: [
					"w-[var(--select-title-width)] flex-none rounded-md! border-transparent bg-[var(--title-select-bg)] pl-4! pr-3!",
					"text-[var(--page-select-text)] [-webkit-text-fill-color:var(--page-select-text)]",
					"h-full min-h-full py-0",
					"[&:not([data-state=open])]:hover:bg-[var(--title-select-bg-hover)] [&:not([data-state=open])]:hover:text-[var(--page-select-text-hover)] [&:not([data-state=open])]:hover:[-webkit-text-fill-color:var(--page-select-text-hover)]",
					"[--focus-ring:var(--app-theme)]",
					"data-[state=open]:bg-[var(--title-select-bg-open)] data-[state=open]:text-[var(--title-select-text-open)] data-[state=open]:[-webkit-text-fill-color:var(--title-select-text-open)]",
					"data-[state=open]:hover:bg-[var(--title-select-bg-open-hover)]",
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
// follows the trigger's own variant - title uses page-select text until active/open.
export const selectChevronVariants = cva(
	[
		"flex-none",
		"transition-transform duration-150 group-data-[state=open]:rotate-180",
		"[mask-image:url(./assets/arrow/down.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
	],
	{
		variants: {
			variant: {
				// --modal-chevron-color/-active-color fall back to --input-icon
				// itself when unset (light theme leaves them unset, so it's
				// unaffected) - dark theme sets them, dimming the chevron at rest
				// and brightening it once the dropdown's actually open.
				default: "h-5 w-5 bg-[var(--modal-chevron-color,var(--input-icon))] group-data-[state=open]:bg-[var(--modal-chevron-active-color,var(--input-icon))]",
				button: "h-5 w-5 bg-current",
				title: "h-5 w-5 bg-[var(--page-select-text)] group-hover:bg-[var(--page-select-text-hover)] group-data-[state=open]:bg-[var(--title-select-text-open)]",
			},
		},
		defaultVariants: { variant: "default" },
	},
);

// Shown in place of the chevron/clear button while `loading` is set. Same
// variant-aware color as the chevron - title uses page-select text until active/open.
export const selectSpinnerVariants = cva(["flex h-5 w-5 flex-none items-center justify-center"], {
	variants: {
		variant: {
			default: "text-[var(--input-icon)]",
			button: "text-current",
			title: "text-[var(--page-select-text)] group-hover:text-[var(--page-select-text-hover)] group-data-[state=open]:text-[var(--title-select-text-open)]",
		},
	},
	defaultVariants: { variant: "default" },
});

// The "clear selection" (x) button, shown once a value is selected when `allowClear` is set.
export const selectClearButtonClassName = [
	"inline-grid h-5 w-5 flex-none cursor-pointer appearance-none self-center place-items-center",
	"border-none bg-transparent p-0 leading-none text-[var(--input-icon)] hover:text-[var(--input-text)]",
].join(" ");

// The icon glyph inside selectClearButtonClassName.
export const selectClearIconClassName = [
	"h-full w-full bg-current",
	"[mask-image:url(./assets/close/close.svg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
].join(" ");

// The dropdown popover itself - shared by Select variants; variant-specific
// classes can layer on top because the popover is portaled out of the trigger.
export const selectContentClassName = [
	// Compact triggers still need room for option padding, the selection mark, and a semester code.
	"min-w-32",
	// z-[150]: below the nav rail (z-[200]) but above page content; a select inside a modal needs selectContentInModalClassName instead.
	"select-content z-[150] overflow-hidden rounded-none border-0 outline-none bg-[var(--contrast-surface-bg)] text-[var(--contrast-surface-text)]",
	"shadow-lg",
	"[--input-text:var(--contrast-surface-text)] [--label-text:var(--contrast-surface-label)]",
].join(" ");

// Title selects live in the mobile topbar/nav layer, so their dropdown has to clear that layer too.
export const selectContentTitleClassName = "z-[220]! rounded-none! [--contrast-surface-field-bg:var(--contrast-surface-field-bg-hover)]";

// Clears ModalPopup's z-[300] when a Select is used inside one - !important since it layers on top of selectContentClassName's own z-index, not replacing it.
// Also re-points the dropdown's own tokens (bg/text/search-box/hover-row/scrollbar) at
// the --input-modal-* family for the matching light/dark modal palette.
// Everything else in the dropdown (selected-row bg, tag pills, checkboxes) already
// pulls from tokens that are dark-aware globally, so only these need the inModal override.
export const selectContentInModalClassName = [
	"select-content-in-modal z-[310]!",
	"[--contrast-surface-bg:var(--input-modal-dropdown-bg)]",
	"[--contrast-surface-text:var(--input-modal-dropdown-text)]",
	"[--contrast-surface-label:var(--input-modal-dropdown-label,var(--input-modal-dropdown-text))]",
	"[--contrast-surface-hovered-item-bg:var(--input-modal-area-hovered-item-bg)]",
	"[--contrast-surface-field-bg:var(--input-modal-area-input-bg)]",
	"[--contrast-surface-field-bg-hover:var(--input-modal-area-input-bg-hover)]",
	"[--contrast-surface-field-placeholder:var(--input-modal-area-input-placeholder)]",
	"[--contrast-surface-field-text:var(--input-modal-area-input-text)]",
	"[--contrast-surface-field-icon:var(--input-modal-area-input-icon,var(--input-modal-area-input-text))]",
	"[--input-dropdown-scrollbar:var(--input-modal-dropdown-scrollbar)]",
	"[--input-dropdown-scrollbar-hover:var(--input-modal-dropdown-scrollbar-hover)]",
].join(" ");

// Padding around the optional search box at the top of the dropdown. The Input
// itself uses variant="dropdown", which reads --contrast-surface-field-* - re-pointed
// by selectContentInModalClassName when the dropdown sits in a modal.
export const selectSearchWrapperClassName = "p-[0.333rem]";

// Scrollable container for the option list itself.
export const selectViewportClassName = "select-viewport max-h-60 overflow-y-auto py-1";

// A single option row - same blue for every Select, no green variant.
export const selectItemVariants = cva(
	[
		"select-item relative flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-none select-none",
		"ui-control px-4 py-[0.3rem]",
		"hover:bg-[var(--contrast-surface-hovered-item-bg)]",
		"focus-visible:bg-[var(--contrast-surface-hovered-item-bg)] focus-visible:outline-offset-[-2px]",
	],
	{
		variants: {
			selected: {
				true: "ui-emphasis",
				false: "",
			},
			disabled: {
				true: "cursor-not-allowed opacity-50",
				false: "",
			},
			// title (the green Semester picker in the page-title bar) wants a bit
			// more room before its option text - left side only, and only the
			// text shifts; the selected/hover background still fills the same row,
			// unaffected either way. ! forces it over the base px-4.
			variant: {
				default: "",
				title: "",
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
			{ highlightSelected: true, class: "pl-10" },
			{ selected: true, highlightSelected: true, class: "is-selected-row text-[var(--select-active-text)]! bg-[var(--contrast-surface-selected-item-bg,transparent)]! hover:bg-[var(--contrast-surface-hovered-item-bg)]! before:absolute before:top-1/2 before:left-3.5 before:h-4 before:w-4 before:-translate-y-1/2 before:bg-current before:content-[''] before:[mask-image:url(./assets/check/check.svg)] before:[mask-position:center] before:[mask-repeat:no-repeat] before:[mask-size:contain]" },
			{ selected: true, highlightSelected: true, variant: "title", class: "bg-[var(--contrast-surface-select-active-bg,transparent)]! hover:bg-[var(--contrast-surface-hovered-item-bg)]!" },
		],
		defaultVariants: { selected: false, disabled: false, variant: "default", highlightSelected: true },
	},
);

// Shown in place of the option list when a search filters every option out.
export const selectEmptyClassName = "ui-note px-4 py-4 text-center text-[var(--label-text)]";

export const selectOptionGroupLabelClassName =
	"ui-label px-4 pb-1 pt-1";

// A single chip in the multi-select trigger, one per selected option (up to
// maxTagCount) - same compact pill shape as UserProfileView's role-label tag
// Chip typography lives in font-theme.css; the fill carries its surface treatment.
// -hover-color/-bg-hover fall back
// to their own rest-state value, so a theme that hasn't defined the hover
// tokens yet just doesn't react on hover instead of going blank.
export const selectTagClassName = [
	"inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1",
	"bg-[var(--select-tag-bg)] hover:bg-[var(--select-tag-bg-hover,var(--select-tag-bg))]",
	"ui-chip",
	"text-[var(--select-tag-color)] hover:text-[var(--select-tag-hover-color,var(--select-tag-color))]",
].join(" ");

// The "x" on a selected-option tag, removing it from the selection - same
// color and size as RepeatableInput's +/- icons (--input-icon, h-4 w-4), not
// the dimmer, smaller old dropdown tag icon style this used before.
export const selectTagRemoveClassName = "inline-grid h-4 w-4 flex-none place-items-center text-[var(--select-tag-color)] hover:opacity-70";

// mode="tags" only - commits the draft input text as a new tag. It renders
// as a minimal text control inside the tags box; Enter in the draft input
// still commits the same value.
export const selectTagCommitButtonClassName =
	"ui-small ui-emphasis -my-1.5 -mr-3 min-h-0! self-stretch [--button-height:auto] rounded-none! border-0! px-3! py-0! hover:text-[var(--input-text)] hover:no-underline disabled:opacity-40";

// mode="tags"' own boxed container - reuses selectTriggerVariants({error})
// for the same border/bg/text coloring as every other Select, plus
// multi-select's own flex-wrap/py-1.5 tuning (see MultiSelectImpl). Focus
// lands on the draft input inside it, not the box itself, so this swaps
// focus-visible for focus-within and cursor-pointer for cursor-text.
export const selectTagsBoxClassName =
	"cursor-text! flex-wrap py-1.5! hover:border-[var(--select-border-hover,var(--input-border-hover))]! focus-within:border-[var(--select-border-hover,var(--input-border-hover))]! focus-within:shadow-[var(--input-hover-shadow)]!";

// The freeform draft input inside mode="tags" - transparent, borderless, grows to fill leftover row width next to existing pills.
export const selectTagDraftInputClassName =
	"ui-control min-w-[6rem] flex-1 border-none bg-transparent p-0 text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)]";

// The checkbox indicating selection in a multi-select row - appearance-none,
// not accent-color, so the unchecked border/checked bg are both fully ours to
// draw rather than whatever the browser's native rendering defaults to.
export const selectOptionCheckboxClassName =
	"h-4 w-4 flex-none cursor-pointer appearance-none rounded-xs border-2 border-solid border-[var(--select-checkbox-border)] bg-transparent checked:border-[var(--select-checkbox-active-bg)] checked:bg-[var(--select-checkbox-active-bg)] hover:border-[var(--select-checkbox-hovered-border)] checked:hover:border-[var(--select-checkbox-hovered-bg)] checked:hover:bg-[var(--select-checkbox-hovered-bg)]";

export const selectOptionCheckboxWrapperClassName = "relative inline-flex h-4 w-4 flex-none";

// The manually-drawn checkmark overlay shown when selectOptionCheckboxClassName's input is checked - paired with <MaskIcon icon="check/check.svg">.
export const selectOptionCheckmarkClassName =
	"pointer-events-none absolute inset-0 h-4 w-4 bg-[var(--selected-checkbox-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:85%]";

export const selectOptionLabelClassName = "ui-emphasis min-w-0 flex-1 truncate";

// mode="filterableMultiselect" only - the label + headerFilter + Select
// all/Unselect all row above the trigger. Was hand-rolled separately in
// ProductionForm/PresentationsField/SemesterForm (each with its own gap
// value, which had drifted) - owned here now so every instance matches.
export const selectFilterableHeaderClassName = "mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3";
export const selectFilterableLabelClassName = "ui-label m-0 block pl-1";
export const selectFilterableActionsClassName = "flex flex-wrap items-center gap-0.5";
