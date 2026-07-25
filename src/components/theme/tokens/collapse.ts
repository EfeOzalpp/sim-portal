import type { ThemeConfig } from "antd";

type CollapseToken = NonNullable<NonNullable<ThemeConfig["components"]>["Collapse"]>;

const sharedCollapseToken: CollapseToken = {
	borderRadiusLG: 12,
	lineWidth: 1,
};

export const collapseTokenLight: CollapseToken = {
	...sharedCollapseToken,
	colorBorder: "#d9d9d9",
	colorText: "#1f2933",
	colorTextHeading: "#1f2933",
};

export const collapseTokenDark: CollapseToken = {
	...sharedCollapseToken,
	colorBorder: "#333333",
	colorText: "#f5f5f5",
	colorTextHeading: "#f5f5f5",
};
