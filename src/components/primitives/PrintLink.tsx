"use client";

import { Button, type ButtonVariant } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { MaskIcon } from "@/theme/MaskIcon";

interface PrintLinkProps {
	label?: string;
	className?: string;
	// "action" (icon+text composed as plain children, not Button's own icon
	// prop) - that prop's absolute-positioned icon + centered text exists for
	// columns of same-purpose action buttons, wrong for a lone button like this.
	variant?: ButtonVariant;
}

export default function PrintLink({ label = "Export pdf", className, variant = "text" }: PrintLinkProps) {
	return (
		<Button
			surface="page"
			type="button"
			variant={variant}
			className={className ?? (variant === "text" ? "pl-2!" : undefined)}
		>
			<MaskIcon icon="download/download.svg" className={actionButtonIconClassName} />
			{label}
		</Button>
	);
}
