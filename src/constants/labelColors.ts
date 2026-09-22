// Deterministic per-string label colors - the same text (e.g. "September 3")
// always resolves to the same relationship to the active mainframe color.
// That keeps labels stable without hard-coding per-theme lookup tables:
// future mainframe themes only need to define --app-theme.

const HUE_OFFSETS = [0, 28, -32, 72, -78, 132, -138, 180];
const BG_SATURATIONS = {
	light: [48, 48, 56],
	dark: [16, 20, 24],
};
const BG_LIGHTNESS = {
	light: [78, 80, 82],
	dark: [36, 40, 44],
};
const TEXT_SATURATION = 160;
const TEXT_LIGHTNESS = { light: 18, dark: 96 };

function hashString(value: string): number {
	let hash = 0;
	for (let index = 0; index < value.length; index++) {
		hash = (hash * 20 + value.charCodeAt(index)) >>> 0;
	}
	return hash;
}

export interface LabelColors {
	bg: string;
	text: string;
}

function hueOffsetExpression(offset: number) {
	return offset < 0 ? `calc(h - ${Math.abs(offset)})` : `calc(h + ${offset})`;
}

export function getLabelColors(value: string): LabelColors {
	const hash = hashString(value);
	const hue = hueOffsetExpression(HUE_OFFSETS[hash % HUE_OFFSETS.length]);
	
	// Grab the individual math indices based on the array lengths
	const bgSatLight = BG_SATURATIONS.light[Math.floor(hash / HUE_OFFSETS.length) % BG_SATURATIONS.light.length];
	const bgSatDark = BG_SATURATIONS.dark[Math.floor(hash / HUE_OFFSETS.length) % BG_SATURATIONS.dark.length];
	
	const bgLight = BG_LIGHTNESS.light[Math.floor(hash / 17) % BG_LIGHTNESS.light.length];
	const bgDark = BG_LIGHTNESS.dark[Math.floor(hash / 29) % BG_LIGHTNESS.dark.length];
	
	// Dynamically map both independent saturation and lightness variables across the light-dark split
	const hsl = (saturation: { light: number; dark: number }, lightness: { light: number; dark: number }) =>
		`light-dark(hsl(from var(--app-theme) ${hue} ${saturation.light}% ${lightness.light}%), hsl(from var(--app-theme) ${hue} ${saturation.dark}% ${lightness.dark}%))`;

	return {
		bg: hsl({ light: bgSatLight, dark: bgSatDark }, { light: bgLight, dark: bgDark }),
		text: hsl({ light: TEXT_SATURATION, dark: TEXT_SATURATION }, TEXT_LIGHTNESS),
	};
}