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
	text: "#1f2933", // = --app-text
	placeholder: "#4d525e", // = --input-placeholder / --app-muted
	icon: "#494541", // = --input-icon
	hoverBackground: "#ffffff", // = --select-bg-hover
	hoverBorder: "#c7c7c7", // = --input-border-hover
	focusShadow: "var(--input-hover-shadow)",
	error: "#d36b6b", // = --input-error-border
	primary: "#4f7f60", // calendar-only accent, no app token
	primarySolidText: "#ffffff",
	rangeBackground: "#dcefe3", // calendar-only accent, no app token
	link: "#2f7d46", // calendar-only accent, no app token
	linkHover: "#1f6334", // calendar-only accent, no app token
};

const darkValues: DatePickerThemeValues = {
	background: "#1c1c20", // = --select-bg (= --app-secondary)
	elevatedBackground: "#1c1c20", // = --input-dropdown-bg (= --app-secondary)
	border: "#38383e", // = --input-border
	text: "#f2f2f4", // = --app-text
	placeholder: "#b5b8be", // = --app-muted
	icon: "#cacad2", // = --input-icon
	hoverBackground: "#242429", // = --select-bg-hover
	hoverBorder: "#504f57", // = --input-border-hover
	focusShadow: "var(--input-hover-shadow)",
	error: "#b36a6a", // = --input-error-border
	primary: "#6aa47a", // calendar-only accent, no app token
	primarySolidText: "#102416",
	rangeBackground: "#243d2d", // calendar-only accent, no app token
	link: "#7fca8c", // calendar-only accent, no app token
	linkHover: "#9be2a6", // calendar-only accent, no app token
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
