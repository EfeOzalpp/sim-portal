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
	/** Merged onto the trigger <button> itself, not the header row around it —
	 * padding belongs here, not on headerClassName. The row uses items-stretch,
	 * so the button already fills the row's content-box; padding put on the
	 * row instead sits outside that box, so it *looks* like part of the header
	 * but isn't actually clickable, a well-earned mistake worth flagging in a
	 * comment now that it's been made once. */
	triggerClassName?: string;
	contentClassName?: string;
}

interface CollapseProps {
	items: CollapseItem[];
	/** Item `value`s open by default. Every item can be open independently —
	 * this always behaves like antd's Collapse did without `accordion` mode. */
	defaultValue?: string[];
	/** Controlled open values - omit for Collapse to manage its own (defaultValue still seeds it either way). Pass both this and onValueChange, or neither. */
	value?: string[];
	onValueChange?: (value: string[]) => void;
	className?: string;
}

export function Collapse({ items, defaultValue, value, onValueChange, className }: CollapseProps) {
	const [internalOpenValues, setInternalOpenValues] = useState<Set<string>>(() => new Set(defaultValue));
	const isControlled = value !== undefined;
	const openValues = isControlled ? new Set(value) : internalOpenValues;

	function toggle(itemValue: string) {
		const next = new Set(openValues);
		if (next.has(itemValue)) {
			next.delete(itemValue);
		} else {
			next.add(itemValue);
		}

		if (isControlled) {
			onValueChange?.(Array.from(next));
		} else {
			setInternalOpenValues(next);
		}
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
								className={clsx(collapseTriggerClassName, item.triggerClassName)}
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
