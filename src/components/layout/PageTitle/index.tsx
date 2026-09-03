const titleTextShadow = [
	"0 0 0.65rem var(--brand-accent)",
	"0 0 1.15rem var(--brand-accent)",
	"0 0 1.85rem var(--brand-accent)",
].join(", ");

const titleBackground = [
	"radial-gradient(circle at 15% 28%, color-mix(in srgb, var(--app-text) 16%, transparent) 0 0.22rem, transparent 0.24rem)",
	"radial-gradient(circle at 32% 68%, color-mix(in srgb, var(--app-text) 10%, transparent) 0 0.36rem, transparent 0.38rem)",
	"radial-gradient(circle at 58% 30%, color-mix(in srgb, var(--app-text) 12%, transparent) 0 0.18rem, transparent 0.2rem)",
	"radial-gradient(circle at 72% 64%, color-mix(in srgb, var(--app-text) 14%, transparent) 0 0.3rem, transparent 0.32rem)",
	"radial-gradient(circle at 91% 35%, color-mix(in srgb, var(--app-text) 11%, transparent) 0 0.24rem, transparent 0.26rem)",
	"var(--accent-color, var(--brand-accent))",
].join(", ");

interface PageTitleProps {
	title: string;
	filter?: string | null;
}

export default function PageTitle({ title, filter }: PageTitleProps) {
	return (
		<div
			className="flex items-center justify-center p-4 text-center text-[var(--app-text)] print:hidden"
			style={{ background: titleBackground, backgroundSize: "17rem 5.25rem" }}
			data-page-title
		>
			<h2 className="m-0 leading-tight" style={{ textShadow: titleTextShadow }}>
				{filter ? `${title}, ${filter}` : title}
			</h2>
		</div>
	);
}
