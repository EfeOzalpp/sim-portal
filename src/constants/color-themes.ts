export const COLOR_THEMES = [
	{ id: "default", label: "Default" },
	{ id: "safety-orange", label: "Safety Orange" },
	{ id: "fruit-smoothie", label: "Fruit Smoothie" },
	{ id: "rainbow", label: "Rainbow" },
] as const;

export type ColorTheme = (typeof COLOR_THEMES)[number]["id"];

export function isColorTheme(value: string | null | undefined): value is ColorTheme {
	return COLOR_THEMES.some((theme) => theme.id === value);
}
