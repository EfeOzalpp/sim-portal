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

// The label + FieldError row wrapper every field uses - h-5 matches
// FieldError's own text-sm line-height (1.25rem), so the row holds exactly
// that height whether or not an error is mounted.
export const fieldLabelRowClassName = "flex h-5 min-w-0 items-baseline justify-between gap-3";

// Sits beside its field's own label (same row, label left / this right), not
// below the input - so this is just the message text, sized to pair with a
// ui-label rather than body text.
export function FieldError({ tone = "error", children }: FieldErrorProps) {
	return (
		<span className={clsx("block max-w-[65%] flex-none truncate whitespace-nowrap pr-1 text-sm italic", toneClassName[tone])}>
			{children}
		</span>
	);
}

export default FieldError;
