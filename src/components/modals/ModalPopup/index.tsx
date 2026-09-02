"use client";

import { ReactNode, useCallback, useEffect, useId, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/button/button-component";
import { createPortal } from "react-dom";
import closeIcon from "@/components/theme/assets/close/close.svg";

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
			className="fixed inset-0 z-[1000] grid box-border place-items-center overflow-auto bg-[rgba(0,0,0,0.5)] p-[var(--spacing-lg)] overscroll-contain max-[768px]:items-end max-[768px]:p-0"
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
				className={clsx(
					"box-border flex max-h-[calc(100dvh-(var(--spacing-lg)*2))] flex-col overflow-hidden rounded-[var(--border-lg)] border-solid border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] [border-width:var(--app-border-width)] max-[768px]:max-h-dvh max-[768px]:w-full max-[768px]:animate-[modal-slide-up_300ms_cubic-bezier(0.32,0.72,0,1)] max-[768px]:rounded-none max-[768px]:border-x-0 max-[768px]:border-b-0",
					dialogClassName ?? "w-[min(52rem,100%)]",
				)}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
			>
				<button
					type="button"
					className="m-0 flex w-full cursor-pointer items-center justify-between gap-[var(--gap-md)] rounded-t-[var(--border-lg)] border-0 border-b-[length:var(--app-border-width)] border-solid border-[var(--app-border)] bg-transparent p-[var(--spacing-md)] text-left text-[var(--app-text)] hover:bg-[var(--nav-button-bg-hover)] max-[768px]:rounded-none"
					onClick={() => setIsOpen(false)}
					aria-label="Close modal"
				>
					<span
						id={titleId}
						className="min-w-0 font-[family-name:var(--font-family-heading)] text-[length:var(--font-size-h3)] leading-[var(--line-height-tight)] font-[var(--font-weight-bold)]"
					>
						{title}
					</span>
					<span
						className="h-[var(--svg-size-md)] w-[var(--svg-size-md)] flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
						style={{
							maskImage: `url(${typeof closeIcon === "string" ? closeIcon : closeIcon.src})`,
							WebkitMaskImage: `url(${typeof closeIcon === "string" ? closeIcon : closeIcon.src})`,
						}}
						aria-hidden="true"
					/>
				</button>
				<div className="input-theme-surface min-h-0 overflow-auto p-[var(--spacing-md)] max-[768px]:flex-1">
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
