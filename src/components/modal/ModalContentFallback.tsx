"use client";

import { LoadingOutlined } from "@ant-design/icons";

// @ant-design/icons isn't "use client" itself - importing it straight into a
// Server Component (e.g. as a Suspense fallback in a page.tsx) pulls it into
// the RSC module graph, which has no createContext and crashes. This file's
// own "use client" boundary is what keeps it safe to use from a page.tsx.
export default function ModalContentFallback() {
	return (
		<div className="grid h-full place-items-center p-10 text-[var(--label-text)]">
			<LoadingOutlined spin style={{ fontSize: "1.5rem" }} />
		</div>
	);
}
