import type { ReactNode } from "react";
import clsx from "clsx";
import { getStringColors } from "@/constants/stringColors";

interface StringLabelProps {
	colorKey: string;
	children: ReactNode;
	className?: string;
}

export default function StringLabel({ colorKey, children, className }: StringLabelProps) {
	const colors = getStringColors(colorKey);

	return (
		<span
			className={clsx("ui-label-compact inline-flex w-fit max-w-full flex-none items-center rounded-none border-0 border-b border-solid bg-transparent px-0 pb-0.5 whitespace-nowrap", className)}
			style={{ borderBottomColor: colors.bg, color: colors.text }}
		>
			{children}
		</span>
	);
}
