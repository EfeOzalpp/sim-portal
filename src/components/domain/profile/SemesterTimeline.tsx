import StringLabel from "@/components/primitives/StringLabel";

interface SemesterTimelineProps {
	items: string[];
}

const lineClassName = "absolute left-1/2 w-0 border-0 border-l border-solid border-[var(--lines-color)]";

export default function SemesterTimeline({ items }: SemesterTimelineProps) {
	if (items.length === 0) return null;

	return (
		<div className="flex flex-col pl-2">
			{items.map((item, index) => {
				const isFirst = index === 0;
				const isLast = index === items.length - 1;

				return (
					<div key={`${item}-${index}`} className="grid grid-cols-[1rem_1fr] items-stretch gap-x-2">
						<div className="relative">
							<span
								className={lineClassName}
								style={{ top: isFirst ? "-1rem" : 0, bottom: isLast ? "50%" : 0 }}
								aria-hidden="true"
							/>
							<span
								className="absolute top-1/2 left-1/2 w-2 border-0 border-t border-solid border-[var(--lines-color)]"
								aria-hidden="true"
							/>
						</div>
						<div className="flex py-1">
							{item.startsWith("Break") ? (
								<span className="ui-note text-[var(--subtle-text)]">{item}</span>
							) : (
								<StringLabel colorKey={item} className="self-start">{item}</StringLabel>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
