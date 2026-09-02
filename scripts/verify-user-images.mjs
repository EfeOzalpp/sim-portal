import "dotenv/config";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const storageDirectory = process.env.IMAGE_STORAGE_DIR?.trim()
	? path.resolve(process.env.IMAGE_STORAGE_DIR)
	: path.resolve("public", "media", "user-images");
const pool = new pg.Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
	const users = await prisma.user.findMany({
		select: { id: true, image: true },
		orderBy: { id: "asc" },
	});
	let verifiedImages = 0;
	let base64Images = 0;
	let otherReferences = 0;
	const failures = [];

	for (const user of users) {
		if (user.image.startsWith("data:image/")) {
			base64Images += 1;
			continue;
		}

		if (!user.image.startsWith("/media/user-images/")) {
			otherReferences += 1;
			continue;
		}

		const fileName = user.image.slice("/media/user-images/".length);
		const expectedHash = fileName.split(".")[0];

		try {
			const buffer = await readFile(path.join(storageDirectory, fileName));
			const actualHash = createHash("sha256").update(buffer).digest("hex");
			if (actualHash !== expectedHash) {
				failures.push({ userId: user.id, reason: "checksum mismatch" });
				continue;
			}

			verifiedImages += 1;
		} catch (error) {
			failures.push({
				userId: user.id,
				reason: error instanceof Error ? error.message : "file read failed",
			});
		}
	}

	const result = {
		databaseUsers: users.length,
		verifiedImages,
		base64Images,
		otherReferences,
		failures,
		storageDirectory,
	};

	console.log(JSON.stringify(result, null, 2));
	if (base64Images > 0 || failures.length > 0) process.exitCode = 1;
} finally {
	await pool.end();
}
