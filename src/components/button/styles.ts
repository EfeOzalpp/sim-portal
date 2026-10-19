import { cva, type VariantProps } from "class-variance-authority";

const filledClassName =
	"border-transparent [background-clip:padding-box] [box-shadow:inset_0_0_0_1px_var(--button-ring,var(--button-border,transparent))] bg-[var(--button-bg)] text-[var(--button-text)] hover:[box-shadow:inset_0_0_0_1px_var(--button-ring-hover,var(--button-border-hover,transparent))] hover:bg-[var(--button-bg-hover)] hover:text-[var(--button-text-hover)] active:bg-[var(--button-bg-active,var(--button-bg-hover))] aria-expanded:bg-[var(--button-bg-active,var(--button-bg-hover))] aria-pressed:bg-[var(--button-bg-active,var(--button-bg-hover))] data-[state=open]:bg-[var(--button-bg-active,var(--button-bg-hover))] active:text-[var(--button-text-active,var(--button-text-hover))] aria-expanded:text-[var(--button-text-active,var(--button-text-hover))] aria-pressed:text-[var(--button-text-active,var(--button-text-hover))] data-[state=open]:text-[var(--button-text-active,var(--button-text-hover))]";

const iconOnlyClassName = [
	"btn-icon inline-grid! h-10 w-10 flex-none place-items-center! gap-0! rounded-full! border border-solid p-0!",
	"border-transparent bg-[var(--button-icon-bg,transparent)] shadow-[var(--button-icon-shadow,none)] text-[var(--button-icon-text,var(--button-text))] hover:bg-[var(--button-icon-bg-hover,var(--button-bg-hover))] hover:text-[var(--button-text-hover)]",
	"active:bg-[var(--button-icon-bg-active,var(--button-bg-hover))] aria-expanded:bg-[var(--button-icon-bg-active,var(--button-bg-hover))] aria-pressed:bg-[var(--button-icon-bg-active,var(--button-bg-hover))] data-[state=open]:bg-[var(--button-icon-bg-active,var(--button-bg-hover))]",
	"aria-expanded:text-[var(--button-icon-text-active,var(--button-text-hover))] aria-pressed:text-[var(--button-icon-text-active,var(--button-text-hover))] data-[state=open]:text-[var(--button-icon-text-active,var(--button-text-hover))]",
];

