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
const lightValues: DatePickerThemeValues = {
	background: "#ffffff",
	elevatedBackground: "#ffffff",
	border: "#d9d9d9",
	text: "#1f2933",
	placeholder: "#6b7280",
	icon: "#6b7280",
	hoverBackground: "#ffffff",
	hoverBorder: "#c7c7c7",
	focusShadow: "var(--input-hover-shadow)",
	error: "#d36b6b",
	primary: "#4f7f60",
	primarySolidText: "#ffffff",
	rangeBackground: "#dcefe3",
	link: "#2f7d46",
	linkHover: "#1f6334",
};

const darkValues: DatePickerThemeValues = {
	background: "#1f1f1f",
	elevatedBackground: "#1f1f1f",
	border: "#343434",
	text: "#f5f5f5",
	placeholder: "#a3a3a3",
	icon: "#c6c6c6",
	hoverBackground: "#292929",
	hoverBorder: "#4a4a4a",
	focusShadow: "var(--input-hover-shadow)",
	error: "#b36a6a",
	primary: "#6aa47a",
	primarySolidText: "#102416",
	rangeBackground: "#243d2d",
	link: "#7fca8c",
	linkHover: "#9be2a6",
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
