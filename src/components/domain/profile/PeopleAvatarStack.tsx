"use client";

import FaceImage from "@/components/primitives/FaceImage";

export interface PersonPreview {
	id: string;
	name: string | null;
	image?: string | null;
}

interface PeopleAvatarStackProps {
	count: number;
	people?: PersonPreview[];
}

export default function PeopleAvatarStack({
	count: producerCount,
	people: producerPreviews = [],
}: PeopleAvatarStackProps) {
	if (producerCount < 1) return null;

	const visibleProducers = producerPreviews.slice(0, 3);
	const extraCount = Math.max(0, producerCount - visibleProducers.length);

	if (visibleProducers.length < 1) {
		return <span>{producerCount} people</span>;
	}

	return (
		<span className="flex items-center gap-2" aria-label={`${producerCount} people`}>
			<span className="flex -space-x-2" aria-hidden="true">
				{visibleProducers.map((producer) => (
					<span
						key={producer.id}
						className="relative h-7 w-7 flex-none overflow-hidden rounded-full border-2 border-solid border-[var(--page-bg)] bg-[var(--elevated-surface)]"
						title={producer.name ?? "Person"}
					>
						<FaceImage
							imagePath={producer.image}
							alt=""
							sizes="1.75rem"
							style={{ objectFit: "cover" }}
						/>
					</span>
				))}
			</span>
			{extraCount > 0 && <span className="ui-emphasis text-[var(--page-bar-label,var(--subtle-text))]">+{extraCount}</span>}
		</span>
	);
}