// The button element; `variant` picks shape/role, `surface` picks page or modal tokens, `tone` picks color, `fullWidth` stretches it to fill its container.
export const buttonVariants = cva(
	[
		"btn inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5",
		"rounded-full border border-solid",
		"px-3 py-2.5",
		"no-underline",
		// Icon-only while keeping the variant's fill/outline inside compact action groups.
		"in-data-[button-compact]:w-[var(--button-height,2.375rem)] in-data-[button-compact]:gap-0! in-data-[button-compact]:px-0! in-data-[button-compact]:[&_.btn-label]:hidden",
		// Washed out/lighter in light mode, dimmer/darker in dark mode.
		"disabled:cursor-not-allowed disabled:brightness-110 dark:disabled:brightness-75",
		"aria-disabled:cursor-not-allowed aria-disabled:brightness-110 dark:aria-disabled:brightness-75",
	],
	{
		variants: {
			size: { default: "", small: "" },
			variant: {
				default: filledClassName,
				nav: [
					"btn-nav min-h-6! justify-start border-transparent bg-transparent pr-0! pl-[var(--nav-item-inset,0px)]! py-0!",
					// --nav-hover-bg/--nav-active-bg: the green nav-area theme, not the shared gray --nav-button-bg-hover/-active.
					"text-[var(--app-icon)] hover:bg-[var(--nav-item-hover-bg,var(--nav-hover-bg))] active:bg-[var(--nav-item-hover-bg,var(--nav-hover-bg))]",
					// !important: hover: and aria-[current=page]: are equal specificity, or hovering the current page would lose its active color.
					"aria-[current=page]:bg-[var(--nav-item-active-bg,var(--nav-active-bg))]! aria-[current=page]:text-[var(--nav-active-text)]",
					"[--focus-ring:var(--app-theme)]",
					// Negative offset - NavBar.module.css's .root has overflow:hidden, which clips a ring rendered outside the button.
					"focus-visible:outline-offset-[-2px]!",
				],
				action: ["btn-action relative", filledClassName],
				// Rounded icon+text pill (e.g. PrintLink) - a real bordered/filled button, not the plain inline `text` link below.
				link: ["btn-link rounded-full!", filledClassName],
				// Plain inline text link, no box - for a small call-to-action sitting inline with surrounding content.
				text: [
					"btn-text min-h-0! justify-start border-transparent bg-transparent p-0!",
					"text-inherit hover:text-[var(--app-title)] hover:underline hover:underline-offset-[0.14em] active:text-[var(--app-title)] active:underline",
				],
				// Square, icon-only trigger (filter/theme popovers, card hover actions,
				// a lone print/add button) - a fixed h-9 w-9 grid cell, not a text row,
				// so it opts out of every base flex/padding/radius utility that assumes
				// text content (! forces the override - see the "link" variant's own
				// rounded-full! for the same technique against the same base rule).
				icon: iconOnlyClassName,
				tool: iconOnlyClassName,
			},
			surface: {
				page: [
					"[--button-bg:var(--page-button-bg,transparent)] [--button-bg-hover:var(--page-button-bg-hover)] [--button-bg-active:var(--page-button-bg-active,var(--page-button-bg-hover))] [--button-icon-bg-hover:var(--page-icon-bg-hover,var(--page-button-bg-hover))] [--button-icon-bg-active:var(--page-icon-bg-active,var(--page-button-bg-active,var(--page-button-bg-hover)))]",
					"[--button-cta:var(--page-button-cta)] [--button-cta-hover:var(--page-button-cta-hover,var(--page-button-cta))] [--button-cta-text:var(--page-button-cta-text)]",
					"[--button-border:var(--page-button-border,transparent)] [--button-border-hover:var(--page-button-border-hover,var(--page-button-border,transparent))]",
					"[--button-text:var(--page-button-text)] [--button-text-hover:var(--page-button-text-hover)]",
					"[--button-icon-bg:var(--page-icon-bg,transparent)] [--button-icon-shadow:var(--page-icon-shadow,none)] [--button-icon-text:var(--page-icon-text,var(--page-button-text))] [--button-icon-text-active:var(--page-icon-text-active,var(--page-button-text-hover))]",
				],
				modal: "",
			},
			tone: {
				default: "",
				neutral:
					"tone-neutral border-transparent [--button-ring:transparent] [--button-ring-hover:transparent] [--button-bg-active:var(--tone-neutral-bg-hover)] [--button-text-active:var(--tone-neutral-text)] bg-[var(--tone-neutral-bg)] text-[var(--tone-neutral-text)] hover:border-transparent hover:bg-[var(--tone-neutral-bg-hover)]",
				success:
					"tone-success border-transparent [--button-ring:transparent] [--button-ring-hover:transparent] [--button-bg-active:var(--tone-success-bg-hover)] [--button-text-active:var(--tone-success-button-text,var(--tone-success-text))] bg-[var(--tone-success-bg)] text-[var(--tone-success-button-text,var(--tone-success-text))] hover:border-transparent hover:bg-[var(--tone-success-bg-hover)]",
				danger:
					"tone-danger border-transparent [--button-ring:transparent] [--button-ring-hover:transparent] [--button-bg-active:var(--tone-danger-bg-hover)] [--button-text-active:var(--tone-danger-button-text,var(--tone-danger-text))] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-button-text,var(--tone-danger-text))] hover:border-transparent hover:bg-[var(--tone-danger-bg-hover)]",
				cta: "tone-cta [--button-ring:transparent]! [--button-ring-hover:transparent]! [box-shadow:var(--button-cta-shadow,none)]! hover:[box-shadow:var(--button-cta-shadow,none)]! border-transparent! bg-[var(--button-cta)]! text-[var(--button-cta-text)]! hover:border-transparent! hover:bg-[var(--button-cta-hover)]! hover:text-[var(--button-cta-text)]! active:bg-[var(--button-cta-hover)]! aria-expanded:bg-[var(--button-cta-hover)]! aria-pressed:bg-[var(--button-cta-hover)]! data-[state=open]:bg-[var(--button-cta-hover)]! active:text-[var(--button-cta-text)]! aria-expanded:text-[var(--button-cta-text)]! aria-pressed:text-[var(--button-cta-text)]! data-[state=open]:text-[var(--button-cta-text)]!",
			},
			fullWidth: {
				true: "w-full",
				false: "",
			},
		},
		// for page action icons
		compoundVariants: [
			{
				variant: ["icon", "tool"],
				size: "small",
				class: "h-9! w-9!",
			},
			{
				variant: ["icon", "tool"],
				surface: "modal",
				class: "[--button-icon-bg-hover:var(--modal-icon-bg-hover,var(--button-bg-hover))] [--button-icon-bg-active:var(--modal-icon-bg-hover,var(--button-bg-hover))] [--button-text-hover:var(--button-text)] [--action-delete-text-hover:var(--action-delete-text)]",
			},
			{
				variant: ["default", "action", "link"],
				class: "h-[var(--button-height,2.375rem)]! min-h-0! py-0!",
			},
			{
				variant: "text",
				surface: "page",
				class: "[--button-icon-size:1.25rem]!",
			},
			{
				variant: "action",
				tone: "success",
				class: "border-transparent! [--button-ring:var(--button-border,transparent)]! bg-[var(--button-bg)]! text-[var(--action-add-text)]! hover:border-transparent! hover:bg-[var(--action-add-bg)]/50! active:bg-[var(--action-add-bg)]!",
			},
			{
				variant: "action",
				tone: "danger",
				class: "border-transparent! [--button-ring:var(--button-border,transparent)]! [--button-ring-hover:var(--button-border-hover,transparent)]! bg-[var(--button-bg)]! text-[var(--button-text)]! [--button-icon-color:var(--action-delete-text)] hover:border-transparent! hover:bg-[var(--action-delete-bg-hover)]/50! hover:text-[var(--action-delete-text-hover)]! hover:[--button-icon-color:currentColor] active:bg-[var(--action-delete-bg-hover)]!",
			},
			{
				variant: ["icon", "tool"],
				tone: "danger",
				class: "border-transparent! bg-[var(--button-icon-bg,transparent)]! text-[var(--button-danger-icon-text,var(--action-delete-text))]! hover:border-transparent! hover:bg-[var(--button-icon-bg-hover,var(--button-bg-hover))]! hover:text-[var(--action-delete-text-hover)]! active:bg-[var(--button-icon-bg-active,var(--button-bg-hover))]! aria-pressed:bg-[var(--action-delete-bg-hover)]!",
			},
		],
		defaultVariants: {
			size: "default",
			variant: "default",
			surface: "modal",
			tone: "default",
			fullWidth: false,
		},
	},
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
export type ButtonSurface = NonNullable<VariantProps<typeof buttonVariants>["surface"]>;
export type ButtonTone = NonNullable<VariantProps<typeof buttonVariants>["tone"]>;

// Icon size differs by variant - nav icons run larger than the rest.
const iconSizeByVariant: Record<ButtonVariant, string> = {
	default: "h-5 w-5",
	nav: "h-[1.375rem] w-[1.375rem]",
	action: "h-[var(--button-icon-size,1.25rem)] w-[var(--button-icon-size,1.25rem)]",
	link: "h-5 w-5",
	text: "h-4 w-4",
	icon: "h-6 w-6",
	tool: "h-5 w-5",
};

// For a lone auto-width button (icon+text composed as plain children, not
// Button's own `icon` prop) - buttonIconClassName's absolute positioning
// below only looks right for a column of same-width action buttons.
export const actionButtonIconClassName = "h-[var(--button-icon-size,1.25rem)] w-[var(--button-icon-size,1.25rem)] flex-none bg-[var(--button-icon-color,currentColor)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

// Sizing/color for a button's icon, keyed off the button's own variant.
// "action" + iconPosition="start" pins the icon to a fixed left offset (so
// it stays column-aligned across sibling buttons with different text
// lengths, e.g. a row of Edit/Delete/Add) and lets the text center
// independently around it. iconPosition="end" has no such row to align
// against, so it just flows normally after the text instead.
export function buttonIconClassName(variant: ButtonVariant, iconPosition: "start" | "end" = "start") {
	return [
		iconSizeByVariant[variant],
		"flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
		variant === "action" && iconPosition === "start" && "absolute left-3 top-1/2 -translate-y-1/2",
	]
		.filter(Boolean)
		.join(" ");
}
