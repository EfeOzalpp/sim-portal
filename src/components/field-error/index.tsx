import type { ReactNode } from "react";
import clsx from "clsx";
import { MaskIcon } from "@/theme/MaskIcon";

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
		<span className={clsx("flex items-center gap-1 pt-2 pl-1", toneClassName[tone])}>
			{tone === "error" && (
				<MaskIcon
					icon="error/error.svg"
					className="h-[1.375rem] w-[1.375rem] shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
				/>
			)}
			<span>{children}</span>
		</span>
	);
}

export default FieldError;
