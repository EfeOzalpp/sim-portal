import { ImageResponse } from "next/og";

// Next.js picks this up automatically and generates the favicon <link> tags
// for it - no manual wiring in layout.tsx needed. Square canvas, full-bleed
// background: browsers/search engines apply their own crop (Google's SERP
// UI circles it, iOS squircles it, etc.) - baking in our own circle here
// would double-crop against theirs.
//
// Multiple sizes, not just one - a single 16x16 raster gets scaled by the
// browser for every other pixel size it actually needs (higher-DPI screens,
// browser zoom, Windows taskbar pinning, etc.), and scaling a bitmap that
// small up or down reads as the icon's size/crispness visibly shifting as
// zoom changes. Rendering each size natively avoids any of that scaling.
const iconSizes = [16, 32, 48];

export function generateImageMetadata() {
	return iconSizes.map((size) => ({
		id: String(size),
		size: { width: size, height: size },
		contentType: "image/png",
	}));
}

export default async function Icon({ id }: { id: Promise<string> | string }) {
	const size = Number(await id);
	// Same proportions as the original 16px version (44px glyph, -3px nudge),
	// scaled up so the glyph reads the same way at every size.
	const scale = size / 16;

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "#000000",
					fontSize: `${44 * scale}px`,
					top: `${-3 * scale}px`,
					fontWeight: 700,
					fontFamily: "sans-serif",
					letterSpacing: "-0.03em",
					lineHeight: 1,
				}}
			>
				s
			</div>
		),
		{ width: size, height: size },
	);
}
