import { hashString } from "@/constants/stringColors";

const COMPLEMENT_OFFSETS = [160, 200, 240, 280];

const PAGE_TITLE_OFFSETS: Record<string, number> = {
	Thursdays: 160,
	People: 240,
	"Student Progress": 200,
	Semesters: 280,
};

const CHROMA_SCALE = 0.75;
const WEAK_HUE_CENTER = 105;
const WEAK_HUE_BOOST = 0.4;

export function getChromeComplementTitleColor(value: string): string {
	const offset = PAGE_TITLE_OFFSETS[value] ?? COMPLEMENT_OFFSETS[hashString(value) % COMPLEMENT_OFFSETS.length];
	const chroma = `calc(var(--title-chroma) * ${CHROMA_SCALE} * (1 +${WEAK_HUE_BOOST} * max(0, cos((h + ${offset} - ${WEAK_HUE_CENTER}) * 1deg))))`;
	return `oklch(from hsl(var(--hue-chrome) 100% 50%) var(--title-lightness) ${chroma} calc(h + ${offset}))`;
}
