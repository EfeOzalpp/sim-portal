"use client";

import { ReactNode, useCallback, useEffect, useId, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/button";
import { createPortal } from "react-dom";
import closeIcon from "@/components/theme/assets/close/close.svg";
import {
	modalBackdropClassName,
	modalBodyClassName,
	modalCloseIconClassName,
	modalDialogClassName,
	modalDialogDefaultWidthClassName,
	modalHeaderButtonClassName,
	modalTitleClassName,
} from "@/components/modal/styles";

interface ModalPopupProps {
	triggerLabel?: ReactNode;
	title: ReactNode;
	children: ReactNode;
	triggerClassName?: string;
	dialogClassName?: string;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function ModalPopup({
	triggerLabel,
	title,
	children,
	triggerClassName,
	dialogClassName,
	open,
	defaultOpen = false,
	onOpenChange,
}: ModalPopupProps) {
	const [internalOpen, setInternalOpen] = useState(defaultOpen);
	const [isMounted, setIsMounted] = useState(false);
	const titleId = useId();
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;
	const setIsOpen = useCallback(
		(nextOpen: boolean) => {
			if (!isControlled) {
				setInternalOpen(nextOpen);
			}

			onOpenChange?.(nextOpen);
		},
		[isControlled, onOpenChange],
	);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const html = document.documentElement;
		const body = document.body;
		const previousHtmlOverflow = html.style.overflow;
		const previousBodyOverflow = body.style.overflow;

		html.style.overflow = "hidden";
		body.style.overflow = "hidden";

		return () => {
			html.style.overflow = previousHtmlOverflow;
			body.style.overflow = previousBodyOverflow;
		};
	}, [isOpen]);

	const modal = (
		<div
			className={modalBackdropClassName}
			data-modal-popup
			role="presentation"
			onWheel={(event) => event.stopPropagation()}
			onTouchMove={(event) => event.stopPropagation()}
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					setIsOpen(false);
				}
			}}
		>
			<section
				className={clsx(modalDialogClassName, dialogClassName ?? modalDialogDefaultWidthClassName)}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
			>
				<button
					type="button"
					className={modalHeaderButtonClassName}
					onClick={() => setIsOpen(false)}
					aria-label="Close modal"
				>
					<span id={titleId} className={modalTitleClassName}>
						{title}
					</span>
					<span
						className={modalCloseIconClassName}
						style={{
							maskImage: `url(${typeof closeIcon === "string" ? closeIcon : closeIcon.src})`,
							WebkitMaskImage: `url(${typeof closeIcon === "string" ? closeIcon : closeIcon.src})`,
						}}
						aria-hidden="true"
					/>
				</button>
				<div className={modalBodyClassName}>
					{children}
				</div>
			</section>
		</div>
	);

	return (
		<>
			{triggerLabel !== undefined && (
				<Button type="button" className={triggerClassName} onClick={() => setIsOpen(true)}>
					{triggerLabel}
				</Button>
			)}
			{isOpen && isMounted ? createPortal(modal, document.body) : null}
		</>
	);
}
