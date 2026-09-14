import type { ThemeConfig } from "antd";

type ComponentTokens = NonNullable<ThemeConfig["components"]>;
type DatePickerToken = NonNullable<ComponentTokens["DatePicker"]>;

// The subset of antd's DatePicker token API this file actually sets, named by meaning rather than antd's own token names.
type DatePickerThemeValues = {
	background: string;
	elevatedBackground: string;
	border: string;
	text: string;
	placeholder: string;
	icon: string;
	hoverBackground: string;
	hoverBorder: string;
	focusShadow: string;
	error: string;
	primary: string;
	primarySolidText: string;
	rangeBackground: string;
	link: string;
	linkHover: string;
};

// Corner radius for the picker's trigger/panel, in px - antd's token API takes a number, not a rem/Tailwind class.
const RADIUS = 12;

// The semantic values behind this app's calendar theme, mapped below to the
// antd ConfigProvider token names DatePicker/RangePicker actually consume.
//
// These are literal hex, not var(--token) references, on purpose: antd's
// ConfigProvider runs several of these through its own JS-side color math
// (derived hover/active shades, contrast checks) before ever reaching CSS,
// which chokes on an unresolved var() string. focusShadow is the one field
// proven safe to reference live below - it's consumed as a plain box-shadow,
// never parsed as a color. Everything else stays a literal, hand-kept in
// sync with the matching app token (named alongside each value below) -
// this file won't notice if styling-theme.css changes out from under it.
const lightValues: DatePickerThemeValues = {
	background: "#ffffff", // = --select-bg
	elevatedBackground: "#ffffff", // = --input-dropdown-bg
	border: "#d4d4da", // = --input-border
	text: "#000000", // = --app-text
	placeholder: "#5a5a5a", // = --input-placeholder
	icon: "#646464", // = --input-icon
	hoverBackground: "#ffffff", // = --select-bg-hover
	hoverBorder: "#c7c7c7", // = --input-border-hover
	focusShadow: "var(--input-hover-shadow)",
	error: "#d36b6b", // = --input-error-border
	primary: "#56a1e7", // = --select-checkbox-active-text - a plain accent shown directly on the calendar surface, not paired with a light pill bg
	primarySolidText: "#ffffff",
	rangeBackground: "#d9ebfa", // = --select-active-bg
	link: "#56a1e7", // = --select-checkbox-active-text
	linkHover: "#3d84cc", // darker shade of the above
};

const darkValues: DatePickerThemeValues = {
	background: "#3a3a3a", // = --select-bg
	elevatedBackground: "#3a3a3a", // = --input-dropdown-bg
	border: "rgb(88, 88, 88)", // = --input-border
	text: "#ffffff", // = --app-text
	placeholder: "#f4f4f4", // = --input-placeholder
	icon: "#ffffff", // = --input-icon
	hoverBackground: "#4a4a4a", // = --select-bg-hover
	hoverBorder: "#595959", // = --input-border-hover
	focusShadow: "var(--input-hover-shadow)",
	error: "#b36a6a", // = --input-error-border
	primary: "#cbebff", // = --select-checkbox-active-text - a plain accent shown directly on the calendar surface (dark), not paired with a light pill bg like --select-active-text now is
	primarySolidText: "#0d2b45",
	// Not --select-active-bg (now a pale pill bg meant for dark text) - an in-range day's number stays plain white text, so this needs to stay dark enough for that to read.
	rangeBackground: "#49626e",
	link: "#cbebff", // = --select-checkbox-active-text
	linkHover: "#e0f3ff", // lighter shade of the above
};

// Maps one semantic value set (light or dark) onto the actual antd ConfigProvider token names.
function createDatePickerTheme(values: DatePickerThemeValues): ThemeConfig {
	const datePickerToken: DatePickerToken = {
		colorBgContainer: values.background,
		colorBorder: values.border,
		colorText: values.text,
		colorTextPlaceholder: values.placeholder,
		colorIcon: values.icon,
		hoverBorderColor: values.hoverBorder,
		activeBorderColor: values.hoverBorder,
		colorError: values.error,
		colorErrorBorderHover: values.error,
		controlOutline: "transparent",
		borderRadius: RADIUS,
		borderRadiusLG: RADIUS,
		colorBgElevated: values.elevatedBackground,
		// The clear/suffix icons read colorTextQuaternary at rest and colorIcon
		// on hover/focus, so both deliberately resolve to the same value.
		colorTextQuaternary: values.icon,
		boxShadowSecondary: "none",
		hoverBg: values.hoverBackground,
		activeShadow: values.focusShadow,
		errorActiveShadow: "none",
		colorPrimary: values.primary,
		colorTextLightSolid: values.primarySolidText,
		// Plain day hover only had a border highlight in the original CSS, so
		// prevent antd's default gray hover fill.
		cellHoverBg: "transparent",
		cellActiveWithRangeBg: values.rangeBackground,
		cellHoverWithRangeBg: values.rangeBackground,
	};

	return {
		// DatePicker renders its internal "now" action as an antd link Button,
		// which has no DatePicker-scoped token of its own — has to be a global
		// link color instead.
		token: {
			colorLink: values.link,
			colorLinkHover: values.linkHover,
		},
		components: {
			DatePicker: datePickerToken,
		},
	};
}

// Passed to ConfigProvider by DatePickerThemeProvider based on the app's current light/dark theme.
export const datePickerThemeLight = createDatePickerTheme(lightValues);
export const datePickerThemeDark = createDatePickerTheme(darkValues);
