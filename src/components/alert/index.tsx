import type { ReactNode } from "react";
import clsx from "clsx";
import {
	alertCloseButtonClassName,
	alertDescriptionClassName,
	alertIconClassName,
	alertVariants,
} from "@/components/alert/styles";

export type AlertTone = "success" | "danger" | "warning" | "info";

interface AlertProps {
	tone?: AlertTone;
	description: ReactNode;
	showIcon?: boolean;
	closable?: boolean;
	onClose?: () => void;
	className?: string;
}

const icons: Record<AlertTone, ReactNode> = {
	success: (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
			<path d="M8 12.5L10.5 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	),
	danger: (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
			<path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	),
	warning: (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
			<path d="M12 9.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
			<circle cx="12" cy="17" r="1" fill="currentColor" />
		</svg>
	),
	info: (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
			<path d="M12 11V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
			<circle cx="12" cy="8" r="1" fill="currentColor" />
		</svg>
	),
};

export function Alert({
	tone = "info",
	description,
	showIcon = false,
	closable = false,
	onClose,
	className,
}: AlertProps) {
	return (
		<div className={clsx(alertVariants({ tone }), className)} role="alert">
			{showIcon && <span className={alertIconClassName}>{icons[tone]}</span>}
			<div className={alertDescriptionClassName}>{description}</div>
			{closable && (
				<button type="button" className={alertCloseButtonClassName} aria-label="Close" onClick={onClose}>
					<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
				</button>
			)}
		</div>
	);
}

export default Alert;
