const titleTextShadow = [
	"0 0 0.65rem var(--brand-accent)",
	"0 0 1.15rem var(--brand-accent)",
	"0 0 1.85rem var(--brand-accent)",
].join(", ");

interface PageTitleProps {
	title: string;
	filter?: string | null;
}

export default function PageTitle({ title, filter }: PageTitleProps) {
	return (
		<div
			className="flex items-center justify-center px-6 py-3 text-center text-[var(--app-title)] print:hidden"
			style={{ background: "var(--accent-color, var(--brand-accent))" }}
			data-page-title
		>
			<h2 className="m-0 leading-tight" style={{ textShadow: titleTextShadow }}>
				{filter ? `${title}, ${filter}` : title}
			</h2>
		</div>
	);
}
