import "server-only";

import { unlink } from "node:fs/promises";

import { getStorageDirectory, getStoredImageDestination, PUBLIC_IMAGE_PREFIX } from "@/actions/user-image-storage/path";

// Deletes a previously stored image from disk, given the public path saved on
// a user row. Filenames are content hashes, so two users can end up sharing
// one file (identical upload bytes) — callers MUST confirm no other row still
// references this exact path before calling this, or they'll break someone
// else's photo. Silently no-ops if the file is already gone.
export async function deleteStoredUserImage(publicPath: string): Promise<void> {
	const prefix = `${PUBLIC_IMAGE_PREFIX}/`;
	if (!publicPath.startsWith(prefix)) return;

	const fileName = publicPath.slice(prefix.length);
	if (!fileName || fileName.includes("/") || fileName.includes("\\") || fileName.includes("..")) {
		return;
	}

	const storageDirectory = getStorageDirectory();
	const destination = getStoredImageDestination(storageDirectory, fileName);

	try {
		await unlink(destination);
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
		throw error;
	}
}
