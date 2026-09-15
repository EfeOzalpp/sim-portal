import type {
	AnchorHTMLAttributes,
	ButtonHTMLAttributes,
	Ref,
} from "react";
import Link from "next/link";
import clsx from "clsx";
import { buttonIconClassName, buttonVariants, type ButtonTone, type ButtonVariant } from "@/components/button/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import type { IconName } from "@/theme/icons";

export type { ButtonTone, ButtonVariant } from "@/components/button/styles";

interface SharedButtonProps {
	/** Controls the button's structure and visual treatment. */
	variant?: ButtonVariant;
	/** Changes only the semantic color palette. */
	tone?: ButtonTone;
	fullWidth?: boolean;
	className?: string;
	/** A registered icon name (see theme/icons.ts). Sized automatically per variant. */
	icon?: IconName;
	/** Which side of the text the icon renders on. Defaults to "start". */
	iconPosition?: "start" | "end";
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

function ButtonIcon({ icon, variant, iconPosition }: { icon: IconName; variant: ButtonVariant; iconPosition: "start" | "end" }) {
	return <MaskIcon icon={icon} className={buttonIconClassName(variant, iconPosition)} />;
}

export function Button(props: ButtonProps) {
	const {
		variant = "default",
		tone = "default",
		fullWidth = false,
		className,
		icon,
		iconPosition = "start",
		href,
		disabled = false,
		ref,
		children,
		...elementProps
	} = props;
	const finalClassName = clsx(buttonVariants({ variant, tone, fullWidth }), className);
	const iconElement = icon && <ButtonIcon icon={icon} variant={variant} iconPosition={iconPosition} />;
	// Only iconPosition="start" pins the icon absolutely (see
	// buttonIconClassName) - the text needs a matching shift to clear it.
	// "end" has no absolute icon to work around; it just flows normally
	// after the text via the button's own gap-2, no shift needed.
	const shiftedChildren =
		icon && variant === "action" && iconPosition === "start" ? (
			<span className="inline-block translate-x-[0.625rem]">{children}</span>
		) : (
			children
		);
	const content =
		iconPosition === "end" ? (
			<>
				{shiftedChildren}
				{iconElement}
			</>
		) : (
			<>
				{iconElement}
				{shiftedChildren}
			</>
		);

	if (href !== undefined) {
		const { tabIndex, ...anchorProps } = elementProps as AnchorHTMLAttributes<HTMLAnchorElement>;
		// A plain <a> forces a full browser navigation - fine (required, even)
		// for genuinely external links, but every internal one was silently
		// doing a full page reload instead of a Next.js client-side transition:
		const isExternal = anchorProps.target === "_blank" || /^https?:\/\//.test(href);

		if (disabled || isExternal) {
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

		return (
			<Link
				{...anchorProps}
				ref={ref as Ref<HTMLAnchorElement>}
				href={href}
				tabIndex={tabIndex}
				className={finalClassName}
			>
				{content}
			</Link>
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