import type { ReactNode } from "react";
import clsx from "clsx";
import { MaskIcon } from "@/theme/MaskIcon";
import {
	alertCloseButtonClassName,
	alertDescriptionClassName,
	alertIconClassName,
	alertVariants,
} from "@/components/alert/styles";

export type AlertTone = "success" | "danger" | "warning";

interface AlertProps {
	tone?: AlertTone;
	description: ReactNode;
	showIcon?: boolean;
	closable?: boolean;
	onClose?: () => void;
	className?: string;
}

const maskIconClassName = "h-full w-full bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

const icons: Record<AlertTone, ReactNode> = {
	success: <MaskIcon icon="success/success.svg" className={maskIconClassName} />,
	danger: <MaskIcon icon="error/error.svg" className={maskIconClassName} />,
	warning: (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path d="M12 3L22 20H2L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
			<path d="M12 9.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
			<circle cx="12" cy="17" r="1" fill="currentColor" />
		</svg>
	),
};

export function Alert({
	tone = "danger",
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
