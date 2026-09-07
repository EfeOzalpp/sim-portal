import { cva, type VariantProps } from "class-variance-authority";

// The button element itself; `variant` picks its shape/role (plain button, nav
// link, page-level action, rounded icon+text pill, plain inline text link),
// `tone` picks its color, `fullWidth` stretches it to fill its container.
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
				default: ["border-[var(--app-border)] bg-[var(--btn-default-bg)] text-[var(--app-text)]"],
				nav: [
					"btn-nav justify-start border-transparent bg-transparent px-0! font-normal",
					"text-[var(--app-icon)] hover:bg-[var(--nav-button-bg-hover)]",
					// !important: hover: and aria-[current=page]: are equal
					// specificity, so without this, hovering the current-page item
					// would show the plain hover color instead of staying marked active.
					"aria-[current=page]:bg-[var(--nav-button-bg-active)]! aria-[current=page]:font-semibold aria-[current=page]:text-[var(--app-text)]",
					// Resets the base hover:brightness filter (below) for the
					// current-page item specifically - otherwise it still visibly
					// darkens/lightens on hover even with the bg-color fixed above.
					"aria-[current=page]:hover:brightness-100",
				],
				action: ["btn-action border-[var(--app-border)] bg-[var(--btn-default-bg)] text-[var(--app-text)]"],
				// Rounded icon+text pill (e.g. PrintLink) - despite the name, this
				// is a real bordered/filled button, not a plain inline link; see
				// `text` below for that.
				link: ["btn-link rounded-full! border-[var(--app-border)] bg-[var(--btn-default-bg)] text-[var(--app-text)]"],
				// A plain inline text link with no box around it at all - no
				// border, no background, no fixed height/padding - for a small
				// call-to-action sitting inline with surrounding text/content.
				text: [
					"btn-text min-h-0! justify-start border-transparent bg-transparent p-0! font-normal",
					"text-inherit hover:text-[var(--brand-color)] hover:underline hover:underline-offset-[0.14em]",
				],
			},
			tone: {
				default: "focus-visible:outline-[var(--app-theme)] active:outline-[var(--app-theme)]",
				success:
					"tone-success border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-text)] focus-visible:outline-[var(--tone-success-border)] active:outline-[var(--tone-success-border)]",
				danger:
					"tone-danger border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-text)] focus-visible:outline-[var(--tone-danger-border)] active:outline-[var(--tone-danger-border)]",
			},
			fullWidth: {
				true: "w-full",
				false: "",
			},
		},
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

// Sizing/color for a button's leading icon, keyed off the button's own variant.
export function buttonIconClassName(variant: ButtonVariant) {
	return [
		iconSizeByVariant[variant],
		"flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
	].join(" ");
}
