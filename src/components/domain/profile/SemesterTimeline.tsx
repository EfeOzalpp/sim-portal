interface SemesterTimelineProps {
	items: string[];
}

const badgeClassName =
	"self-start rounded-md border-solid border-[var(--input-border-hover)] bg-[var(--label-bg)] px-2 py-1 font-sans text-xs leading-tight font-semibold text-[var(--label-text)] uppercase border";

const lineClassName = "absolute left-1/2 w-px -translate-x-1/2 bg-[var(--lines-color)]";

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
								style={isFirst ? { top: "-1rem", height: "calc(50% + 1rem)" } : { top: 0, height: "50%" }}
								aria-hidden="true"
							/>
							{!isLast && (
								<span className={lineClassName} style={{ bottom: 0, height: "50%" }} aria-hidden="true" />
							)}
							<span
								className="absolute top-1/2 left-1/2 h-px w-2 -translate-y-1/2 bg-[var(--lines-color)]"
								aria-hidden="true"
							/>
							<span
								className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--lines-color)]"
								aria-hidden="true"
							/>
						</div>
						<div className="flex py-1">
							{item.startsWith("Break") ? (
								<span className="ui-note">{item}</span>
							) : (
								<div className={badgeClassName}>{item}</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
