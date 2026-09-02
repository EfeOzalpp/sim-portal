import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import Block from "@/components/primitives/Block";

// Split out of the AntD.tsx barrel so routes that only need a Button (like
// /users' base render) don't drag in Table/Transfer/DatePicker/Upload/Modal
// and the rest of that barrel's antd import graph. Import this file directly
// (not via "@/components/primitives/AntD") wherever compile-time isolation
// from the rest of antd matters.
export interface ButtonProps extends Omit<AntButtonProps, "type"> {
	href?: string;
	type?: AntButtonProps["type"] | "submit";
}

const BUTTON_KIND_PROPS: Record<string, Partial<AntButtonProps>> = {
	"nav-button": { variant: "text", color: "default" },
	"action-button": { variant: "outlined", color: "default" },
	"link-button": { variant: "filled", color: "default", shape: "round" },
	"accept-button": { variant: "filled", color: "green" },
	"decline-button": { variant: "filled", color: "danger" },
};

function resolveButtonKindProps(className?: string): Partial<AntButtonProps> | undefined {
	if (!className) return undefined;
	const kind = className.split(" ").find((cls) => cls in BUTTON_KIND_PROPS);
	return kind ? BUTTON_KIND_PROPS[kind] : undefined;
}

export function Button({ href, onClick, children, type, htmlType, className, ...props }: ButtonProps) {
	const finalHtmlType = htmlType || (type === "submit" ? "submit" : undefined);
	const finalType = type === "submit" ? "primary" : type;
	const kindProps = resolveButtonKindProps(className);

	return (
		<Block
			as={AntButton}
			href={href}
			onClick={onClick as any}
			htmlType={finalHtmlType}
			type={finalType as any}
			className={className}
			{...kindProps}
			{...props}
			pressable={true}
		>
			{children}
		</Block>
	);
}
