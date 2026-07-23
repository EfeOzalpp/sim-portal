import type { NextConfig } from "next";

// Next.js configuration for the application
const nextConfig: NextConfig = {
	turbopack: {},
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
