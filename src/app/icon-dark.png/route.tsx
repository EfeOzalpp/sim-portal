import { ImageResponse } from "next/og";

// Second favicon variant, served at its own route rather than through the
// icon.tsx file convention - that convention only generates one
// unconditional <link rel="icon">, with no way to attach a `media` query to
// it. This one gets wired up manually in layout.tsx with
// media="(prefers-color-scheme: dark)" instead, so it displays only when
// the browser/OS is in dark mode; icon.tsx's plain link stays as the
// light-mode (and no-preference-detected) default.
const size = { width: 32, height: 32 };

export async function GET() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "#ffffff",
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
