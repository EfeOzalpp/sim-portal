"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getThursdayDateStatus } from "@/constants/semester-calendar";
import { MaskIcon } from "@/theme/MaskIcon";

const TodayContext = createContext<string | null>(null);

export function ThursdayDateProvider({ children }: { children: ReactNode }) {
	const [today, setToday] = useState<string | null>(null);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		function update() {
			const now = new Date();
			setToday(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
			clearTimeout(timer);
			const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
			timer = setTimeout(update, midnight.getTime() - now.getTime() + 100);
		}
		update();
		window.addEventListener("focus", update);
		document.addEventListener("visibilitychange", update);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("focus", update);
			document.removeEventListener("visibilitychange", update);
		};
	}, []);

	return <TodayContext.Provider value={today}>{children}</TodayContext.Provider>;
}

export default function ThursdayDateIndicator({ date }: { date: string }) {
	const today = useContext(TodayContext);
	const status = today ? getThursdayDateStatus(date, today) : null;
	if (!status) return null;
	const label = status === "today" ? "Today" : "Upcoming";

	return (
		<span className="ui-small pointer-events-none inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[var(--app-text)] group-hover:opacity-0 group-focus-within:opacity-0" role="img" aria-label={label} title={label}>
			<MaskIcon icon={status === "today" ? "fiber_today/fiber_today.svg" : "schedule/schedule.svg"} className="h-5 w-5 shrink-0 bg-[var(--select-checkbox-active-bg)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
			<span>{label}</span>
		</span>
	);
}
