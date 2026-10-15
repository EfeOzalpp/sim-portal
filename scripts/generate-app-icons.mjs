import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";

const publicDirectory = fileURLToPath(new URL("../public/", import.meta.url));
const iconDirectory = fileURLToPath(new URL("../public/icons/", import.meta.url));
await mkdir(iconDirectory, { recursive: true });

// An opaque canvas keeps the existing lowercase mark legible on any tab theme.
const response = new ImageResponse(
	createElement("div", {
		style: {
			width: "100%",
			height: "100%",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: "#ff7900",
			color: "#111111",
			fontFamily: "sans-serif",
			fontSize: 704,
			fontWeight: 700,
			lineHeight: 1,
		},
	}, createElement("span", { style: { position: "relative", top: -48 } }, "s")),
	{ width: 512, height: 512 },
);
const master = Buffer.from(await response.arrayBuffer());

for (const size of [96, 192, 512]) {
	await sharp(master).resize(size, size).png().toFile(`${iconDirectory}icon-${size}.png`);
}
await sharp(master).resize(180, 180).png().toFile(`${publicDirectory}apple-touch-icon.png`);

// ICO directory entries let older browsers select a native-resolution PNG.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => sharp(master).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (const [index, size] of sizes.entries()) {
	const entry = 6 + index * 16;
	header[entry] = size;
	header[entry + 1] = size;
	header.writeUInt16LE(1, entry + 4);
	header.writeUInt16LE(32, entry + 6);
	header.writeUInt32LE(images[index].length, entry + 8);
	header.writeUInt32LE(offset, entry + 12);
	offset += images[index].length;
}
await writeFile(`${publicDirectory}favicon.ico`, Buffer.concat([header, ...images]));
console.log("Generated favicon, Apple touch icon, and 96/192/512px app icons.");
