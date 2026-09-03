"use client";

import { useState, type ReactNode } from "react";
import clsx from "clsx";
import { collapseHeaderRowClassName, collapseTriggerClassName } from "@/components/collapse/styles";

export interface CollapseItem {
	value: string;
	/**
	 * Rendered inside the actual clickable toggle button. Keep this free of
	 * interactive elements (links, buttons) — the trigger renders as a real
	 * <button>, which can't legally contain another one.
	 */
	trigger: ReactNode;
	/** Renders as a sibling next to the trigger, outside the button — safe
	 * for interactive content like a remove button. */
	extra?: ReactNode;
	content: ReactNode;
	itemClassName?: string;
	headerClassName?: string;
	contentClassName?: string;
}

interface CollapseProps {
	items: CollapseItem[];
	/** Item `value`s open by default. Every item can be open independently —
	 * this always behaves like antd's Collapse did without `accordion` mode. */
	defaultValue?: string[];
	className?: string;
}

export function Collapse({ items, defaultValue, className }: CollapseProps) {
	const [openValues, setOpenValues] = useState<Set<string>>(() => new Set(defaultValue));

	function toggle(value: string) {
		setOpenValues((current) => {
			const next = new Set(current);
			if (next.has(value)) {
				next.delete(value);
			} else {
				next.add(value);
			}
			return next;
		});
	}

	return (
		<div className={className}>
			{items.map((item) => {
				const isOpen = openValues.has(item.value);
				const triggerId = `collapse-trigger-${item.value}`;
				const contentId = `collapse-content-${item.value}`;

				return (
					<div key={item.value} className={item.itemClassName} data-state={isOpen ? "open" : "closed"}>
						<div className={clsx(collapseHeaderRowClassName, item.headerClassName)}>
							<button
								type="button"
								id={triggerId}
								className={collapseTriggerClassName}
								aria-expanded={isOpen}
								aria-controls={contentId}
								data-state={isOpen ? "open" : "closed"}
								onClick={() => toggle(item.value)}
							>
								{item.trigger}
							</button>
							{item.extra}
						</div>
						{isOpen && (
							<div
								id={contentId}
								role="region"
								aria-labelledby={triggerId}
								className={item.contentClassName}
							>
								{item.content}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

export default Collapse;
