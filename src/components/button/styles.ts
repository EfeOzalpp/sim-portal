import { cva, type VariantProps } from "class-variance-authority";

// The button element; `variant` picks shape/role, `tone` picks color, `fullWidth` stretches it to fill its container.
export const buttonVariants = cva(
	[
		"btn inline-flex min-h-9 cursor-pointer items-center justify-center gap-2",
		"rounded-md border border-solid",
		"px-3 py-2",
		"font-sans no-underline",
		"focus-visible:outline-2 focus-visible:outline-offset-2",
		"active:outline-2 active:outline-offset-2",
		// Washed out/lighter in light mode, dimmer/darker in dark mode.
		"disabled:cursor-not-allowed disabled:brightness-110 dark:disabled:brightness-75",
		"aria-disabled:cursor-not-allowed aria-disabled:brightness-110 dark:aria-disabled:brightness-75",
	],
	{
		variants: {
			variant: {
				default: ["border-[var(--button-border)] bg-[var(--button-bg)] text-[var(--button-text)] hover:border-[var(--button-border-hover)] hover:bg-[var(--button-bg-hover)] hover:text-[var(--button-text-hover)]"],
				nav: [
					"btn-nav justify-start border-transparent bg-transparent px-0! font-normal",
					// --nav-hover-bg/--nav-active-bg: the green nav-area theme, not the shared gray --nav-button-bg-hover/-active.
					"text-[var(--app-icon)] hover:bg-[var(--nav-hover-bg)]",
					// !important: hover: and aria-[current=page]: are equal specificity, or hovering the current page would lose its active color.
					"aria-[current=page]:bg-[var(--nav-active-bg)]! aria-[current=page]:font-semibold aria-[current=page]:text-[var(--nav-active-text)]",
					// Green focus/active ring, !important over tone="default"'s equal-specificity blue ring.
					"focus-visible:outline-[var(--app-theme)]! active:outline-[var(--app-theme)]!",
					// Negative offset, not the base outline-offset-2 - NavBar.module.css's
					// .root has overflow:hidden (deliberately, so the rail doesn't scroll as
					// one unit), which clips a ring rendered outside the button. Inside, it can't be.
					"focus-visible:outline-offset-[-2px]! active:outline-offset-[-2px]!",
				],
				action: ["btn-action relative border-[var(--button-border)] bg-[var(--button-bg)] text-[var(--button-text)] hover:border-[var(--button-border-hover)] hover:bg-[var(--button-bg-hover)] hover:text-[var(--button-text-hover)]"],
				// Rounded icon+text pill (e.g. PrintLink) - a real bordered/filled button, not the plain inline `text` link below.
				link: ["btn-link rounded-full! border-[var(--button-border)] bg-[var(--button-bg)] text-[var(--button-text)] hover:border-[var(--button-border-hover)] hover:bg-[var(--button-bg-hover)] hover:text-[var(--button-text-hover)]"],
				// Plain inline text link, no box - for a small call-to-action sitting inline with surrounding content.
				text: [
					"btn-text min-h-0! justify-start border-transparent bg-transparent p-0! font-normal",
					"text-inherit hover:text-[var(--brand-color)] hover:underline hover:underline-offset-[0.14em]",
				],
				// Square, icon-only trigger (filter/theme popovers, card hover actions,
				// a lone print/add button) - a fixed h-9 w-9 grid cell, not a text row,
				// so it opts out of every base flex/padding/radius utility that assumes
				// text content (! forces the override - see the "link" variant's own
				// rounded-full! for the same technique against the same base rule).
				icon: [
					"inline-grid! h-9 w-9 flex-none place-items-center! gap-0! rounded-lg! border border-solid p-0!",
					"border-[var(--button-border)] bg-[var(--button-bg)] text-[var(--button-text)] hover:border-[var(--button-border-hover)] hover:bg-[var(--button-bg-hover)] hover:text-[var(--button-text-hover)]",
				],
			},
			tone: {
				// Blue - the modal/NavContent/generic focus ring; variant="nav" overrides back to green above.
				default: "focus-visible:outline-[var(--focus-ring)] active:outline-[var(--focus-ring)]",
				success:
					"tone-success border-transparent bg-[var(--tone-success-bg)] text-[var(--tone-success-text)] focus-visible:outline-transparent active:outline-transparent",
				danger:
					"tone-danger border-transparent bg-[var(--tone-danger-bg)] text-[var(--tone-danger-btn-text)] focus-visible:outline-transparent active:outline-transparent",
			},
			fullWidth: {
				true: "w-full",
				false: "",
			},
		},
		// for page action icons
		compoundVariants: [
			{
				variant: "action",
				tone: "success",
				class: "border-[var(--button-border)]! bg-[var(--button-bg)]! text-[var(--action-add-text)]! hover:border-[var(--action-add-border)]/50! hover:bg-[var(--action-add-bg)]/50! active:border-[var(--action-add-border)]! active:bg-[var(--action-add-bg)]! focus-visible:outline-[var(--action-add-border)]! active:outline-[var(--action-add-border)]!",
			},
			{
				variant: "action",
				tone: "danger",
				class: "border-[var(--button-border)]! bg-[var(--button-bg)]! text-[var(--action-delete-text)]! hover:border-[var(--action-delete-border-hover)]! hover:bg-[var(--action-delete-bg-hover)]/50! hover:text-[var(--action-delete-text-hover)]! active:border-[var(--action-delete-border)]! active:bg-[var(--action-delete-bg-hover)]! focus-visible:outline-[var(--action-delete-border)]! active:outline-[var(--action-delete-border)]!",
			},
			// Unlike action+danger above, this one IS colored (text) at rest - these
			// are card hover-reveal buttons, already hidden until hovered. Border/bg
			// still wait for hover though, same as action+danger's own gating.
			// hover:bg goes through --button-bg-hover (not a hardcoded
			// --action-delete-bg-hover) so a card overlay context can scope it to
			// its own --button-delete-overlay-bg-hover, same mechanism the rest-state
			// bg above already uses via --button-bg.
			{
				variant: "icon",
				tone: "danger",
				class: "border-[var(--button-border)]! bg-[var(--button-bg)]! text-[var(--action-delete-text)]! hover:border-[var(--action-delete-border-hover)]! hover:bg-[var(--button-bg-hover)]! hover:text-[var(--action-delete-text-hover)]!",
			},
		],
		defaultVariants: {
			variant: "default",
			tone: "default",
			fullWidth: false,
		},
	},
);

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
export type ButtonTone = NonNullable<VariantProps<typeof buttonVariants>["tone"]>;

// Icon size differs by variant - nav icons run larger than the rest.
const iconSizeByVariant: Record<ButtonVariant, string> = {
	default: "h-5 w-5",
	nav: "h-[1.375rem] w-[1.375rem]",
	action: "h-5 w-5",
	link: "h-5 w-5",
	text: "h-4 w-4",
	icon: "h-4 w-4",
};

// For a lone auto-width button (icon+text composed as plain children, not
// Button's own `icon` prop) - buttonIconClassName's absolute positioning
// below only looks right for a column of same-width action buttons.
export const actionButtonIconClassName = "h-4 w-4 flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

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
