import PeopleAvatarStack, { type PersonPreview } from "@/components/domain/profile/PeopleAvatarStack";

export type ThursdayProducerPreview = PersonPreview;

export default function ThursdayProducerAvatarStack({
	producerCount,
	producerPreviews,
}: {
	producerCount: number;
	producerPreviews?: ThursdayProducerPreview[];
}) {
	return <PeopleAvatarStack count={producerCount} people={producerPreviews} />;
}
