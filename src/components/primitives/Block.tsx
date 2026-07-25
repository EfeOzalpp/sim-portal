import React, { forwardRef, ReactNode, ElementType, ComponentPropsWithRef } from "react";
import clsx from "clsx";
import Link from "next/link";

export interface BlockProps<T extends ElementType = "button"> {
	as?: T;
	children?: ReactNode;
	className?: string;
	disabled?: boolean;
	onClick?: (event: React.MouseEvent) => void;
	depth?: number;
	pressable?: boolean;
	href?: string;
}

// Type that combines BlockProps with the intrinsic props of the 'as' element
type CombinedProps<T extends ElementType> = BlockProps<T> & Omit<ComponentPropsWithRef<T>, keyof BlockProps<T>>;

const Block = forwardRef(function Block<T extends ElementType = "button">(
	props: CombinedProps<T>,
	ref: React.Ref<any>
) {
	const { 
		as = "button" as T, 
		children, 
		className, 
		disabled, 
		onClick, 
		pressable = false, 
		href, 
		...rest 
	} = props as any;

	const finalClassName = clsx(className);

	const isLink = href && !disabled;

	let Component: any;
	if (isLink && (as === "button" || as === "a")) {
		Component = Link;
	} else if (href && as === "button") {
		Component = "a";
	} else {
		Component = as;
	}

	const shouldWrap = isLink && Component !== Link;

	const element = (
		<Component
			{...rest}
			ref={ref}
			className={finalClassName}
			disabled={disabled}
			onClick={onClick}
			{...(href && !shouldWrap ? { href } : {})}
		>
			{children}
		</Component>
	);

	return (
		<div
			className={clsx(
				"relative inline-flex box-border align-top",
				pressable && "cursor-pointer",
				disabled && "cursor-not-allowed opacity-60",
			)}
		>
			{shouldWrap ? (
				<Link href={href!}>
					{element}
				</Link>
			) : (
				element
			)}
		</div>
	);
});

export default Block;
