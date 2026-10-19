"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/button";

function copyWithSelection(text: string) {
	const previousFocus = document.activeElement;
	const selection = window.getSelection();
	const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : [];
	const field = document.createElement("textarea");
	field.value = text;
	field.readOnly = true;
	field.tabIndex = -1;
	field.setAttribute("aria-hidden", "true");
	Object.assign(field.style, { position: "fixed", top: "0", left: "0", width: "1px", height: "1px", opacity: "0", fontSize: "16px" });
	document.body.append(field);

	try {
		field.focus({ preventScroll: true });
		field.select();
		field.setSelectionRange(0, text.length);
		// Compatibility only: the modern Clipboard API is unavailable on HTTP LAN previews.
		if (!document.execCommand("copy")) throw new Error("Copy was not allowed.");
	} finally {
		field.remove();
		if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
		if (selection) {
			selection.removeAllRanges();
			ranges.forEach((range) => selection.addRange(range));
		}
	}
}

export default function ProfileEmail({ email }: { email: string }) {
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState(false);
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => () => {
		if (resetTimer.current !== null) clearTimeout(resetTimer.current);
	}, []);

	async function copyEmail() {
		setError(false);
		try {
			if (navigator.clipboard?.writeText) {
				try {
					await navigator.clipboard.writeText(email);
				} catch {
					copyWithSelection(email);
				}
			} else {
				copyWithSelection(email);
			}
			if (resetTimer.current !== null) clearTimeout(resetTimer.current);
			setCopied(true);
			resetTimer.current = setTimeout(() => setCopied(false), 2000);
		} catch {
			setError(true);
		}
	}

	return (
		<div className="flex min-w-0 flex-col gap-1">
			<div className="is-body group/email flex w-fit max-w-full min-w-0 items-center gap-1">
				<button
					type="button"
					title={email}
					aria-label={`Copy ${email}`}
					onClick={copyEmail}
					className="block min-w-0 cursor-pointer truncate border-0 bg-transparent p-0 text-left [font:inherit] text-[var(--app-text)] decoration-current underline-offset-[0.14em] hover:text-[var(--inline-link-hover)] hover:underline"
				>
					{email}
				</button>
				<span className="relative h-5 w-9 shrink-0">
				<Button
					surface="modal"
					variant="tool"
					size="small"
					icon={copied ? "check/check.svg" : "copy/content_copy.svg"}
					aria-label="Copy email address"
					title={copied ? "Email copied" : "Copy email address"}
					onClick={copyEmail}
					className={clsx(
						"absolute top-1/2 left-0 -translate-y-1/2",
						"[--button-icon-text:var(--select-checkbox-active-bg)] [--button-text:var(--select-checkbox-active-bg)]",
						!copied && "pointer-events-none opacity-0 group-hover/email:pointer-events-auto group-hover/email:opacity-100 group-focus-within/email:pointer-events-auto group-focus-within/email:opacity-100",
					)}
				/>
				</span>
				{copied && <span className="ui-small shrink-0 whitespace-nowrap text-[var(--select-checkbox-active-bg)]" aria-hidden="true">copied!</span>}
			</div>
			<span className="sr-only" role="status">{copied ? "Email copied" : ""}</span>
			{error && <span className="ui-note text-[var(--tone-danger-text)]" role="alert">Could not copy email.</span>}
		</div>
	);
}
