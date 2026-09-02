"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/button/button-component";

interface ConfirmDeleteProps {
	itemName: string;
	itemType?: string;
	warningText?: ReactNode;
	confirmLabel?: string;
	pendingLabel?: string;
	errorMessage?: string;
	onConfirm: () => Promise<any> | any;
	onConfirmed?: () => void;
}

function isActionFailure(result: unknown): result is { success: false; error?: string } {
	return Boolean(
		result &&
			typeof result === "object" &&
			"success" in result &&
			(result as { success?: unknown }).success === false,
	);
}

function isNextRedirect(error: unknown) {
	if (!(error instanceof Error)) return false;

	const digest = (error as Error & { digest?: string }).digest;
	return error.message === "NEXT_REDIRECT" || Boolean(digest?.includes("NEXT_REDIRECT"));
}

export default function ConfirmDelete({
	itemName,
	itemType = "item",
	warningText,
	confirmLabel = "Confirm Delete",
	pendingLabel = "Deleting...",
	errorMessage = "An error occurred while deleting.",
	onConfirm,
	onConfirmed,
}: ConfirmDeleteProps) {
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const result = await onConfirm();

			if (isActionFailure(result)) {
				setError(result.error || errorMessage);
				return;
			}

			onConfirmed?.();
		} catch (err) {
			if (isNextRedirect(err)) {
				throw err;
			}

			setError(err instanceof Error ? err.message : errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form className="flex flex-col gap-[var(--gap-md)] [&_p]:m-0" onSubmit={handleSubmit}>
			<p>
				<strong>
					Are you sure you want to delete {itemName || `this ${itemType}`}?
				</strong>
			</p>
			{warningText && <p>{warningText}</p>}
			<p className="ui-note">This action cannot be undone.</p>
			{error && <p className="text-[#cf1322]">{error}</p>}
			<div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-[var(--gap-sm)] max-[480px]:grid-cols-1">
				<Button
					type="submit"
					tone="danger"
					disabled={isSubmitting}
				>
					{isSubmitting ? pendingLabel : confirmLabel}
				</Button>
			</div>
		</form>
	);
}
