import clsx from "clsx";
import PersonLink from "@/components/domain/profile/PersonLink";
import EditThursdayButton from "@/components/domain/productions/EditThursdayButton";
import { MaskIcon } from "@/theme/MaskIcon";
import { isAdminRole } from "@/constants/roles";
import { formatShortMonthDayYear } from "@/constants/date-format";

// Producers/Faculty/Presenters - every "list of people" in this card uses
// this same 2-column grid instead of a flowing inline wrap.
const peopleListClassName = "grid grid-cols-[repeat(2,max-content)] gap-x-4 gap-y-1";
const personLinkClassName =
	"text-inherit! no-underline underline-offset-[0.14em] hover:text-[var(--brand-color)]! hover:underline";
const presentationTagClassName = "ui-label m-0 text-[var(--label-text)]";
const emptyStateClassName = "ui-note text-[var(--content-muted)]";
const sectionLabelClassName = "ui-label";
const inactiveSectionLabelClassName = "ui-label text-[var(--content-muted)]";
const metaIconClassName = "h-4 w-4 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

interface ProductionCardProps {
	thursday: any;
	production: any;
	productionIndex?: number;
	productionCount?: number;
	isAdmin?: boolean;
}

function formatOrdinal(value: number) {
	const remainder = value % 100;
	if (remainder >= 11 && remainder <= 13) return `${value}th`;

	switch (value % 10) {
		case 1:
			return `${value}st`;
		case 2:
			return `${value}nd`;
		case 3:
			return `${value}rd`;
		default:
			return `${value}th`;
	}
}

export default async function ProductionCard({
	thursday,
	production,
	productionIndex = 0,
	productionCount = 1,
	isAdmin = false,
}: ProductionCardProps) {
	const producers = production.producers.filter((user: any) => !isAdminRole(user.role));
	const faculty = production.producers.filter((user: any) => isAdminRole(user.role));
	const formattedDate = formatShortMonthDayYear(thursday.date);
	const isMultiple = productionCount > 1;
	const productionTitle = isMultiple
		? `${formatOrdinal(productionIndex + 1)}: ${production.name}`
		: production.name;

	const titleRow = (
		<div className="flex items-center justify-between gap-2">
			<h3 className="m-0 pl-2">{productionTitle}</h3>
			{isAdmin && <EditThursdayButton thursdayId={thursday.id} />}
		</div>
	);

	const fields = (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2 text-[var(--app-text)] min-[768px]:flex-row min-[768px]:gap-6">
				<div className="flex items-center gap-1.5">
					<MaskIcon icon="location/location.svg" className={metaIconClassName} />
					{production.location}
				</div>
				<div className="flex items-center gap-1.5">
					<MaskIcon icon="day/day.svg" className={metaIconClassName} />
					{formattedDate}
				</div>
			</div>
			<div className="grid grid-cols-2 gap-6 max-[640px]:grid-cols-1">
				<div className="flex min-w-0 flex-col gap-4">
					<div className="flex min-w-0 flex-col gap-2">
						<span className={producers.length > 0 ? sectionLabelClassName : inactiveSectionLabelClassName}>Producers</span>
						{producers.length > 0 ? (
							<div className={peopleListClassName}>
								{producers.map((producer: any) => (
									<PersonLink key={producer.id} userId={producer.id} className={personLinkClassName}>
										{producer.name}
									</PersonLink>
								))}
							</div>
						) : (
							<span className={emptyStateClassName}>No producers credited yet.</span>
						)}
					</div>
					<div className="flex min-w-0 flex-col gap-2">
						<span className={faculty.length > 0 ? sectionLabelClassName : inactiveSectionLabelClassName}>Faculty</span>
						{faculty.length > 0 ? (
							<div className={peopleListClassName}>
								{faculty.map((facultyMember: any) => (
									<PersonLink key={facultyMember.id} userId={facultyMember.id} className={personLinkClassName}>
										{facultyMember.name}
									</PersonLink>
								))}
							</div>
						) : (
							<span className={emptyStateClassName}>No faculty assigned yet.</span>
						)}
					</div>
				</div>
				<div className="flex min-w-0 flex-col gap-2">
					<span className={production.presentations.length > 0 ? sectionLabelClassName : inactiveSectionLabelClassName}>Presentations</span>
					<div className="flex flex-col gap-2">
						{production.presentations.length > 0 ? (
							production.presentations.map((presentation: any) => {
								const presenters = presentation.presenters || [];

								return (
									<div key={presentation.id} className="flex flex-col gap-1.5">
										<div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
											<h6 className="m-0">{presentation.name}</h6>
											{(presentation.tags || []).map((tag: string) => (
												<span key={tag} className={presentationTagClassName}>
													· {tag}
												</span>
											))}
										</div>
										{presenters.length > 0 ? (
											<div className={peopleListClassName}>
												{presenters.map((presenter: any) => (
													<PersonLink key={presenter.id} userId={presenter.id} className={personLinkClassName}>
														{presenter.name}
													</PersonLink>
												))}
											</div>
										) : (
											<span className={emptyStateClassName}>No one credited yet.</span>
										)}
									</div>
								);
							})
						) : (
							<span className={emptyStateClassName}>No presentations for this production yet.</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	if (!isMultiple) {
		return (
			<div>
				<div className="flex flex-col gap-2">
					{titleRow}
					<div className="p-5">{fields}</div>
				</div>
			</div>
		);
	}

	return (
		<div className={clsx("flex flex-col gap-2", productionIndex > 0 && "mt-6")}>
			{titleRow}
			<div className="p-5">
				{fields}
			</div>
		</div>
	);
}
