import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
	[
		"btn inline-flex min-h-9 cursor-pointer items-center justify-center gap-2",
		"rounded-md border border-solid",
		"px-4 py-2",
		"font-sans font-semibold no-underline",
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
					"aria-[current=page]:bg-[var(--nav-button-bg-active)] aria-[current=page]:font-semibold aria-[current=page]:text-[var(--app-text)]",
				],
				action: ["btn-action border-[var(--app-border)] bg-[var(--btn-default-bg)] text-[var(--app-text)]"],
				link: ["btn-link rounded-full! border-[var(--app-border)] bg-[var(--btn-default-bg)] text-[var(--app-text)]"],
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

const iconSizeByVariant: Record<ButtonVariant, string> = {
	default: "h-4 w-4",
	nav: "h-[1.375rem] w-[1.375rem]",
	action: "h-4 w-4",
	link: "h-4 w-4",
};

export function buttonIconClassName(variant: ButtonVariant) {
	return [
		iconSizeByVariant[variant],
		"flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
	].join(" ");
}
