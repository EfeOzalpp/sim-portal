const HUE_STEPS = 10;
const HUE_STEP_DEGREES = 360 / HUE_STEPS;
const BASE_HUE = 210;

const THEME_COLORS = {
	light: {
		bgSaturation: 100,
		bgLightness: 50,
		textSaturation: 66,
		textLightness: 20,
		titleLightness: 20,
	},
	dark: {
		bgSaturation: 66,
		bgLightness: 75,
		textSaturation: 35,
		textLightness: 94,
		titleLightness: 80,
	},
};

export interface StringColors {
	bg: string;
	text: string;
	title: string;
}

// FNV-1a: mixes every character into the result, so similar strings
// like "Sept 24" and "Nov 4" do not collapse onto the same hue.
function hashString(value: string): number {
	let hash = 0x811c9dc5;

	for (let index = 0; index < value.length; index++) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193);
	}

	return hash >>> 0;
}

function labelHue(hueOffset: number): number {
	return (BASE_HUE + hueOffset) % 360;
}

// Linear sRGB luminance accounts for green/yellow looking brighter than blue
// at the same HSL lightness. Output remains ordinary HSL for compatibility.
function relativeLuminance(hue: number, saturation: number, lightness: number): number {
	const s = saturation / 100;
	const l = lightness / 100;
	const amplitude = s * Math.min(l, 1 - l);
	const channel = (offset: number) => {
		const position = (offset + hue / 30) % 12;
		const value = l - amplitude * Math.max(-1, Math.min(position - 3, 9 - position, 1));
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4);
}

const PALETTE_HUES = Array.from({ length: HUE_STEPS }, (_, index) => labelHue((index + 1) * HUE_STEP_DEGREES));

function balancedLightness(saturation: number, baseLightness: number): number[] {
	// Preserve the palette's average brightness when its base values change.
	const target = PALETTE_HUES.reduce((sum, hue) => sum + relativeLuminance(hue, saturation, baseLightness), 0) / HUE_STEPS;

	return PALETTE_HUES.map((hue) => {
		let lower = 0;
		let upper = 100;

		for (let step = 0; step < 20; step++) {
			const middle = (lower + upper) / 2;
			if (relativeLuminance(hue, saturation, middle) < target) lower = middle;
			else upper = middle;
		}

		return Number(((lower + upper) / 2).toFixed(2));
	});
}

const LIGHTNESS = {
	lightBg: balancedLightness(THEME_COLORS.light.bgSaturation, THEME_COLORS.light.bgLightness),
	darkBg: balancedLightness(THEME_COLORS.dark.bgSaturation, THEME_COLORS.dark.bgLightness),
	lightText: balancedLightness(THEME_COLORS.light.textSaturation, THEME_COLORS.light.textLightness).map((lightness) => Math.max(24, lightness)),
	darkText: balancedLightness(THEME_COLORS.dark.textSaturation, THEME_COLORS.dark.textLightness),
	lightTitle: balancedLightness(THEME_COLORS.light.textSaturation, THEME_COLORS.light.titleLightness).map((lightness) => Math.max(24, lightness)),
	darkTitle: balancedLightness(THEME_COLORS.dark.textSaturation, THEME_COLORS.dark.titleLightness),
};

// Keep this deterministic during SSR/hydration: React sees one identical
// style string, while CSS resolves the active side through color-scheme.
// Precompute the palette once, rather than balancing every label render.
const PALETTE: StringColors[] = PALETTE_HUES.map((hue, index) => ({
	bg: `light-dark(hsl(${hue} ${THEME_COLORS.light.bgSaturation}% ${LIGHTNESS.lightBg[index]}%), hsl(${hue} ${THEME_COLORS.dark.bgSaturation}% ${LIGHTNESS.darkBg[index]}%))`,
	text: `light-dark(hsl(${hue} ${THEME_COLORS.light.textSaturation}% ${LIGHTNESS.lightText[index]}%), hsl(${hue} ${THEME_COLORS.dark.textSaturation}% ${LIGHTNESS.darkText[index]}%))`,
	title: `light-dark(hsl(${hue} ${THEME_COLORS.light.textSaturation}% ${LIGHTNESS.lightTitle[index]}%), hsl(${hue} ${THEME_COLORS.dark.textSaturation}% ${LIGHTNESS.darkTitle[index]}%))`,
}));

export function getStringColors(value: string): StringColors {
	const colors = PALETTE[hashString(value) % HUE_STEPS];
	return {
		...colors,
	};
}
