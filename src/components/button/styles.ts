import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
	[
		"btn inline-flex min-h-9 cursor-pointer items-center justify-center gap-[var(--gap-sm)]",
		"rounded-[var(--border-sm)] border-[length:var(--app-border-width)] border-solid",
		"px-[var(--spacing-md)] py-[var(--spacing-sm)]",
		"font-[family-name:var(--font-family-base)] font-semibold no-underline",
		"transition hover:brightness-95 active:brightness-90",
		"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-theme)]",
		"disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60",
	],
	{
		variants: {
			variant: {
				default: ["border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"],
				nav: [
					"btn-nav justify-start border-transparent bg-transparent px-0 font-normal",
					"text-[var(--app-icon)] hover:bg-[var(--nav-button-bg-hover)]",
					"aria-[current=page]:bg-[#dfdfdf] aria-[current=page]:font-semibold aria-[current=page]:text-black",
					"dark:aria-[current=page]:bg-[#3b3b3b] dark:aria-[current=page]:text-white",
				],
				action: [
					"btn-action border-[var(--app-border)] bg-[var(--app-surface)] text-[#000000]",
					"dark:bg-[var(--app-subtle)] dark:text-[#ffffff]",
				],
				link: [
					"btn-link rounded-full border-transparent bg-[var(--app-surface)] text-[var(--app-text)]",
					"dark:bg-[var(--app-secondary)]",
				],
			},
			tone: {
				default: "",
				success: "tone-success border-[var(--tone-success-border)] bg-[var(--tone-success-bg)] text-[var(--tone-success-text)]",
				danger: "tone-danger border-[var(--tone-danger-border)] bg-[var(--tone-danger-bg)] text-[var(--tone-danger-text)]",
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
	default: "h-[var(--svg-size-sm)] w-[var(--svg-size-sm)]",
	nav: "h-[var(--svg-size-md)] w-[var(--svg-size-md)]",
	action: "h-[var(--svg-size-sm)] w-[var(--svg-size-sm)]",
	link: "h-[var(--svg-size-sm)] w-[var(--svg-size-sm)]",
};

export function buttonIconClassName(variant: ButtonVariant) {
	return [
		iconSizeByVariant[variant],
		"flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
	].join(" ");
}
