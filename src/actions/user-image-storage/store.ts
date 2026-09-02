import "server-only";

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

import { getStorageDirectory, getStoredImageDestination, PUBLIC_IMAGE_PREFIX } from "@/actions/user-image-storage/path";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_FORMATS = {
	jpeg: { extension: "jpg", contentType: "image/jpeg" },
	png: { extension: "png", contentType: "image/png" },
	webp: { extension: "webp", contentType: "image/webp" },
} as const;

type ImageFormat = keyof typeof IMAGE_FORMATS;

export interface StoredUserImage {
	publicPath: string;
	fileName: string;
	contentType: string;
	byteLength: number;
	sha256: string;
}

function detectImageFormat(buffer: Buffer): ImageFormat | null {
	if (
		buffer.length >= 3 &&
		buffer[0] === 0xff &&
		buffer[1] === 0xd8 &&
		buffer[2] === 0xff
	) {
		return "jpeg";
	}

	if (
		buffer.length >= 8 &&
		buffer.subarray(0, 8).equals(
			Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		)
	) {
		return "png";
	}

	if (
		buffer.length >= 12 &&
		buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
		buffer.subarray(8, 12).toString("ascii") === "WEBP"
	) {
		return "webp";
	}

	return null;
}

export async function storeUserImage(file: File): Promise<StoredUserImage> {
	const buffer = Buffer.from(await file.arrayBuffer());

	if (buffer.length === 0) {
		throw new Error("The selected image is empty.");
	}

	if (buffer.length > MAX_IMAGE_BYTES) {
		throw new Error("Images must be smaller than 8 MB.");
	}

	const format = detectImageFormat(buffer);
	if (!format) {
		throw new Error("Only JPEG, PNG, and WebP images are supported.");
	}

	const sha256 = createHash("sha256").update(buffer).digest("hex");
	const { extension, contentType } = IMAGE_FORMATS[format];
	const fileName = `${sha256}.${extension}`;
	const storageDirectory = getStorageDirectory();
	const destination = getStoredImageDestination(storageDirectory, fileName);

	await mkdir(storageDirectory, { recursive: true });

	try {
		await writeFile(destination, buffer, { flag: "wx" });
	} catch (error) {
		if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) {
			throw error;
		}
	}

	return {
		publicPath: `${PUBLIC_IMAGE_PREFIX}/${fileName}`,
		fileName,
		contentType,
		byteLength: buffer.length,
		sha256,
	};
}
