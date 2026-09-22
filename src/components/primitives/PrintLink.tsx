"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { MaskIcon } from "@/theme/MaskIcon";

interface PrintLinkProps {
	label?: string;
	// "action" (icon+text composed as plain children, not Button's own icon
	// prop) - that prop's absolute-positioned icon + centered text exists for
	// columns of same-purpose action buttons, wrong for a lone button like this.
	variant?: ButtonVariant;
}

// Waits for every <img> currently on the page to finish loading (or fail -
// either way, stop waiting on it), with a timeout so one stuck image can't
// block printing forever.
function waitForImagesToLoad(timeoutMs = 5000) {
	const images = Array.from(document.images);

	const allSettled = Promise.all(
		images.map((img) =>
			img.complete
				? Promise.resolve()
				: new Promise<void>((resolve) => {
						img.addEventListener("load", () => resolve(), { once: true });
						img.addEventListener("error", () => resolve(), { once: true });
					}),
		),
	);

	return Promise.race([allSettled, new Promise((resolve) => setTimeout(resolve, timeoutMs))]);
}

export default function PrintLink({ label = "Export pdf", variant = "text" }: PrintLinkProps) {
	const [isPreparing, setIsPreparing] = useState(false);

	async function handlePrint() {
		setIsPreparing(true);

		try {
			// Grids with batched/lazy content (e.g. UserCardGrid) listen for the
			// native "beforeprint" event to expand to their full, un-batched
			// content before printing. Dispatching it manually here - ahead of the
			// real one window.print() fires - buys time to wait for the newly
			// rendered images to actually finish loading: the browser doesn't wait
			// on pending network requests on its own, so without this, anything
			// that wasn't already on-screen prints blank.
			window.dispatchEvent(new Event("beforeprint"));

			// Let React commit the newly-expanded content before scanning for images.
			await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
			await waitForImagesToLoad();

			window.print();
		} finally {
			setIsPreparing(false);
		}
	}

	return (
		<Button
			type="button"
			variant={variant}
			disabled={isPreparing}
			onClick={handlePrint}
			className={variant === "text" ? "pl-2!" : undefined}
		>
			<MaskIcon icon="download/download.svg" className={actionButtonIconClassName} />
			{isPreparing ? "Preparing..." : label}
		</Button>
	);
}
