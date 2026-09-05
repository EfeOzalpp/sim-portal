import { ImageResponse } from "next/og";

// Next.js picks this up automatically and generates the favicon <link> tags
// for it - no manual wiring in layout.tsx needed. Square canvas, full-bleed
// background: browsers/search engines apply their own crop (Google's SERP
// UI circles it, iOS squircles it, etc.) - baking in our own circle here
// would double-crop against theirs.
export const size = { width: 16, height: 16 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "#7dbb7a",
					fontSize: 44,
					top: "-3px",
					fontWeight: 700,
					fontFamily: "sans-serif",
					letterSpacing: "-0.03em",
					lineHeight: 1,
				}}
			>
				s
			</div>
		),
		{ ...size },
	);
}
