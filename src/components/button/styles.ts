import { cva, type VariantProps } from "class-variance-authority";

// The button element; `variant` picks shape/role, `tone` picks color, `fullWidth` stretches it to fill its container.
export const buttonVariants = cva(
	[
		"btn inline-flex min-h-9 cursor-pointer items-center justify-center gap-2",
		"rounded-md border border-solid",
		"px-3 py-2",
		"font-sans no-underline",
		"hover:brightness-95 dark:hover:brightness-125 active:brightness-90 dark:active:brightness-150",
		"focus-visible:outline-2 focus-visible:outline-offset-2",
		"active:outline-2 active:outline-offset-2",
		"disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60",
	],
	{
		variants: {
			variant: {
				default: ["border-[var(--button-border)] bg-[var(--btn-default-bg)] text-[var(--app-text)]"],
				nav: [
					"btn-nav justify-start border-transparent bg-transparent px-0! font-normal",
					// --nav-hover-bg/--nav-active-bg: the green nav-area theme, not the shared gray --nav-button-bg-hover/-active.
					"text-[var(--app-icon)] hover:bg-[var(--nav-hover-bg)]",
					// !important: hover: and aria-[current=page]: are equal specificity, or hovering the current page would lose its active color.
					"aria-[current=page]:bg-[var(--nav-active-bg)]! aria-[current=page]:font-semibold aria-[current=page]:text-[var(--nav-active-text)]",
					// Resets the base hover:brightness filter for the current-page item, otherwise it still visibly shifts on hover.
					"aria-[current=page]:hover:brightness-100",
					// Green focus/active ring, !important over tone="default"'s equal-specificity blue ring.
					"focus-visible:outline-[var(--app-theme)]! active:outline-[var(--app-theme)]!",
					// Negative offset, not the base outline-offset-2 - NavBar.module.css's
					// .root has overflow:hidden (deliberately, so the rail doesn't scroll as
					// one unit), which clips a ring rendered outside the button. Inside, it can't be.
					"focus-visible:outline-offset-[-2px]! active:outline-offset-[-2px]!",
				],
				action: ["btn-action relative border-[var(--button-border)] bg-[var(--action-item-bg)] text-[var(--app-text)]"],
				// Rounded icon+text pill (e.g. PrintLink) - a real bordered/filled button, not the plain inline `text` link below.
				link: ["btn-link rounded-full! border-[var(--button-border)] bg-[var(--action-item-bg)] text-[var(--app-text)]"],
				// Plain inline text link, no box - for a small call-to-action sitting inline with surrounding content.
				text: [
					"btn-text min-h-0! justify-start border-transparent bg-transparent p-0! font-normal",
					"text-inherit hover:text-[var(--brand-color)] hover:underline hover:underline-offset-[0.14em]",
				],
			},
			tone: {
				// Blue - the modal/NavContent/generic focus ring; variant="nav" overrides back to green above.
				default: "focus-visible:outline-[var(--focus-ring)] active:outline-[var(--focus-ring)]",
				success:
					"tone-success border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-text)] focus-visible:outline-[var(--tone-success-border)] active:outline-[var(--tone-success-border)]",
				danger:
					"tone-danger border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-btn-text)] focus-visible:outline-[var(--tone-danger-border)] active:outline-[var(--tone-danger-border)]",
			},
			fullWidth: {
				true: "w-full",
				false: "",
			},
		},
		// NavContent's manage-bar isn't a real modal, so its own Add/Delete
		// buttons stay subtle: text/icon (currentColor) carry the tint always;
		// bg/border stay neutral (variant="action"'s own look) at rest, a
		// lighter (/50 opacity) wash on hover, and the full-strength color once
		// actually pressed or - for delete - in delete mode (ActionModeButton's
		// own isActive override, same full-strength tokens). The unconditional
		// border-/bg-[var(--button-border|btn-default-bg)]! here isn't
		// decorative - tone.success/tone.danger above set their own bold bg
		// unconditionally too, with no hover:/active: prefix, so without this
		// override the plain (higher-specificity-losing but still-matching)
		// base rule would keep winning at rest. `!` on all of these forces them
		// over variant/tone's own border/bg/text, which would otherwise tie on
		// specificity and let stylesheet order decide the winner.
		compoundVariants: [
			{
				variant: "action",
				tone: "default",
				class: "hover:bg-black/10! dark:hover:bg-white/40! hover:brightness-100! dark:hover:brightness-100!",
			},
			{
				variant: "action",
				tone: "success",
				class: "border-[var(--button-border)]! bg-[var(--action-item-bg)]! text-[var(--action-add-text)]! hover:border-[var(--action-add-border)]/50! hover:bg-[var(--action-add-bg)]/50! active:border-[var(--action-add-border)]! active:bg-[var(--action-add-bg)]! focus-visible:outline-[var(--action-add-border)]! active:outline-[var(--action-add-border)]! hover:brightness-98! dark:hover:brightness-105! active:brightness-97! dark:active:brightness-97!",
			},
			{
				variant: "action",
				tone: "danger",
				class: "border-[var(--button-border)]! bg-[var(--action-item-bg)]! text-[var(--action-delete-text)]! hover:border-[var(--action-delete-border)]/50! hover:bg-[var(--action-delete-bg)]/50! active:border-[var(--action-delete-border)]! active:bg-[var(--action-delete-bg)]! focus-visible:outline-[var(--action-delete-border)]! active:outline-[var(--action-delete-border)]! hover:brightness-98! dark:hover:brightness-105! active:brightness-97! dark:active:brightness-97!",
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
};

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
