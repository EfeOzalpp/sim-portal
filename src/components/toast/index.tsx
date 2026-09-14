"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import Alert, { type AlertTone } from "@/components/alert";
import { toastItemClassName, toastItemEnterClassName, toastItemLeaveClassName, toastViewportClassName } from "@/components/toast/styles";

interface ToastEntry {
	id: number;
	tone: AlertTone;
	message: ReactNode;
	leaving?: boolean;
}

interface ToastContextValue {
	success: (message: ReactNode) => void;
	danger: (message: ReactNode) => void;
	warning: (message: ReactNode) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_AFTER_MS = 2000;
const EXIT_DURATION_MS = 200;

export function ToastProvider({ children }: { children: ReactNode }) {
	const [entries, setEntries] = useState<ToastEntry[]>([]);
	const nextId = useRef(0);

	const remove = useCallback((id: number) => {
		setEntries((current) => current.filter((entry) => entry.id !== id));
	}, []);

	const dismiss = useCallback(
		(id: number) => {
			setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, leaving: true } : entry)));
			setTimeout(() => remove(id), EXIT_DURATION_MS);
		},
		[remove],
	);

	const show = useCallback(
		(tone: AlertTone, message: ReactNode) => {
			const id = nextId.current++;
			setEntries((current) => [...current, { id, tone, message }]);
			setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
		},
		[dismiss],
	);

	const value: ToastContextValue = {
		success: useCallback((message: ReactNode) => show("success", message), [show]),
		danger: useCallback((message: ReactNode) => show("danger", message), [show]),
		warning: useCallback((message: ReactNode) => show("warning", message), [show]),
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className={toastViewportClassName} aria-live="polite">
				{entries.map((entry) => (
					<Alert
						key={entry.id}
						tone={entry.tone}
						description={entry.message}
						showIcon
						closable
						onClose={() => dismiss(entry.id)}
						className={clsx(toastItemClassName, entry.leaving ? toastItemLeaveClassName : toastItemEnterClassName)}
					/>
				))}
			</div>
		</ToastContext.Provider>
	);
}

/** Call from any client component: `const toast = useToast(); toast.success("Changes saved");` */
export function useToast() {
	const context = useContext(ToastContext);
	if (!context) throw new Error("useToast must be used within a ToastProvider");
	return context;
}
