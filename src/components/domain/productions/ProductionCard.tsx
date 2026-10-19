import clsx from "clsx";
import PersonLink from "@/components/domain/profile/PersonLink";
import EditThursdayButton from "@/components/domain/productions/EditThursdayButton";
import { Button, type ButtonSurface } from "@/components/button";
import { MaskIcon } from "@/theme/MaskIcon";
import { isAdminRole } from "@/constants/roles";
import { formatShortMonthDayYear } from "@/constants/date-format";
import styles from "@/components/domain/productions/ProductionCard.module.css";

// Producers/Faculty/Presenters - every "list of people" in this card uses
// this same 2-column grid instead of a flowing inline wrap.
const peopleListClassName = "grid grid-cols-[repeat(2,max-content)] gap-x-6 gap-y-1";
const personLinkClassName =
	"text-inherit! no-underline underline-offset-[0.14em] hover:text-[var(--inline-link-hover)]! hover:underline";
const presentationTagClassName = "ui-label m-0 text-[var(--label-text)]";
const emptyStateClassName = "ui-note text-[var(--content-muted)]";
const sectionLabelClassName = "ui-label m-0 block";
const inactiveSectionLabelClassName = "ui-label m-0 block text-[var(--content-muted)]";
const metaIconClassName = "h-4 w-4 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";

interface ProductionCardProps {
	thursday: any;
	production: any;
	productionIndex?: number;
	productionCount?: number;
	isAdmin?: boolean;
	showEditButton?: boolean;
	surface?: ButtonSurface;
}

export default async function ProductionCard({
	thursday,
	production,
	productionIndex = 0,
	productionCount = 1,
	isAdmin = false,
	showEditButton = true,
	surface = "modal",
}: ProductionCardProps) {
	const producers = production.producers.filter((user: any) => !isAdminRole(user.role));
	const faculty = production.producers.filter((user: any) => isAdminRole(user.role));
	const formattedDate = formatShortMonthDayYear(thursday.date);
	const isMultiple = productionCount > 1;
	const isLastProduction = productionIndex >= productionCount - 1;
	const isPlaceholderDisplay = Boolean(production.isPlaceholderDisplay);

	const titleRow = (
		<div className="flex items-center justify-between gap-2 px-5">
			<h3 className="m-0 flex min-w-0 items-baseline gap-2">
				<span className={clsx("min-w-0 truncate", isPlaceholderDisplay && "text-[var(--content-muted)]")}>
					{isPlaceholderDisplay ? "Untitled Production" : production.name}
				</span>
			</h3>
			{(surface === "modal" || (isAdmin && showEditButton)) && (
				<div className="flex shrink-0 items-center gap-2">
					{surface === "modal" && <Button surface="modal" variant="tool" type="button" icon="download/download.svg" aria-label="Print production" title="Print production" />}
					{isAdmin && showEditButton && <EditThursdayButton thursdayId={thursday.id} surface={surface} />}
				</div>
			)}
		</div>
	);

	const fields = (
		<div className={styles.fields}>
			<div className={styles.meta}>
				<div className="flex items-center gap-1.5">
					<MaskIcon icon="location/location.svg" className={metaIconClassName} />
					{production.location}
				</div>
				<div className="flex items-center gap-1.5">
					<MaskIcon icon="day/day.svg" className={metaIconClassName} />
					{formattedDate}
				</div>
			</div>
			<div className={styles.split}>
				<div className={styles.people}>
					<div className={styles.section}>
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
					<div className={styles.section}>
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
				<div className={styles.presentationsColumn}>
					<span className={production.presentations.length > 0 ? sectionLabelClassName : inactiveSectionLabelClassName}>Presentations</span>
					<div className={styles.presentationList} data-surface={surface}>
						{production.presentations.length > 0 ? (
							production.presentations.map((presentation: any) => {
								const presenters = presentation.presenters || [];

								return (
									<div key={presentation.id} className="flex flex-col gap-1.5">
										{(presentation.tags || []).length > 0 && (
											<div className="flex flex-wrap items-center gap-1">
												{presentation.tags.map((tag: string) => (
													<span key={tag} className={presentationTagClassName}>
														{tag}
													</span>
												))}
											</div>
										)}
										<h6 className={clsx("m-0", surface === "modal" && "modal-presentation-title")}>{presentation.name}</h6>
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
		<div
			className={clsx(
				"flex flex-col gap-2",
				productionIndex > 0 && "pt-6",
				!isLastProduction && "border-b border-b-[var(--modal-separator)] pb-6",
			)}
		>
			{titleRow}
			<div className="p-5">
				{fields}
			</div>
		</div>
	);
}
