"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MaskIcon } from "@/theme/MaskIcon";

interface SelectedThursdaysContextValue {
	selectedThursdayIds: Set<string>;
	setSelectedThursdayIds: (next: Set<string>) => void;
}

const SelectedThursdaysContext = createContext<SelectedThursdaysContextValue | null>(null);

const checkboxInputClassName =
	"h-4 w-4 cursor-pointer appearance-none rounded-xs border-2 border-solid border-[var(--green-border-checkbox)] bg-transparent group-hover:border-[var(--main-border-4-hover)]";
const checkmarkClassName = "pointer-events-none absolute inset-0 h-4 w-4 bg-[var(--green-active-checkbox)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:85%]";
const checkedCheckboxStyle = {
	backgroundColor: "var(--green-active-bg)",
	borderColor: "var(--green-active-bg)",
};

export function useSelectedThursdays() {
	const context = useContext(SelectedThursdaysContext);

	if (!context) {
		throw new Error("useSelectedThursdays must be used inside SelectedThursdaysProvider.");
	}

	return context;
}

export function SelectedThursdaysProvider({ children }: { children: ReactNode }) {
	const [selectedThursdayIds, setSelectedThursdayIds] = useState<Set<string>>(new Set());
	const contextValue = useMemo(() => ({ selectedThursdayIds, setSelectedThursdayIds }), [selectedThursdayIds]);

	return <SelectedThursdaysContext.Provider value={contextValue}>{children}</SelectedThursdaysContext.Provider>;
}

export function ThursdayCheckbox({
	checked,
	indeterminate = false,
	onChange,
	ariaLabel,
}: {
	checked: boolean;
	indeterminate?: boolean;
	onChange: () => void;
	ariaLabel: string;
}) {
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (ref.current) ref.current.indeterminate = indeterminate;
	}, [indeterminate]);

	return (
		<span className="relative inline-flex h-4 w-4 flex-none">
			<input
				ref={ref}
				type="checkbox"
				className={checkboxInputClassName}
				checked={checked}
				aria-label={ariaLabel}
				style={checked ? checkedCheckboxStyle : undefined}
				onChange={onChange}
			/>
			{checked && <MaskIcon icon="check/check.svg" className={checkmarkClassName} />}
			{!checked && indeterminate && (
				<span className="pointer-events-none absolute inset-0 m-auto h-px w-2 bg-white" aria-hidden="true" />
			)}
		</span>
	);
}
