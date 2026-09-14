import type { ReactNode } from "react";
import clsx from "clsx";

interface FieldErrorProps {
	/** "error": the field is missing something it needs (required, etc). "warning": something was entered but doesn't look right (pattern, format, etc). */
	tone?: "error" | "warning";
	children: ReactNode;
}

const toneClassName = {
	error: "text-[var(--tone-danger-text)]",
	warning: "text-[var(--tone-warning-text)]",
};

export function FieldError({ tone = "error", children }: FieldErrorProps) {
	return (
		<span className={clsx("block pt-2 pl-1", toneClassName[tone])}>
			{children}
		</span>
	);
}

export default FieldError;
