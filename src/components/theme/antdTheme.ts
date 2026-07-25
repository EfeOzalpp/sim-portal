import type { ThemeConfig } from "antd";

import { buttonTokenDark, buttonTokenLight } from "./tokens/button";
import { collapseTokenDark, collapseTokenLight } from "./tokens/collapse";
import { fieldComponentTokensDark, fieldComponentTokensLight } from "./tokens/fields";
import { globalTokenDark, globalTokenLight } from "./tokens/global";

export const lightAntdTheme: ThemeConfig = {
	token: globalTokenLight,
	components: {
		...fieldComponentTokensLight,
		Button: buttonTokenLight,
		Collapse: collapseTokenLight,
	},
};

export const darkAntdTheme: ThemeConfig = {
	token: globalTokenDark,
	components: {
		...fieldComponentTokensDark,
		Button: buttonTokenDark,
		Collapse: collapseTokenDark,
	},
};
