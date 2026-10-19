"use client";

import { useState } from "react";

interface AboutTextProps {
	text: string;
}

const CHAR_LIMIT = 400;
const COLLAPSED_HEIGHT = "6rem";

export default function AboutText({ text }: AboutTextProps) {
	const [expanded, setExpanded] = useState(false);

	if (text.length <= CHAR_LIMIT) {
		return <>{text}</>;
	}

	if (expanded) {
		return (
			<span>
				{text}{" "}
				<button
					type="button"
					onClick={() => setExpanded(false)}
					className="ui-link cursor-pointer border-0 bg-transparent p-0 text-[var(--inline-link)] underline underline-offset-[0.18em] hover:text-[var(--inline-link-hover)]"
				>
					Show less
				</button>
			</span>
		);
	}

	return (
		<div className="flex flex-col items-center gap-1">
			<div className="relative w-full overflow-hidden" style={{ maxHeight: COLLAPSED_HEIGHT }}>
				{text}
				<div
					className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(to_bottom,transparent,var(--modal-surface)_85%)]"
					aria-hidden="true"
				/>
			</div>
			<button
				type="button"
				onClick={() => setExpanded(true)}
				className="ui-link cursor-pointer border-0 bg-transparent p-0 text-[var(--inline-link)] underline underline-offset-[0.18em] hover:text-[var(--inline-link-hover)]"
			>
				Show more
			</button>
		</div>
	);
}
