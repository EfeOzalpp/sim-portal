import type { ReactNode } from "react";
import clsx from "clsx";

interface PageTitleProps {
	title: string;
	// The page's primary semester Select (variant="title"), after the title text - see select/styles.ts.
	filterControl?: ReactNode;
	// For a page with no NavContent (e.g. /semester): the grid-driven left inset other pages get for free from NavContent's own column doesn't apply here, so this lines the title up with the content below it directly.
	contentClassName?: string;
	// Width of the box wrapping filterControl - defaults to what the Select variant="title" pages need.
	filterControlClassName?: string;
}

export default function PageTitle({ title, filterControl, contentClassName, filterControlClassName = "w-72 min-w-0 shrink-0" }: PageTitleProps) {
	return (
		<div
			// !: layout.module.css's `.contentDivider > [data-page-title] { display: flex; }`
			// is unconditional (no @media print), and its class+attribute selector
			// outranks a plain single-class utility - without !, display:flex wins
			// over print:hidden's display:none every time, regardless of the media query.
			className="items-center px-6 py-3 text-[var(--app-title)] print:hidden!"
			data-page-title
		>
			<div data-page-title-content className={clsx("flex min-w-0 flex-wrap items-center gap-x-5 gap-y-1", contentClassName)}>
				<h2 className="m-0 min-w-0 leading-tight">
					{title}
				</h2>
				{filterControl && <div className={filterControlClassName}>{filterControl}</div>}
			</div>
		</div>
	);
}
