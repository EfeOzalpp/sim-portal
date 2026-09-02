import type { ThemeConfig } from "antd";

import { collapseTokenDark, collapseTokenLight } from "./tokens/collapse";
import { fieldComponentTokensDark, fieldComponentTokensLight } from "./tokens/fields";
import { globalTokenDark, globalTokenLight } from "./tokens/global";

// No Button entry here anymore — antd's Button isn't rendered anywhere in
// the app now (see src/components/button/button-component.tsx).

export const lightAntdTheme: ThemeConfig = {
	token: globalTokenLight,
	components: {
		...fieldComponentTokensLight,
		Collapse: collapseTokenLight,
	},
};

export const darkAntdTheme: ThemeConfig = {
	token: globalTokenDark,
	components: {
		...fieldComponentTokensDark,
		Collapse: collapseTokenDark,
	},
};
