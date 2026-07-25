"use client";

import { useEffect, useState } from "react";
import { ConfigProvider } from "antd";

import { darkAntdTheme, lightAntdTheme } from "@/components/theme/antdTheme";

type Theme = "light" | "dark";

function readTheme(): Theme {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export default function AntdThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>("light");

	useEffect(() => {
		const root = document.documentElement;

		setTheme(readTheme());

		const observer = new MutationObserver(() => {
			setTheme(readTheme());
		});

		observer.observe(root, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});

		return () => observer.disconnect();
	}, []);

	return (
		<ConfigProvider theme={theme === "dark" ? darkAntdTheme : lightAntdTheme} wave={{ disabled: true }}>
			{children}
		</ConfigProvider>
	);
}
