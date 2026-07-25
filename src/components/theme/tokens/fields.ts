import type { ThemeConfig } from "antd";

type ComponentTokens = NonNullable<ThemeConfig["components"]>;
type InputToken = NonNullable<ComponentTokens["Input"]>;
type SelectToken = NonNullable<ComponentTokens["Select"]>;
type DatePickerToken = NonNullable<ComponentTokens["DatePicker"]>;

type FieldComponentTokens = {
	Input: InputToken;
	Select: SelectToken;
	DatePicker: DatePickerToken;
};

type FieldThemeValues = {
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
	optionHoverBackground: string;
	optionSelectedBackground: string;
	multipleItemBackground: string;
	multipleItemBorder: string;
	primary: string;
	primarySolidText: string;
	rangeBackground: string;
};

const RADIUS = 12;

// These are the semantic field values for each app theme. The mapper below
// translates them to the different token names consumed by Input, Select,
// and DatePicker without promoting them to global Antd tokens.
const fieldThemeLight: FieldThemeValues = {
	background: "#ffffff",
	elevatedBackground: "#ffffff",
	border: "#d9d9d9",
	text: "#1f2933",
	placeholder: "#6b7280",
	icon: "#6b7280",
	hoverBackground: "#ffffff",
	hoverBorder: "#c7c7c7",
	focusShadow: "0 0 0 1px rgba(0, 0, 0, 0.12)",
	error: "#d36b6b",
	optionHoverBackground: "#efefef",
	optionSelectedBackground: "#dfdfdf",
	multipleItemBackground: "#ececec",
	multipleItemBorder: "#cfcfcf",
	primary: "#4f7f60",
	primarySolidText: "#ffffff",
	rangeBackground: "#dcefe3",
};

const fieldThemeDark: FieldThemeValues = {
	background: "#1f1f1f",
	elevatedBackground: "#1f1f1f",
	border: "#343434",
	text: "#f5f5f5",
	placeholder: "#a3a3a3",
	icon: "#c6c6c6",
	hoverBackground: "#292929",
	hoverBorder: "#4a4a4a",
	focusShadow: "0 0 0 1px rgba(255, 255, 255, 0.16)",
	error: "#b36a6a",
	optionHoverBackground: "#2d2d2d",
	optionSelectedBackground: "#3b3b3b",
	multipleItemBackground: "#383838",
	multipleItemBorder: "#5a5a5a",
	primary: "#6aa47a",
	primarySolidText: "#102416",
	rangeBackground: "#243d2d",
};

function createFieldComponentTokens(values: FieldThemeValues): FieldComponentTokens {
	const shared = {
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
	};

	return {
		Input: {
			...shared,
			// The clear icon reads colorTextQuaternary at rest and colorIcon
			// on hover/focus, so both deliberately resolve to the same value.
			colorTextQuaternary: values.icon,
			hoverBg: values.hoverBackground,
			activeBg: values.background,
			activeShadow: values.focusShadow,
			errorActiveShadow: "none",
		},
		Select: {
			...shared,
			colorBgElevated: values.elevatedBackground,
			selectorBg: values.background,
			clearBg: values.background,
			boxShadowSecondary: "none",
			activeOutlineColor: "transparent",
			// Select has no errorActiveShadow token; colorErrorOutline is
			// its equivalent way to suppress the error focus glow.
			colorErrorOutline: "transparent",
			optionActiveBg: values.optionHoverBackground,
			optionSelectedBg: values.optionSelectedBackground,
			optionSelectedColor: values.text,
			// The original cascade kept the selected color when an option
			// was both selected and hovered.
			controlItemBgActiveHover: values.optionSelectedBackground,
			multipleItemBg: values.multipleItemBackground,
			multipleItemBorderColor: values.multipleItemBorder,
		},
		DatePicker: {
			...shared,
			colorBgElevated: values.elevatedBackground,
			// DatePicker icons follow the same two-token behavior as Input.
			colorTextQuaternary: values.icon,
			boxShadowSecondary: "none",
			hoverBg: values.hoverBackground,
			activeShadow: values.focusShadow,
			errorActiveShadow: "none",
			colorPrimary: values.primary,
			colorTextLightSolid: values.primarySolidText,
			// Plain day hover only had a border highlight in the original
			// CSS, so prevent Antd's default gray hover fill.
			cellHoverBg: "transparent",
			cellActiveWithRangeBg: values.rangeBackground,
			cellHoverWithRangeBg: values.rangeBackground,
		},
	};
}

export const fieldComponentTokensLight = createFieldComponentTokens(fieldThemeLight);
export const fieldComponentTokensDark = createFieldComponentTokens(fieldThemeDark);
