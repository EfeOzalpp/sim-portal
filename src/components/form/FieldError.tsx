import type { ReactNode } from "react";
import clsx from "clsx";

export interface FieldErrorProps {
	/** "error": the field is missing something it needs (required, etc). "warning": something was entered but doesn't look right (pattern, format, etc). */
	tone?: "error" | "warning";
	children: ReactNode;
}

const toneClassName = {
	error: "text-[var(--tone-danger-text)]",
	warning: "text-[var(--tone-warning-text)]",
};

// Errors share the fixed-height label row without moving the control below it.
export const fieldLabelRowClassName = "flex h-5 min-w-0 shrink-0 items-center justify-between gap-3";

// Narrow fields truncate visually; the full message remains available on hover.
export function FieldError({ tone = "error", children }: FieldErrorProps) {
	return (
		<span
			className={clsx("ui-field-error block min-w-0 flex-1 truncate whitespace-nowrap pr-1 text-right", toneClassName[tone])}
			title={typeof children === "string" ? children : undefined}
		>
			{children}
		</span>
	);
}

export default FieldError;
