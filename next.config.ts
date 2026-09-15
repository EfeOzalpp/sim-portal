import type { NextConfig } from "next";

const imageOrigin = process.env.NEXT_PUBLIC_IMAGE_ORIGIN?.trim();
const imageRemotePatterns = imageOrigin
	? [
			{
				protocol: new URL(imageOrigin).protocol.replace(":", "") as "http" | "https",
				hostname: new URL(imageOrigin).hostname,
				port: new URL(imageOrigin).port,
				pathname: "/media/user-images/**",
				search: "",
			},
		]
	: [];

// Next.js configuration for the application
const nextConfig: NextConfig = {
	turbopack: {
		root: __dirname,
	},
	experimental: {
		// Default is 1mb - too small for the 8mb images store.ts allows through.
		serverActions: {
			bodySizeLimit: "4mb",
		},
	},
	images: {
		remotePatterns: imageRemotePatterns,
		formats: ["image/webp"],
		qualities: [75, 85],
		maximumResponseBody: 10_000_000,
	},
	// Keep Next.js development tooling out of screenshots and video recordings.
	devIndicators: false,
	// Webpack customization
	webpack(config, { dev }) {
		if (!dev) {
			// Enable source maps in production to assist with debugging
			config.devtool = "source-map";
		}
		return config;
	},
};

export default nextConfig;
