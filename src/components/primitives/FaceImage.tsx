import Image from "next/image";
import type { CSSProperties } from "react";
import { normalizeFaceImagePath } from "@/helpers";
import { MaskIcon } from "@/theme/MaskIcon";

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
// "/face.jpg" sentinel - in that case, a centered person icon instead of a
// real photo (className/style are object-fit/position concerns for an
// <Image>, not meaningful here, so this branch ignores both).
export default function FaceImage({ imagePath, alt, sizes, className, style, loading }: FaceImageProps) {
	const src = normalizeFaceImagePath(imagePath);

	if (src === "/face.jpg") {
		return (
			<span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
				<MaskIcon icon="person/person.svg" className="h-1/3 w-1/3 bg-[var(--subtle-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
			</span>
		);
	}

	return <Image src={src} alt={alt} fill sizes={sizes} className={className} style={style} loading={loading} />;
}
