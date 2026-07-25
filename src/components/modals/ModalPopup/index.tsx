"use client";

import { ReactNode, useCallback, useEffect, useId, useState } from "react";
import clsx from "clsx";
import { Button as AntButton } from "antd";
import { createPortal } from "react-dom";
import styles from "@/components/modals/ModalPopup/ModalPopup.module.css";

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
			className={styles.overlay}
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
				className={clsx(styles.dialog, dialogClassName)}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
			>
				<button
					type="button"
					className={styles.header}
					onClick={() => setIsOpen(false)}
					aria-label="Close modal"
				>
					<span id={titleId} className={styles.title}>
						{title}
					</span>
					<span className={clsx(styles.closeIcon)} aria-hidden="true" />
				</button>
				<div className={clsx(styles.body, "input-theme-surface")}>{children}</div>
			</section>
		</div>
	);

	return (
		<>
			{triggerLabel !== undefined && (
				<AntButton htmlType="button" className={triggerClassName} onClick={() => setIsOpen(true)}>
					{triggerLabel}
				</AntButton>
			)}
			{isOpen && isMounted ? createPortal(modal, document.body) : null}
		</>
	);
}
