"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/button";
import { useToast } from "@/components/toast";

interface ConfirmDeleteProps {
	itemName: string;
	itemType?: string;
	warningText?: ReactNode;
	confirmLabel?: string;
	pendingLabel?: string;
	errorMessage?: string;
	/** Removes an item from a parent form draft; persistence waits for that form's save. */
	deferred?: boolean;
	/** Shown as a danger-toned toast once the delete actually goes through. */
	successMessage?: string;
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
	confirmLabel = "Confirm delete",
	pendingLabel = "Deleting...",
	errorMessage = "An error occurred while deleting.",
	deferred = false,
	successMessage,
	onConfirm,
	onConfirmed,
}: ConfirmDeleteProps) {
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const toast = useToast();

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		// Portal events still bubble through React's tree to a parent edit form.
		event.stopPropagation();
		setError(null);
		setIsSubmitting(true);

		try {
			const result = await onConfirm();

			if (isActionFailure(result)) {
				setError(result.error || errorMessage);
				return;
			}

			if (successMessage) toast.danger(successMessage);
			onConfirmed?.();
		} catch (err) {
			if (isNextRedirect(err)) {
				if (successMessage) toast.danger(successMessage);
				throw err;
			}

			setError(err instanceof Error ? err.message : errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form className="flex flex-col gap-4 pt-8 [&_p]:m-0" onSubmit={handleSubmit}>
			<p className="confirmation-title">
				Are you sure you want to {deferred ? "remove" : "delete"} {itemName || `this ${itemType}`}?
			</p>
			{warningText && <p>{warningText}</p>}
			<p className="is-body">{deferred ? "This removal takes effect when you save changes." : "This action cannot be undone."}</p>
			{error && <p className="text-[var(--tone-danger-text)]">{error}</p>}
			<div className="flex justify-start">
				<Button
					surface="modal"
					type="submit"
					tone="danger"
					disabled={isSubmitting}
					className="px-6!"
				>
					{isSubmitting ? pendingLabel : confirmLabel}
				</Button>
			</div>
		</form>
	);
}
