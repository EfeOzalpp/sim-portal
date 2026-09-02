import "dotenv/config";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const MIME_EXTENSIONS = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const storageDirectory = process.env.IMAGE_STORAGE_DIR?.trim()
	? path.resolve(process.env.IMAGE_STORAGE_DIR)
	: path.resolve("public", "media", "user-images");
const migrationDirectory = path.resolve("database", "backups", "user-images");
const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const manifestPath = path.join(migrationDirectory, `migration-${timestamp}.json`);
const pool = new pg.Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function sha256(value) {
	return createHash("sha256").update(value).digest("hex");
}

function parseDataUrl(value) {
	const match = value.match(/^data:([^;,]+);base64,(.+)$/s);
	if (!match) return null;
	const extension = MIME_EXTENSIONS[match[1].toLowerCase()];
	if (!extension) throw new Error(`Unsupported image type: ${match[1]}`);

	return {
		mimeType: match[1].toLowerCase(),
		extension,
		buffer: Buffer.from(match[2], "base64"),
	};
}

try {
	await mkdir(storageDirectory, { recursive: true });
	await mkdir(migrationDirectory, { recursive: true });

	const users = await prisma.user.findMany({
		where: { image: { startsWith: "data:image/" } },
		select: { id: true, image: true },
		orderBy: { id: "asc" },
	});
	const pendingUpdates = [];

	for (const user of users) {
		const parsed = parseDataUrl(user.image);
		if (!parsed) continue;

		const hash = sha256(parsed.buffer);
		const fileName = `${hash}.${parsed.extension}`;
		const destination = path.join(storageDirectory, fileName);

		try {
			await writeFile(destination, parsed.buffer, { flag: "wx" });
		} catch (error) {
			if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) {
				throw error;
			}
		}

		const storedBuffer = await readFile(destination);
		if (sha256(storedBuffer) !== hash) {
			throw new Error(`Stored image verification failed for user ${user.id}.`);
		}

		pendingUpdates.push({
			userId: user.id,
			originalValue: user.image,
			originalSha256: hash,
			byteLength: parsed.buffer.length,
			mimeType: parsed.mimeType,
			fileName,
			publicPath: `/media/user-images/${fileName}`,
		});
	}

	const publicManifest = {
		createdAt: new Date().toISOString(),
		status: "files-verified",
		storageDirectory,
		images: pendingUpdates.map(({ originalValue: _originalValue, ...image }) => image),
	};
	await writeFile(manifestPath, `${JSON.stringify(publicManifest, null, 2)}\n`);

	await prisma.$transaction(async (transaction) => {
		for (const update of pendingUpdates) {
			const result = await transaction.user.updateMany({
				where: { id: update.userId, image: update.originalValue },
				data: { image: update.publicPath },
			});

			if (result.count !== 1) {
				throw new Error(`User ${update.userId} changed during image migration.`);
			}
		}
	});

	const remainingBase64Images = await prisma.user.count({
		where: { image: { startsWith: "data:image/" } },
	});

	await writeFile(
		manifestPath,
		`${JSON.stringify(
			{
				...publicManifest,
				completedAt: new Date().toISOString(),
				status: "database-updated",
				remainingBase64Images,
			},
			null,
			2,
		)}\n`,
	);

	console.log(
		JSON.stringify(
			{
				migratedImages: pendingUpdates.length,
				remainingBase64Images,
				storageDirectory,
				manifestPath,
			},
			null,
			2,
		),
	);
} finally {
	await pool.end();
}
