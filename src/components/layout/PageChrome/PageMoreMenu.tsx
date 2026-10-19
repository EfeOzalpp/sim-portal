"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import Popover from "@/components/popover";
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { selectItemVariants } from "@/components/select/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import type { IconName } from "@/theme/icons";
import styles from "./PageChrome.module.css";

export interface PageMoreMenuItem {
	label: string;
	icon: IconName;
	href?: string;
}

interface PageMoreMenuProps {
	status?: ReactNode;
	items?: PageMoreMenuItem[];
	printLabel?: string;
	csvLabel?: string;
}

const itemClassName = clsx(
	selectItemVariants({ selected: false, highlightSelected: false }),
	"flex items-center gap-2 w-full border-0 bg-transparent text-left no-underline text-inherit hover:bg-[var(--contrast-surface-hovered-item-bg)]!",
);

export default function PageMoreMenu({ status, items = [], printLabel, csvLabel }: PageMoreMenuProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover
			align="start"
			open={open}
			onOpenChange={setOpen}
			trigger={status ? (
				<Button surface="page" variant="action" icon="more-vertical/more_vert.svg" iconPosition="end" className={styles.statusButton} title="More actions">
					<span className={styles.statusText}>{status}</span>
				</Button>
			) : <Button surface="page" variant="tool" icon="more-vertical/more_vert.svg" aria-label="More actions" title="More actions" />}
		>
			<div className="flex min-w-[11rem] flex-col gap-0.5" role="menu">
				{items.map((item) =>
					item.href ? (
						<Link key={item.label} href={item.href} role="menuitem" className={itemClassName} onClick={() => setOpen(false)}>
							<MaskIcon icon={item.icon} className={actionButtonIconClassName} />
							{item.label}
						</Link>
					) : (
						<button key={item.label} type="button" role="menuitem" className={itemClassName} onClick={() => setOpen(false)}>
							<MaskIcon icon={item.icon} className={actionButtonIconClassName} />
							{item.label}
						</button>
					),
				)}
				{printLabel && (
					<button
						type="button"
						role="menuitem"
						className={itemClassName}
						onClick={() => setOpen(false)}
					>
						<MaskIcon icon="print/print.svg" className={actionButtonIconClassName} />
						{printLabel}
					</button>
				)}
				{csvLabel && (
					<button type="button" role="menuitem" className={itemClassName} onClick={() => setOpen(false)}>
						<MaskIcon icon="download/download.svg" className={actionButtonIconClassName} />
						{csvLabel}
					</button>
				)}
			</div>
		</Popover>
	);
}
