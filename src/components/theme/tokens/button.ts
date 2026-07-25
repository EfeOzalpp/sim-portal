import type { ThemeConfig } from "antd";

type ButtonToken = NonNullable<ThemeConfig["components"]>["Button"];

type StatefulValue = {
	base: string;
	hover: string;
	active: string;
};

type ButtonThemeValues = {
	disabled: {
		text: string;
		border: string;
		background: string;
	};
	navigation: {
		text: StatefulValue;
		hoverBackground: string;
	};
	action: {
		background: StatefulValue;
		text: string;
		border: string;
	};
	linkBackground: StatefulValue;
	decline: {
		text: string;
		background: StatefulValue;
	};
	accept: {
		text: string;
		background: StatefulValue;
	};
};

// nav-button -> variant="text"; action-button -> variant="outlined";
// link-button -> variant="filled" + shape="round"; decline-button ->
// variant="filled" color="danger"; accept-button -> variant="filled"
// color="green". The variant/color pairing is enforced in AntD.tsx.
const buttonThemeLight: ButtonThemeValues = {
	disabled: {
		text: "#8c8c8c",
		border: "#d9d9d9",
		background: "#f7f7f7",
	},
	navigation: {
		text: { base: "#717171", hover: "#3b3b3b", active: "#000000" },
		hoverBackground: "#efefef",
	},
	action: {
		background: { base: "#ffffff", hover: "#f7f7f7", active: "#f7f7f7" },
		text: "#000000",
		border: "#d9d9d9",
	},
	linkBackground: { base: "#ffffff", hover: "#f7f7f7", active: "#ffffff" },
	decline: {
		text: "#421717",
		background: { base: "#f7dddd", hover: "#efcccc", active: "#e7bbbb" },
	},
	accept: {
		text: "#143821",
		background: { base: "#dff3e6", hover: "#ccebd8", active: "#b9e2c9" },
	},
};

const buttonThemeDark: ButtonThemeValues = {
	disabled: {
		text: "#8c8c8c",
		border: "#343434",
		background: "#242424",
	},
	navigation: {
		text: { base: "#adadad", hover: "#ffffff", active: "#ffffff" },
		hoverBackground: "#2d2d2d",
	},
	action: {
		background: { base: "#242424", hover: "#303030", active: "#383838" },
		text: "#ffffff",
		border: "#333333",
	},
	linkBackground: { base: "#1f1f1f", hover: "#242424", active: "#1a1a1a" },
	decline: {
		text: "#fff0f0",
		background: { base: "#462d2d", hover: "#553535", active: "#633e3e" },
	},
	accept: {
		text: "#eefcf2",
		background: { base: "#4c7154", hover: "#59855e", active: "#679b6a" },
	},
};

function createButtonToken(values: ButtonThemeValues): ButtonToken {
	return {
		// Matches --border-sm, distinct from the field components' 12px.
		// link-button uses shape="round", which overrides this.
		borderRadius: 6,
		// Antd applies one disabled palette across the relevant variants.
		colorTextDisabled: values.disabled.text,
		colorBorderDisabled: values.disabled.border,
		colorBgContainerDisabled: values.disabled.background,
		defaultBgDisabled: values.disabled.background,
		// text variant (nav-button)
		textTextColor: values.navigation.text.base,
		textTextHoverColor: values.navigation.text.hover,
		textTextActiveColor: values.navigation.text.active,
		textHoverBg: values.navigation.hoverBackground,
		// outlined variant, default color (action-button)
		defaultBg: values.action.background.base,
		defaultHoverBg: values.action.background.hover,
		defaultActiveBg: values.action.background.active,
		defaultColor: values.action.text,
		defaultHoverColor: values.action.text,
		defaultActiveColor: values.action.text,
		defaultBorderColor: values.action.border,
		defaultHoverBorderColor: values.action.border,
		defaultActiveBorderColor: values.action.border,
		defaultShadow: "none",
		// filled variant, default color (link-button). Its text reads the
		// same defaultBorderColor used by the outlined action-button, so
		// the independent link text color remains a small CSS override.
		colorFillTertiary: values.linkBackground.base,
		colorFillSecondary: values.linkBackground.hover,
		colorFill: values.linkBackground.active,
		// filled variant, danger color (decline-button)
		colorError: values.decline.text,
		colorErrorBg: values.decline.background.base,
		colorErrorBgFilledHover: values.decline.background.hover,
		colorErrorBgActive: values.decline.background.active,
		// filled variant, green preset (accept-button)
		green6: values.accept.text,
		green1: values.accept.background.base,
		green2: values.accept.background.hover,
		green3: values.accept.background.active,
	};
}

export const buttonTokenLight = createButtonToken(buttonThemeLight);
export const buttonTokenDark = createButtonToken(buttonThemeDark);
