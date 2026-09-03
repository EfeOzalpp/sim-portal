import type { ThemeConfig } from "antd";

type ComponentTokens = NonNullable<ThemeConfig["components"]>;
type DatePickerToken = NonNullable<ComponentTokens["DatePicker"]>;

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
// this file won't notice if styling-theme.css/input-theme.css changes out
// from under it.
const lightValues: DatePickerThemeValues = {
	background: "#ffffff", // = --input-bg
	elevatedBackground: "#ffffff", // = --input-dropdown-bg
	border: "#d9d9d9", // = --app-border
	text: "#1f2933", // = --app-text
	placeholder: "#6b7280", // = --input-placeholder / --app-muted
	icon: "#6b7280", // = --input-placeholder / --app-muted
	hoverBackground: "#ffffff", // = --input-bg-hover
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
	background: "#1f1f1f", // = --input-bg (dark: var(--app-secondary), currently #1f1f1f)
	elevatedBackground: "#1f1f1f", // = --input-dropdown-bg (dark: var(--app-secondary))
	border: "#343434", // = --input-border
	text: "#f5f5f5", // = --app-text
	placeholder: "#a3a3a3", // = --app-muted
	icon: "#c6c6c6", // = --input-icon
	hoverBackground: "#292929", // = --input-bg-hover
	hoverBorder: "#4a4a4a", // = --input-border-hover
	focusShadow: "var(--input-hover-shadow)",
	error: "#b36a6a", // = --input-error-border
	primary: "#6aa47a", // calendar-only accent, no app token
	primarySolidText: "#102416",
	rangeBackground: "#243d2d", // calendar-only accent, no app token
	link: "#7fca8c", // calendar-only accent, no app token
	linkHover: "#9be2a6", // calendar-only accent, no app token
};

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

export const datePickerThemeLight = createDatePickerTheme(lightValues);
export const datePickerThemeDark = createDatePickerTheme(darkValues);
