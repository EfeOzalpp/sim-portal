"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import Popover from "@/components/popover";

interface TruncatedHoverLinkProps {
	href: string;
	text: string;
	external?: boolean;
	className?: string;
}

// The profile sidebar is narrow - emails/links that don't fit get an ellipsis,
// and only those (measured, not guessed by character count) pop the full value on hover.
export default function TruncatedHoverLink({ href, text, external = false, className }: TruncatedHoverLinkProps) {
	const [open, setOpen] = useState(false);
	const linkRef = useRef<HTMLAnchorElement>(null);
	const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

	function openIfTruncated() {
		const link = linkRef.current;
		if (link && link.scrollWidth > link.clientWidth) setOpen(true);
	}

	return (
		<Popover
			open={open}
			onOpenChange={(nextOpen) => (nextOpen ? openIfTruncated() : setOpen(false))}
			toggle
			side="top"
			align="start"
			// Always rendered inside PersonProfileModal - Popover's own z-[280] sits
			// below ModalPopup's z-[300], so it needs the same z-[310]! a Select in a modal uses.
			contentClassName="z-[310]! px-4"
			trigger={
				<a
					ref={linkRef}
					href={href}
					{...externalProps}
					onMouseEnter={openIfTruncated}
					className={clsx(className, "block min-w-0 truncate hover:underline")}
				>
					{text}
				</a>
			}
		>
			<span className="ui-small break-all text-[var(--contrast-surface-text)]">{text}</span>
		</Popover>
	);
}
