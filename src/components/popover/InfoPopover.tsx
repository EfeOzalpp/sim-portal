"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { Popover } from "@/components/popover";
import { MaskIcon } from "@/theme/MaskIcon";

interface InfoPopoverProps {
	label: string;
	children: ReactNode;
	side?: "top" | "bottom" | "left" | "right";
	align?: "start" | "center" | "end";
	inModal?: boolean;
}

function isMouse(event: { nativeEvent: Event }) {
	return (event.nativeEvent as PointerEvent).pointerType === "mouse";
}

export function InfoPopover({ label, children, side = "right", align = "center", inModal = false }: InfoPopoverProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover
			toggle
			open={open}
			onOpenChange={setOpen}
			side={side}
			align={align}
			contentClassName={clsx("max-w-[18rem] px-4", inModal && "z-[310]!")}
			trigger={
				<button
					type="button"
					aria-label={label}
					className="-m-1 inline-grid flex-none cursor-pointer place-items-center rounded-full border-0 bg-transparent p-1 text-[var(--modal-chevron-color,var(--input-icon))] hover:text-[var(--app-text)]"
					onPointerEnter={(event) => isMouse(event) && setOpen(true)}
					onClick={(event) => isMouse(event) && event.preventDefault()}
				>
					<MaskIcon icon="info/info.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
				</button>
			}
		>
			<p className="ui-note m-0">{children}</p>
		</Popover>
	);
}

export default InfoPopover;
