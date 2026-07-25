import type { ThemeConfig } from "antd";

import { buttonTokenDark, buttonTokenLight } from "./tokens/button";
import { fieldComponentTokensDark, fieldComponentTokensLight } from "./tokens/fields";
import { globalTokenDark, globalTokenLight } from "./tokens/global";

export const lightAntdTheme: ThemeConfig = {
	token: globalTokenLight,
	components: {
		...fieldComponentTokensLight,
		Button: buttonTokenLight,
	},
};

export const darkAntdTheme: ThemeConfig = {
	token: globalTokenDark,
	components: {
		...fieldComponentTokensDark,
		Button: buttonTokenDark,
	},
};
