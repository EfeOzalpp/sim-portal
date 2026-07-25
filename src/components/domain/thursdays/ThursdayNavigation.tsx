import { Button } from "@/components/ui/AntD";

interface ThursdayNavigationProps {
	previous: { id: string; name: string; date: Date } | null;
	next: { id: string; name: string; date: Date } | null;
}

export default function ThursdayNavigation({ previous, next }: ThursdayNavigationProps) {
	return (
		<nav
			className="mb-app-md flex flex-col items-stretch justify-between gap-app-md min-[769px]:flex-row min-[769px]:items-center"
			aria-label="Adjacent Thursdays"
		>
			<div className="flex min-w-0 w-full justify-start min-[769px]:w-auto">
				{previous && (
					<Button href={`/thursdays/${previous.id}`}>
						<span style={{ fontSize: "1.2rem", color: "#555", marginRight: "6px", lineHeight: 1 }}>←</span>Prior: {previous.name}
					</Button>
				)}
			</div>
			<div className="ml-0 flex min-w-0 w-full justify-start min-[769px]:ml-auto min-[769px]:w-auto min-[769px]:justify-end">
				{next && (
					<Button href={`/thursdays/${next.id}`}>
						Next: {next.name}<span style={{ fontSize: "1.2rem", color: "#555", marginLeft: "6px", lineHeight: 1 }}>→</span>
					</Button>
				)}
			</div>
		</nav>
	);
}
