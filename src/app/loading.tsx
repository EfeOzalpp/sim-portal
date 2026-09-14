// Next.js wraps {children} in the root layout with a Suspense boundary
// whenever this file exists, and shows this while a route segment (page.tsx,
// including its own top-level awaits - auth/getAllSemesters/etc) is still
// resolving. Without it, a slow navigation just left the previous page
// sitting there with no feedback, which read as "the button did nothing"
// rather than "the page is loading."
export default function Loading() {
	return (
		<div className="grid h-full min-h-0 place-items-center text-[var(--app-label)]">
			Loading...
		</div>
	);
}
