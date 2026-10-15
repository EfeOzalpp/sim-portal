import { cva } from "class-variance-authority";

// Shared base classes for a plain <input>/<textarea>.
const fieldBase = [
	"input-field w-full min-w-0 rounded-full bg-[var(--input-bg)] text-[var(--input-text)]",
	"border border-[var(--input-border,transparent)]",
	// min-h, not a fixed height - Select's own trigger has no explicit
	// height either (purely padding/line-height driven, same px-3/py-2.5/
	// text-base this has), so this is just a floor matching what that
	// naturally renders at - a <textarea> can still grow taller than it.
	"min-h-12 px-3 py-2.5",
	"font-sans text-base",
	"placeholder:text-[var(--input-placeholder)]",
	"transition",
	"hover:bg-[var(--input-bg-hover)]",
	"focus:border-[var(--input-border-hover,transparent)] focus:shadow-[var(--input-hover-shadow)]",
	"disabled:cursor-not-allowed disabled:opacity-60",
];

// Each variant only re-points the --input-* tokens the field already reads, so
// the base classes stay the same for every context. "modal" re-points nothing -
// .modal-surface and [data-modal-surface-depth] already scope --input-* per depth.
const pageTokens = [
	"[--input-bg:var(--page-input-bg)]",
	"[--input-bg-hover:var(--page-input-bg-hover)]",
	"[--input-border:var(--page-input-border,transparent)]",
	"[--input-border-hover:var(--page-input-border-hover,transparent)]",
	"[--input-placeholder:var(--page-input-text)]",
	"[--input-icon:var(--page-input-search)]",
];

// dropdown is an underlined field: square corners, bottom border only.
const underlinedBase = [
	"rounded-none! border-b-[var(--contrast-surface-border)] focus-visible:outline-none! has-[:focus-visible]:outline-none!",
	"[--input-border:transparent] [--input-border-hover:transparent]",
];

const dropdownTokens = [
	"[--input-bg:var(--contrast-surface-field-bg)]",
	"[--input-bg-hover:var(--contrast-surface-field-bg-hover)]",
	"[--input-text:var(--contrast-surface-field-text)]",
	"[--input-placeholder:var(--contrast-surface-field-placeholder)]",
	"[--input-icon:var(--contrast-surface-field-text)]",
];

export type InputVariant = "page" | "dropdown" | "modal";

// A standalone input/textarea with no prefix/suffix content; `status` swaps in the danger/warning-tone border.
export const inputFieldVariants = cva(fieldBase, {
	variants: {
		status: {
			error: "border-[var(--input-error-border)]",
			warning: "border-[var(--tone-warning-border)]",
			none: "",
		},
		variant: {
			page: [...pageTokens, "px-4! rounded-md!"],
			dropdown: [...underlinedBase, "focus:border-b-[var(--contrast-surface-field-text)]", ...dropdownTokens],
			modal: "",
		},
	},
	defaultVariants: { status: "none", variant: "modal" },
});

// The wrapper around an input that has a prefix/suffix (e.g. a search icon), styled to read as one field; `status` swaps in the danger/warning-tone border.
export const inputWrapperVariants = cva(
	[
		"input-affix-wrapper inline-flex w-full min-w-0 items-center gap-2",
		"rounded-full bg-[var(--input-bg)] text-[var(--input-text)]",
		"border border-[var(--input-border,transparent)]",
		"px-3 py-3",
		"transition",
		"hover:bg-[var(--input-bg-hover)]",
		"focus-within:border-[var(--input-border-hover,transparent)] focus-within:shadow-[var(--input-hover-shadow)]",
		"has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-[var(--focus-ring)]",
	],
	{
		variants: {
			status: {
				error: "border-[var(--input-error-border)]",
				warning: "border-[var(--tone-warning-border)]",
				none: "",
			},
			variant: {
				page: [...pageTokens, "px-4! rounded-md!"],
				dropdown: [
					...underlinedBase,
					"focus-within:border-b-[var(--contrast-surface-field-text)]",
					...dropdownTokens,
					"[--page-input-search:var(--input-icon)]",
					"[--page-input-search-hover:var(--input-text)]",
					"[--page-input-search-hover-bg:var(--contrast-surface-field-bg-hover)]",
				],
				modal: "",
			},
		},
		defaultVariants: { status: "none", variant: "modal" },
	},
);

// The actual <input> nested inside inputWrapperVariants - no border/background of its own, since the wrapper already provides those.
export const inputBareClassName = [
	"w-full min-w-0 flex-1 self-stretch border-none bg-transparent p-0 leading-none [font:inherit]",
	"text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)]",
	"disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

// The "clear" (x) button shown once a value is entered, in mode="clearable".
export const inputClearButtonClassName = [
	"inline-grid h-5 w-5 flex-none cursor-pointer appearance-none self-center place-items-center rounded-full",
	"border-none bg-transparent p-0 leading-none text-[var(--input-icon)] hover:text-[var(--input-text)]",
].join(" ");

// Sizing/color only - pair with <MaskIcon> for the actual icon.
const inputIconBaseClassName = "flex-none bg-[var(--input-icon)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

export const inputIconClassName = `h-5 w-5 ${inputIconBaseClassName}`;

export const inputLargeIconClassName = `h-5 w-5 ${inputIconBaseClassName}`;

export const inputFilterIconClassName = "h-5 w-5 flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// mode="clearable" + loading - same slot the clear button would otherwise sit in.
export const inputSpinnerClassName = "flex h-5 w-5 flex-none items-center justify-center text-[var(--input-icon)]";

// The icon button for mode="action" - same -m-2/p-2 trick as
// inputFilterTriggerClassName, so the hover circle never grows the field.
export const inputActionButtonClassName = [
	"inline-grid flex-none cursor-pointer appearance-none self-center place-items-center rounded-full p-2 -m-2",
	"border-none bg-transparent leading-none text-[var(--modal-chevron-color,var(--input-icon))]",
	"hover:bg-[var(--modal-surface-hover)] hover:text-[var(--input-text)]",
].join(" ");

// The trigger for mode="filter" (e.g. a role-filter popover) - icon itself
// stays the same size as inputClearButtonClassName's, but p-2 grows the
// real box (and its real bg) around it. The matching -m-2 cancels that
// growth back out of the flex row's own size calculation (a negative margin
// shrinks the margin box exactly as much as the padding grew the border box),
// so this can have all the padding it wants with zero risk of nudging the
// input's own height.
export const inputFilterTriggerClassName = [
	"inline-grid flex-none cursor-pointer appearance-none self-center place-items-center rounded-full p-2 -m-2",
	"border-none bg-transparent leading-none text-[var(--page-input-search)]",
	"hover:bg-[var(--page-input-search-hover-bg)] hover:text-[var(--page-input-search-hover)]",
].join(" ");
