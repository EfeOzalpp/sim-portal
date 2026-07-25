import type { ThemeConfig } from "antd";

type GlobalToken = NonNullable<ThemeConfig["token"]>;

// DatePicker renders its internal "now" action as an Antd link Button, so
// these must be global tokens rather than component-scoped Button tokens.
export const globalTokenLight: GlobalToken = {
	colorLink: "#2f7d46",
	colorLinkHover: "#1f6334",
};

export const globalTokenDark: GlobalToken = {
	colorLink: "#7fca8c",
	colorLinkHover: "#9be2a6",
};
