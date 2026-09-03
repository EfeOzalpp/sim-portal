// Every icon referenced dynamically (as a prop value, not a literal Tailwind
// class) has to be imported here as a real static import — a mask-image URL
// built by interpolating a runtime string into a Tailwind arbitrary-value
// class (`[mask-image:url(../assets/${icon})]`) never gets generated: Tailwind
// scans source text for complete literal class strings, it doesn't execute
// JS, so an interpolated one is invisible to it. Static imports sidestep that
// entirely since the resolved asset URL is applied via inline style instead.
import closeIcon from "@/components/theme/assets/close/close.svg";
import downloadIcon from "@/components/theme/assets/download/download.svg";
import searchIcon from "@/components/theme/assets/search/search.svg";

export const iconAssets = {
	"close/close.svg": closeIcon,
	"download/download.svg": downloadIcon,
	"search/search.svg": searchIcon,
};

export type IconName = keyof typeof iconAssets;

export function resolveIconSrc(icon: IconName): string {
	const asset = iconAssets[icon];
	return typeof asset === "string" ? asset : asset.src;
}
