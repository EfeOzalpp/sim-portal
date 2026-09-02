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

	// Windows can briefly hold a lock on a file that was just served (unlike
	// POSIX, where unlink on an open file always succeeds), so a delete right
	// after an image was rendered can transiently fail with EBUSY/EPERM/EACCES.
	// Retry a few times before giving up.
	const RETRYABLE_CODES = new Set(["EBUSY", "EPERM", "EACCES"]);
	const MAX_ATTEMPTS = 4;

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
		try {
			await unlink(destination);
			return;
		} catch (error) {
			const code = error instanceof Error && "code" in error ? (error as { code?: string }).code : undefined;

			if (code === "ENOENT") return;

			if (code && RETRYABLE_CODES.has(code) && attempt < MAX_ATTEMPTS) {
				await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
				continue;
			}

			throw error;
		}
	}
}
