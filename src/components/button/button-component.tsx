import type {
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
	Ref,
} from "react";
import clsx from "clsx";

export type ButtonVariant = "default" | "nav" | "action" | "link";
export type ButtonTone = "default" | "success" | "danger";

interface SharedButtonProps {
	/** Controls the button's structure and visual treatment. */
	variant?: ButtonVariant;
	/** Changes only the semantic color palette. */
	tone?: ButtonTone;
	fullWidth?: boolean;
	className?: string;
}

export type NativeButtonProps = SharedButtonProps &
	Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedButtonProps> & {
		href?: never;
		ref?: Ref<HTMLButtonElement>;
	};

type AnchorButtonProps = SharedButtonProps &
	Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedButtonProps | "href"> & {
		href: string;
		disabled?: boolean;
		ref?: Ref<HTMLAnchorElement>;
	};

export type ButtonProps = NativeButtonProps | AnchorButtonProps;

interface ButtonClassNameOptions {
	variant: ButtonVariant;
	tone: ButtonTone;
	fullWidth: boolean;
	className?: string;
}

// Values below are transcribed from src/components/theme/tokens/button.ts
// (the antd Button theme this replaces) and its light/dark pairs, so this
// component renders pixel-identical to what antd was producing.
const variantClasses: Record<ButtonVariant, string> = {
	default: "",
	// antd's "text" variant had no distinct :active (press) color of its own —
	// only hover — so --button-*-active is intentionally left unset here and
	// falls through to the hover value via getButtonClassName's fallback
	// chain. aria-[current=page] is a separate, unrelated "this is the current
	// nav link" indicator (not a hover/press state), styled independently.
	nav: "justify-start border-transparent bg-transparent px-0 font-normal hover:border-transparent active:border-transparent [--button-bg-hover:#efefef] [--button-text:#717171] [--button-text-hover:#3b3b3b] aria-[current=page]:bg-[#dfdfdf] aria-[current=page]:font-semibold aria-[current=page]:text-black dark:[--button-bg-hover:#2d2d2d] dark:[--button-text:#adadad] dark:[--button-text-hover:#fff] dark:aria-[current=page]:bg-[#3b3b3b] dark:aria-[current=page]:text-white",
	// antd's "outlined" variant, default color — background changes with
	// hover/active, border and text stay constant across all three states.
	action:
		"[--button-bg:#ffffff] [--button-bg-hover:#f7f7f7] [--button-bg-active:#f7f7f7] [--button-border:#d9d9d9] [--button-border-hover:#d9d9d9] [--button-border-active:#d9d9d9] [--button-text:#000000] [--button-text-hover:#000000] [--button-text-active:#000000] dark:[--button-bg:#242424] dark:[--button-bg-hover:#303030] dark:[--button-bg-active:#383838] dark:[--button-border:#333333] dark:[--button-border-hover:#333333] dark:[--button-border-active:#333333] dark:[--button-text:#ffffff] dark:[--button-text-hover:#ffffff] dark:[--button-text-active:#ffffff]",
	// antd's "filled" variant, default color. Text intentionally left unset —
	// it falls back to var(--app-text) via getButtonClassName, same as antd's
	// own CSS override for this one (its color token is otherwise shared with
	// action's border, which isn't meaningful for text).
	link: "rounded-full border-transparent hover:border-transparent active:border-transparent [--button-bg:#ffffff] [--button-bg-hover:#f7f7f7] [--button-bg-active:#ffffff] dark:[--button-bg:#1f1f1f] dark:[--button-bg-hover:#242424] dark:[--button-bg-active:#1a1a1a]",
};

const toneClasses: Record<ButtonTone, string> = {
	default: "",
	success:
		"[--button-bg:#dff3e6] [--button-bg-active:#b9e2c9] [--button-bg-hover:#ccebd8] [--button-border:#b9e2c9] [--button-border-active:#98c9ad] [--button-border-hover:#a8d3ba] [--button-text:#143821] dark:[--button-bg:#4c7154] dark:[--button-bg-active:#679b6a] dark:[--button-bg-hover:#59855e] dark:[--button-border:#548a69] dark:[--button-border-active:#72a77c] dark:[--button-border-hover:#659872] dark:[--button-text:#eefcf2]",
	danger:
		"[--button-bg:#f7dddd] [--button-bg-active:#e7bbbb] [--button-bg-hover:#efcccc] [--button-border:#e4baba] [--button-border-active:#cf9696] [--button-border-hover:#d9a8a8] [--button-text:#421717] dark:[--button-bg:#462d2d] dark:[--button-bg-active:#633e3e] dark:[--button-bg-hover:#553535] dark:[--button-border:#6f4747] dark:[--button-border-active:#8d5a5a] dark:[--button-border-hover:#805252] dark:[--button-text:#fff0f0]",
};

function getButtonClassName({
	variant,
	tone,
	fullWidth,
	className,
}: ButtonClassNameOptions) {
	return clsx(
		// "btn" (+ "btn-{variant}"/"tone-{tone}" below) are stable hook classes —
		// several layout stylesheets (NavBar, NavContent, ActionMode,
		// MobileContentBar) target the rendered button from outside to control
		// width/justify/padding and force a "pressed" look while a mode is
		// toggled on. antd's Button always rendered class="ant-btn", which
		// those stylesheets used as their hook; this replaces that hook now
		// that nothing renders antd's Button anymore.
		"btn",
		variant !== "default" && `btn-${variant}`,
		tone !== "default" && `tone-${tone}`,
		"inline-flex min-h-9 cursor-pointer items-center justify-center gap-[var(--gap-sm)] rounded-[var(--border-sm)] border-[length:var(--app-border-width)] border-solid border-[var(--button-border,var(--app-border))] bg-[var(--button-bg,var(--app-surface))] px-[var(--spacing-md)] py-[var(--spacing-sm)] font-[family-name:var(--font-family-body)] font-semibold text-[var(--button-text,var(--app-text))] transition-colors hover:border-[var(--button-border-hover,var(--app-border))] hover:bg-[var(--button-bg-hover,var(--app-subtle))] hover:text-[var(--button-text-hover,var(--button-text,var(--app-text)))] active:border-[var(--button-border-active,var(--button-border-hover,var(--app-border)))] active:bg-[var(--button-bg-active,var(--button-bg-hover,var(--app-subtle)))] active:text-[var(--button-text-active,var(--button-text-hover,var(--button-text,var(--app-text))))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-theme)] disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60",
		variantClasses[variant],
		toneClasses[tone],
		fullWidth && "w-full",
		className,
	);
}

export function Button(props: ButtonProps) {
	const {
		variant = "default",
		tone = "default",
		fullWidth = false,
		className,
		href,
		disabled = false,
		ref,
		...elementProps
	} = props;
	const finalClassName = getButtonClassName({ variant, tone, fullWidth, className });

	if (href !== undefined) {
		const { tabIndex, ...anchorProps } = elementProps as AnchorHTMLAttributes<HTMLAnchorElement>;

		return (
			<a
				{...anchorProps}
				ref={ref as Ref<HTMLAnchorElement>}
				href={disabled ? undefined : href}
				aria-disabled={disabled || undefined}
				tabIndex={disabled ? -1 : tabIndex}
				className={finalClassName}
			/>
		);
	}

	const { type = "button", ...buttonProps } = elementProps as ButtonHTMLAttributes<HTMLButtonElement>;

	return (
		<button
			{...buttonProps}
			ref={ref as Ref<HTMLButtonElement>}
			type={type}
			disabled={disabled}
			className={finalClassName}
		/>
	);
}

export default Button;
