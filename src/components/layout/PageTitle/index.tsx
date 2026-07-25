const titleTextClassName =
	"relative z-[1] m-0 inline-flex box-border items-center justify-center border-0 bg-transparent text-center";

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
			className="relative isolate flex min-h-[5.25rem] items-center justify-center overflow-hidden border-b-[length:var(--app-border-width)] border-solid border-[var(--app-border)] text-[var(--app-text)] leading-[var(--line-height-tight)] max-[768px]:border-b-0 print:hidden"
			style={{ background: titleBackground, backgroundSize: "17rem 5.25rem" }}
			data-page-title
		>
			<h2
				className={`${titleTextClassName} gap-[0.18em] p-[var(--spacing-md)] max-[768px]:flex-col max-[768px]:gap-0`}
				style={{ textShadow: titleTextShadow }}
			>
				<span>{filter ? `${title},` : title}</span>
				{filter ? (
					<span
						className={`${titleTextClassName} [font:inherit]`}
						style={{ textShadow: titleTextShadow }}
					>
						{filter}
					</span>
				) : null}
			</h2>
		</div>
	);
}
