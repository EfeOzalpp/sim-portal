"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ConfigProvider, DatePicker as AntDatePicker, type DatePickerProps } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import { datePickerThemeDark, datePickerThemeLight } from "@/components/datepicker/styles";
import "@/components/datepicker/datepicker-theme.css";

type Theme = "light" | "dark";

function readTheme(): Theme {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

// Tracks the app's light/dark attribute directly, rather than depending on
// some provider mounted elsewhere — this component carries its own theming,
// same as every other primitive in this app.
function useAntdTheme() {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const root = document.documentElement;
		setTheme(readTheme());

		const observer = new MutationObserver(() => setTheme(readTheme()));
		observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
		return () => observer.disconnect();
	}, []);

	return theme;
}

function DatePickerThemeProvider({ children }: { children: ReactNode }) {
	const theme = useAntdTheme();

	return (
		<ConfigProvider theme={theme === "dark" ? datePickerThemeDark : datePickerThemeLight} wave={{ disabled: true }}>
			{children}
		</ConfigProvider>
	);
}

export function DatePicker(props: DatePickerProps) {
	return (
		<DatePickerThemeProvider>
			<AntDatePicker size="large" {...props} />
		</DatePickerThemeProvider>
	);
}

export function RangePicker(props: RangePickerProps) {
	return (
		<DatePickerThemeProvider>
			<AntDatePicker.RangePicker size="large" {...props} />
		</DatePickerThemeProvider>
	);
}
