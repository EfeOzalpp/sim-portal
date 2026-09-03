import type {
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
	Ref,
} from "react";
import clsx from "clsx";
import { buttonIconClassName, buttonVariants, type ButtonTone, type ButtonVariant } from "@/components/button/styles";
import { MaskIcon } from "@/components/theme/MaskIcon";
import type { IconName } from "@/components/theme/icons";

export type { ButtonTone, ButtonVariant } from "@/components/button/styles";

interface SharedButtonProps {
	/** Controls the button's structure and visual treatment. */
	variant?: ButtonVariant;
	/** Changes only the semantic color palette. */
	tone?: ButtonTone;
	fullWidth?: boolean;
	className?: string;
	/** A registered icon name (see components/theme/icons.ts). Sized automatically per variant. */
	icon?: IconName;
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

function ButtonIcon({ icon, variant }: { icon: IconName; variant: ButtonVariant }) {
	return <MaskIcon icon={icon} className={buttonIconClassName(variant)} />;
}

export function Button(props: ButtonProps) {
	const {
		variant = "default",
		tone = "default",
		fullWidth = false,
		className,
		icon,
		href,
		disabled = false,
		ref,
		children,
		...elementProps
	} = props;
	const finalClassName = clsx(buttonVariants({ variant, tone, fullWidth }), className);
	const content = (
		<>
			{icon && <ButtonIcon icon={icon} variant={variant} />}
			{children}
		</>
	);

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
			>
				{content}
			</a>
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
		>
			{content}
		</button>
	);
}

export default Button;