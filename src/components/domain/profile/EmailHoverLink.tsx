"use client";

import { useState } from "react";
import Popover from "@/components/popover";

interface EmailHoverLinkProps {
	email: string;
	displayLabel: string;
	className?: string;
}

// The sidebar truncates long emails (getTruncatedEmail in UserProfileView) -
// this pops the full untruncated address on hover.
export default function EmailHoverLink({ email, displayLabel, className }: EmailHoverLinkProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			toggle
			side="top"
			align="start"
			// This popover always renders inside PersonProfileModal - Popover's own
			// z-[280] sits below ModalPopup's z-[300], so without this override it
			// opens correctly but stacks behind the modal, invisibly. Same z-[310]!
			// fix selectContentInModalClassName uses for a Select inside a modal.
			contentClassName="z-[310]!"
			trigger={
				<a
					href={`mailto:${email}`}
					onMouseEnter={() => setOpen(true)}
					className={className}
				>
					{displayLabel}
				</a>
			}
		>
			<span className="text-sm break-all text-[var(--app-text)]">{email}</span>
		</Popover>
	);
}
