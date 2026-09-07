import Image from "next/image";
import clsx from "clsx";
import type { CSSProperties } from "react";
import { normalizeFaceImagePath } from "@/helpers";

interface FaceImageProps {
	imagePath?: string | null;
	alt: string;
	sizes: string;
	className?: string;
	style?: CSSProperties;
	loading?: "eager" | "lazy";
}

// Fills its (already positioned/sized) parent with a user's photo. When no
// photo has been uploaded, normalizeFaceImagePath falls back to the shared
// default face - in that case only, swap in a dark-mode-specific variant via
// the app's CSS dark: variant (data-theme attribute, no client JS/theme
// detection needed). A real uploaded photo is never swapped.
export default function FaceImage({ imagePath, alt, sizes, className, style, loading }: FaceImageProps) {
	const src = normalizeFaceImagePath(imagePath);

	if (src !== "/face.jpg") {
		return <Image src={src} alt={alt} fill sizes={sizes} className={className} style={style} loading={loading} />;
	}

	return (
		<>
			<Image src="/face.jpg" alt={alt} fill sizes={sizes} className={clsx(className, "dark:hidden")} style={style} loading={loading} />
			<Image src="/face-darkmode.jpg" alt={alt} fill sizes={sizes} className={clsx("hidden dark:block", className)} style={style} loading={loading} />
		</>
	);
}
