import { hashString } from "@/constants/stringColors";

const COMPLEMENT_OFFSETS = [160, 200, 240, 280];

const PAGE_TITLE_OFFSETS: Record<string, number> = {
	Thursdays: 160,
	People: 240,
	"Student Progress": 200,
	Semesters: 280,
};

export function getChromeComplementTitleColor(value: string): string {
	const offset = PAGE_TITLE_OFFSETS[value] ?? COMPLEMENT_OFFSETS[hashString(value) % COMPLEMENT_OFFSETS.length];
	return `oklch(from hsl(var(--hue-chrome) 100% 50%) var(--title-lightness) var(--title-chroma) calc(h + ${offset}))`;
}
