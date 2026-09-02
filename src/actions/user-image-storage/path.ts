import "server-only";

// Shared by store.ts and delete.ts — where uploaded images live on disk, and
// the public URL prefix the DB stores paths under.
export const PUBLIC_IMAGE_PREFIX = "/media/user-images";

export function getStorageDirectory() {
	const configuredDirectory = process.env.IMAGE_STORAGE_DIR?.trim();
	if (configuredDirectory) {
		const isAbsoluteLinuxPath = configuredDirectory.startsWith("/");
		const isAbsoluteWindowsPath = /^[a-zA-Z]:[\\/]/.test(configuredDirectory);
		if (!isAbsoluteLinuxPath && !isAbsoluteWindowsPath) {
			throw new Error("IMAGE_STORAGE_DIR must be an absolute path.");
		}

		return configuredDirectory.replace(/[\\/]+$/, "");
	}

	if (process.env.NODE_ENV === "production") {
		throw new Error(
			"IMAGE_STORAGE_DIR must be set in production so uploaded images are stored outside the app checkout. See README.md#persistent-user-images.",
		);
	}

	const defaultSuffix = process.platform === "win32"
		? "\\public\\media\\user-images"
		: "/public/media/user-images";
	return `${process.cwd()}${defaultSuffix}`;
}

export function getStoredImageDestination(storageDirectory: string, fileName: string) {
	const separator = storageDirectory.includes("\\") ? "\\" : "/";
	return `${storageDirectory}${separator}${fileName}`;
}
