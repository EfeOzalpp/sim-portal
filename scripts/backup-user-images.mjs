import "dotenv/config";

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const MIME_EXTENSIONS = {
	"image/avif": "avif",
	"image/gif": "gif",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const backupRoot = path.join(projectDirectory, "database", "backups", "user-images");
const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const outputDirectory = path.join(backupRoot, timestamp);
const imagesDirectory = path.join(outputDirectory, "images");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is required.");
}

const parsedDatabaseUrl = new URL(databaseUrl);
const pool = new pg.Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function sha256(value) {
	return createHash("sha256").update(value).digest("hex");
}

function parseDataUrl(value) {
	const match = value.match(/^data:([^;,]+);base64,(.+)$/s);
	if (!match) return null;

	return {
		mimeType: match[1].toLowerCase(),
		bytes: Buffer.from(match[2], "base64"),
	};
}

try {
	await mkdir(imagesDirectory, { recursive: true });

	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
		},
		orderBy: { id: "asc" },
	});

	const records = [];
	const checksumLines = [];
	let decodedImageCount = 0;
	let decodedByteCount = 0;

	for (const user of users) {
		const parsedImage = parseDataUrl(user.image);

		if (!parsedImage) {
			records.push({
				userId: user.id,
				name: user.name,
				email: user.email,
				storageType: "reference",
				value: user.image,
			});
			continue;
		}

		const extension = MIME_EXTENSIONS[parsedImage.mimeType] ?? "bin";
		const relativeFile = path.posix.join("images", `${user.id}.${extension}`);
		const absoluteFile = path.join(outputDirectory, ...relativeFile.split("/"));
		const checksum = sha256(parsedImage.bytes);

		await writeFile(absoluteFile, parsedImage.bytes, { flag: "wx" });
		checksumLines.push(`${checksum}  ${relativeFile}`);
		decodedImageCount += 1;
		decodedByteCount += parsedImage.bytes.length;

		records.push({
			userId: user.id,
			name: user.name,
			email: user.email,
			storageType: "data-url",
			mimeType: parsedImage.mimeType,
			file: relativeFile,
			byteLength: parsedImage.bytes.length,
			sha256: checksum,
		});
	}

	const manifest = {
		formatVersion: 1,
		createdAt: new Date().toISOString(),
		source: {
			host: parsedDatabaseUrl.hostname,
			port: parsedDatabaseUrl.port || "5432",
			database: parsedDatabaseUrl.pathname.slice(1),
		},
		summary: {
			userRecords: users.length,
			decodedImages: decodedImageCount,
			decodedBytes: decodedByteCount,
			references: users.length - decodedImageCount,
		},
		records,
	};

	await writeFile(
		path.join(outputDirectory, "manifest.json"),
		`${JSON.stringify(manifest, null, 2)}\n`,
		{ flag: "wx" },
	);
	await writeFile(
		path.join(outputDirectory, "checksums.sha256"),
		`${checksumLines.join("\n")}\n`,
		{ flag: "wx" },
	);

	console.log(
		JSON.stringify(
			{
				outputDirectory,
				...manifest.summary,
			},
			null,
			2,
		),
	);
} finally {
	await pool.end();
}
