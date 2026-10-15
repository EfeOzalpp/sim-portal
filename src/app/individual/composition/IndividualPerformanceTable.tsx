"use client";

// React & Next.js
import { Fragment, useRef, useEffect, useMemo, useState } from "react";

// Actions
import { updateUserSemesterGrades } from "@/actions/semesters";

// Components
import PersonLink from "@/components/domain/profile/PersonLink";
import { useOptionalActionMode } from "@/components/layout/ActionMode";
import { usePageChrome } from "@/components/layout/PageChrome";
import { MaskIcon } from "@/theme/MaskIcon";
import FaceImage from "@/components/primitives/FaceImage";

// Composition
import ThursdayLink from "@/app/individual/composition/ThursdayLink";
import GradeEditorModal, { GradeMap } from "@/app/individual/composition/GradeEditorModal";
import { useSelectedUsers } from "@/app/individual/composition/SelectedUsersProvider";
import styles from "@/app/individual/composition/IndividualPerformanceTable.module.css";

// Helpers
import clsx from "clsx";
import { ACTION_MODES } from "@/constants/action-modes";
import { Prisma } from "@prisma/client";
import { formatSemesterCode } from "@/components/domain/filters/semester-filter";
import { getLabelColors } from "@/constants/labelColors";
import { formatShortMonthDay } from "@/constants/date-format";

type ProductionWithThursday = Prisma.ProductionGetPayload<{ include: { thursday: { select: { id: true, date: true, semester: { select: { name: true } } } } } }>;
type PresentationWithProduction = Prisma.PresentationGetPayload<{ include: { production: { include: { thursday: { select: { id: true, date: true, semester: { select: { name: true } } } } } } } }>;

interface UserStat {
	id: string;
	name: string | null;
	image?: string | null;
	semesters?: { id: string; name: string; grade?: GradeMap[string] }[];
	productions: (ProductionWithThursday & { date: Date | undefined })[];
	presentationsBeforeMid: (PresentationWithProduction & { date: Date | undefined })[];
	presentationsAfterMid: (PresentationWithProduction & { date: Date | undefined })[];
}

interface IndividualPerformanceTableProps {
	users?: UserStat[];
	/** "All" scope shows items from every semester at once (semester name
	    tells them apart); "Current" scope is already one semester, so the
	    Thursday's own date is the more useful thing to show instead. */
	isAllScope?: boolean;
	/** The semester selected at the top of the page - Grades uses this to
	    show only that semester's grade when isAllScope is false, instead of
	    every semester the student has ever had a grade in (confusing next to
	    a page titled e.g. "Fall 2026 Semester"). */
	currentSemesterId?: string | null;
	/** e.g. "FA26" - shown next to "Names" so the roster's own semester is
	    obvious at a glance, regardless of the Presentations/Productions/
	    Grades scope below. */
	currentSemesterCode?: string;
}

const progressItemIconClassName = "h-5 w-5 flex-none bg-[var(--app-text)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]";
const progressItemClassName = clsx(styles.progressItem, "no-underline");
const progressLinkClassName = "ui-note not-italic cursor-pointer self-start border-0 bg-transparent p-0 text-[var(--inline-link)] underline underline-offset-[0.18em] hover:text-[var(--inline-link-hover)]";

// isAllScope: All-scope items span multiple semesters, so the semester code
// shows up in the row (right after the date pill, before groupLabel/tags) -
// Current scope is already one semester, so it'd be redundant on every item.
function getProgressSemesterCode(isAllScope: boolean, semesterName: string | undefined) {
	return isAllScope && semesterName ? formatSemesterCode(semesterName) : undefined;
}

// truncate: the collapsed single-card view only - one line each for the tag
// row and the title, clipped if they overflow, revealed (wrapping instead)
// on hover via .progressItemTruncated in the CSS module. The expanded
// "Show more" list passes truncate={false} - the user already asked to see
// everything there, so those items just wrap normally with no hover needed.
function ProgressItem({ name, thursdayId, groupLabel, tags, semesterCode, meta, truncate = true }: { name: string; thursdayId?: string; groupLabel?: string; tags?: string[]; semesterCode?: string; meta?: string; truncate?: boolean }) {
	// meta (the date, colored deterministically by its own text so matching
	// dates partition into the same color across the app) leads the row,
	// then semester code (its own neutral pill, not colorful like meta - see
	// --elevated-2-label-* in styling-theme.css), then groupLabel/tags as
	// plain text.
	const chips = [groupLabel, ...(tags || [])].filter((chip): chip is string => !!chip);
	const metaColors = meta ? getLabelColors(meta) : undefined;
	const leadCount = (meta ? 1 : 0) + (semesterCode ? 1 : 0);
	const content = (
		<>
			{(leadCount > 0 || chips.length > 0) && (
				<span className={clsx("ui-label flex items-center gap-1.5", styles.tagRow)}>
					{meta && metaColors && (
						<span
							className={styles.progressMetaLabel}
							style={{ borderBottomColor: metaColors.bg, color: metaColors.text }}
						>
							{meta}
						</span>
					)}
					{semesterCode && (
						<>
							{meta && <span className={styles.countText} aria-hidden="true">·</span>}
							<span className={styles.progressSemesterLabel}>
								{semesterCode}
							</span>
						</>
					)}
					{chips.map((chip, index) => (
						<Fragment key={`${chip}-${index}`}>
							{(index > 0 || leadCount > 0) && <span className={styles.countText} aria-hidden="true">·</span>}
							<span className={styles.countText}>{chip}</span>
						</Fragment>
					))}
				</span>
			)}
			<span className={styles.itemName} title={name}>
				{name}
			</span>
			<span className={styles.progressItemIcon} aria-hidden="true">
				<MaskIcon icon="view/forward.svg" className={progressItemIconClassName} />
			</span>
		</>
	);

	const className = clsx(progressItemClassName, truncate && styles.progressItemTruncated);

	if (!thursdayId) {
		return <span className={className}>{content}</span>;
	}

	return (
		<ThursdayLink thursdayId={thursdayId} className={className}>
			{content}
		</ThursdayLink>
	);
}

interface ProgressListItem {
	id: string;
	name: string;
	thursdayId?: string;
	tags?: string[];
	semesterCode?: string;
	meta?: string;
}

function ProgressItemList({ items, groupLabel }: { items: ProgressListItem[]; groupLabel?: string }) {
	const [expanded, setExpanded] = useState(false);

	if (items.length === 0) return null;

	if (expanded) {
		return (
			<div className={clsx(styles.expandedList, "flex flex-col")}>
				{items.map((item) => (
					<ProgressItem key={item.id} name={item.name} thursdayId={item.thursdayId} groupLabel={groupLabel} tags={item.tags} semesterCode={item.semesterCode} meta={item.meta} truncate={false} />
				))}
				<button type="button" onClick={() => setExpanded(false)} className={clsx(progressLinkClassName, "mt-2 pl-[0.85rem]", "print:hidden")}>
					Less
				</button>
			</div>
		);
	}

	const [first, ...rest] = items;

	return (
		<div className="flex items-start gap-3">
			<ProgressItem name={first.name} thursdayId={first.thursdayId} groupLabel={groupLabel} tags={first.tags} semesterCode={first.semesterCode} meta={first.meta} />
			{/* Fixed width, always reserved (even with nothing to show) - so the
			    card beside it (flex-1 in the CSS module) is always the same
			    width whether or not this row actually has a "N more" to show. */}
			<div className="mt-3 flex w-[4.5rem] flex-none flex-col gap-0.5">
				{rest.length > 0 && (
					<>
						<span className="text-[var(--subtle-text)]">{rest.length}+</span>
						<button type="button" onClick={() => setExpanded(true)} className={progressLinkClassName} aria-label={`Show ${rest.length} more`}>
							More
						</button>
					</>
				)}
			</div>
		</div>
	);
}

// Shared between the header table and the body table (see the render below)
// so their columns line up exactly - table-layout: fixed makes both tables
// honor these widths precisely instead of letting content nudge them apart.
const COLUMN_WIDTHS = ["4%", "17%", "34%", "27%", "18%"];

// Not wired to anything yet - just the row-selection UI ahead of a later
// "export only the checked people" feature.
//
// appearance-none, not accent-color - accent-color only recolors the native
// widget, which still paints its own default fill/box underneath regardless
// of background-color, so the "no default bg" ask can't be met that way.
// Going appearance-none instead hands the whole box (border/background) to
// plain CSS, so the checkmark also has to be drawn ourselves - a MaskIcon
// overlay, shown from React's own checked state rather than a CSS :checked
// selector.
// group-hover, not just hover - so hovering anywhere in the row (via the
// "group" class on its <tr>) also shows the checkbox's hover state, not
// only a direct hover over the checkbox itself.
const checkboxInputClassName =
	"h-4 w-4 cursor-pointer appearance-none rounded-xs border-2 border-solid border-[var(--page-checkbox-border)] bg-transparent group-hover:border-[var(--page-checkbox-border-hover)]";
const checkboxHitAreaClassName =
	"relative inline-flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full transition-colors duration-150 hover:bg-[var(--page-checkbox-hover-bg)] focus-within:bg-[var(--page-checkbox-hover-bg)] active:bg-[var(--page-checkbox-checked-bg)] group-hover:bg-[var(--page-checkbox-hover-bg)] max-[768px]:h-10 max-[768px]:w-10";
const checkmarkClassName = "pointer-events-none absolute inset-0 h-4 w-4 bg-[var(--page-checkbox-checkmark)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:85%]";
const checkedCheckboxStyle = {
	backgroundColor: "var(--page-checkbox-checked-bg)",
	borderColor: "var(--page-checkbox-checked-bg)",
};

function Checkbox({ checked, indeterminate = false, onChange, ariaLabel }: { checked: boolean; indeterminate?: boolean; onChange: () => void; ariaLabel: string }) {
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (ref.current) ref.current.indeterminate = indeterminate;
	}, [indeterminate]);

	return (
		<label className={checkboxHitAreaClassName} onClick={(event) => event.stopPropagation()}>
			<span className="relative inline-flex h-4 w-4 flex-none">
				<input
					ref={ref}
					type="checkbox"
					className={checkboxInputClassName}
					checked={checked}
					aria-label={ariaLabel}
					style={checked ? checkedCheckboxStyle : undefined}
					onChange={onChange}
				/>
				{checked && <MaskIcon icon="check/check.svg" className={checkmarkClassName} />}
			</span>
			{!checked && indeterminate && (
				<span className="pointer-events-none absolute inset-0 m-auto h-px w-2 bg-[var(--page-checkbox-checkmark)]" aria-hidden="true" />
			)}
		</label>
	);
}

function SelectAllCheckbox({ users, selectedUserIds, onChange }: { users: UserStat[]; selectedUserIds: Set<string>; onChange: (next: Set<string>) => void }) {
	const selectedCount = users.filter((user) => selectedUserIds.has(user.id)).length;
	const allSelected = users.length > 0 && selectedCount === users.length;
	const someSelected = selectedCount > 0 && !allSelected;

	return (
		<Checkbox
			checked={allSelected}
			indeterminate={someSelected}
			ariaLabel="Select all"
			onChange={() => onChange(allSelected ? new Set() : new Set(users.map((user) => user.id)))}
		/>
	);
}

function ColumnWidths({ widths }: { widths: string[] }) {
	return (
		<colgroup>
			{widths.map((width, index) => (
				<col key={index} style={{ width }} />
			))}
		</colgroup>
	);
}

type SortKey = "name" | "productions" | "presentations";
type SortDirection = "asc" | "desc";
type SortState = { key: SortKey; direction: SortDirection } | null;

function presentationCount(user: UserStat) {
	return (user.presentationsBeforeMid?.length || 0) + (user.presentationsAfterMid?.length || 0);
}

const compareByKey: Record<SortKey, (a: UserStat, b: UserStat) => number> = {
	name: (a, b) => (a.name || "").localeCompare(b.name || ""),
	productions: (a, b) => (a.productions?.length || 0) - (b.productions?.length || 0),
	presentations: (a, b) => presentationCount(a) - presentationCount(b),
};

function SortableHeader({ label, sortKey, sort, onSort }: { label: string; sortKey: SortKey; sort: SortState; onSort: (key: SortKey) => void }) {
	const isActive = sort?.key === sortKey;

	return (
		<button type="button" className={styles.sortableHeader} onClick={() => onSort(sortKey)}>
			{label}
			<span
				className={clsx(styles.sortIcon, isActive && styles.sortIconActive, isActive && sort?.direction === "desc" && styles.sortIconDesc)}
				aria-hidden="true"
			/>
		</button>
	);
}

export default function IndividualPerformanceTable({ users = [], isAllScope = false, currentSemesterId = null, currentSemesterCode }: IndividualPerformanceTableProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);
	const lastTableScrollRef = useRef({ left: 0, top: 0 });
	const { activeMode } = useOptionalActionMode();
	const { reportScrollTop } = usePageChrome();
	const [selectedGradeUser, setSelectedGradeUser] = useState<UserStat | null>(null);
	const [sort, setSort] = useState<SortState>({ key: "presentations", direction: "desc" });
	// Shared with SelectedCountLabel in the page header, via SelectedUsersProvider.
	const { selectedUserIds, setSelectedUserIds } = useSelectedUsers();
	const persistedGradesByUser = useMemo(() => {
		return users.reduce<Record<string, GradeMap>>((nextValue, user) => {
			nextValue[user.id] = (user.semesters || []).reduce<GradeMap>((semesterGrades, semester) => {
				semesterGrades[semester.id] = semester.grade || null;
				return semesterGrades;
			}, {});

			return nextValue;
		}, {});
	}, [users]);
	const [gradesByUser, setGradesByUser] = useState<Record<string, GradeMap>>({});
	const selectedGradeMap = selectedGradeUser
		? gradesByUser[selectedGradeUser.id] || persistedGradesByUser[selectedGradeUser.id] || {}
		: {};

	useEffect(() => {
		setGradesByUser(persistedGradesByUser);
	}, [persistedGradesByUser]);

	// The body owns vertical and horizontal scrolling. The header is a
	// separate table above it, so body horizontal scroll mirrors into the
	// header while vertical scroll reports to the mobile chrome.
	useEffect(() => {
		const scroll = scrollRef.current;
		const headerScroll = headerScrollRef.current;
		if (!scroll || !headerScroll) return;

		lastTableScrollRef.current = {
			left: scroll.scrollLeft,
			top: scroll.scrollTop,
		};

		const onScroll = () => {
			const previousScroll = lastTableScrollRef.current;
			const horizontalDelta = Math.abs(scroll.scrollLeft - previousScroll.left);
			const verticalDelta = Math.abs(scroll.scrollTop - previousScroll.top);
			lastTableScrollRef.current = {
				left: scroll.scrollLeft,
				top: scroll.scrollTop,
			};

			headerScroll.scrollLeft = scroll.scrollLeft;
			if (
				window.matchMedia("(max-width: 768px)").matches &&
				verticalDelta >= horizontalDelta * 2
			) {
				reportScrollTop(scroll.scrollTop, {
					preserveCollapsedUntilTop: true,
					reopenDistance: 48,
				});
			}
		};

		scroll.addEventListener("scroll", onScroll, { passive: true });
		reportScrollTop(scroll.scrollTop);
		return () => {
			scroll.removeEventListener("scroll", onScroll);
		};
	}, [reportScrollTop]);

	function toggleSort(key: SortKey) {
		setSort((current) => {
			if (current?.key !== key) return { key, direction: "asc" };
			if (current.direction === "asc") return { key, direction: "desc" };
			return null;
		});
	}

	function ariaSortFor(key: SortKey) {
		if (sort?.key !== key) return "none" as const;
		return sort.direction === "asc" ? ("ascending" as const) : ("descending" as const);
	}

	function toggleUserSelected(userId: string) {
		const next = new Set(selectedUserIds);
		if (next.has(userId)) {
			next.delete(userId);
		} else {
			next.add(userId);
		}
		setSelectedUserIds(next);
	}

	const sortedUsers = useMemo(() => {
		if (!sort) return users;
		const sorted = [...users].sort(compareByKey[sort.key]);
		return sort.direction === "desc" ? sorted.reverse() : sorted;
	}, [users, sort]);

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div ref={headerScrollRef} className={styles.headerScroll}>
				<div className={styles.tableInset}>
				<table className={styles.table}>
					<ColumnWidths widths={COLUMN_WIDTHS} />
					<thead>
						<tr>
							<th>
								<SelectAllCheckbox users={sortedUsers} selectedUserIds={selectedUserIds} onChange={setSelectedUserIds} />
							</th>
							<th aria-sort={ariaSortFor("name")}>
								<SortableHeader label={currentSemesterCode ? `Names (${currentSemesterCode})` : "Names"} sortKey="name" sort={sort} onSort={toggleSort} />
							</th>
							<th aria-sort={ariaSortFor("presentations")}>
								<SortableHeader label="Presentations" sortKey="presentations" sort={sort} onSort={toggleSort} />
							</th>
							<th aria-sort={ariaSortFor("productions")}>
								<SortableHeader label="Productions" sortKey="productions" sort={sort} onSort={toggleSort} />
							</th>
							<th>Grades</th>
						</tr>
					</thead>
				</table>
				</div>
			</div>
			<div ref={scrollRef} className={styles.tableScroll}>
				<div className={styles.tableInset}>
				<table className={styles.table}>
					<ColumnWidths widths={COLUMN_WIDTHS} />
					<tbody>
						{sortedUsers.map((user) => {
							const productions = user.productions || [];
							const hasPreMid = user.presentationsBeforeMid?.length > 0;
							const hasPostMid = user.presentationsAfterMid?.length > 0;
							const userGrades = gradesByUser[user.id] || {};
							const selectedGrades = (user.semesters || [])
								.map((semester) => ({ semester, grade: userGrades[semester.id] }))
								.filter((entry): entry is { semester: { id: string; name: string }; grade: NonNullable<GradeMap[string]> } => !!entry.grade)
								.filter((entry) => isAllScope || entry.semester.id === currentSemesterId);

							const isSelected = selectedUserIds.has(user.id);

							return (
								<tr
									key={user.id}
									className="group"
									data-selected={isSelected || undefined}
									onClick={(event) => {
										const target = event.target as HTMLElement;
										if (target.closest("a, button, input")) {
											return;
										}
										// Only steal the click while grade-editing mode is actually
										// active - otherwise the grade cell (like any other cell)
										// should still be able to select the row.
										if (activeMode === ACTION_MODES.editGrades && target.closest('[data-action-mode-target="grade-cell"]')) {
											return;
										}
										toggleUserSelected(user.id);
									}}
								>
									<td>
										<Checkbox
											checked={isSelected}
											ariaLabel={`Select ${user.name}`}
											onChange={() => toggleUserSelected(user.id)}
										/>
									</td>
									<td>
										<PersonLink userId={user.id} className={clsx(styles.nameLink, "inline-flex max-w-full items-center gap-3")}>
											<span className="relative h-10 w-10 flex-none overflow-hidden rounded-full">
												<FaceImage
													imagePath={user.image}
													alt={`${user.name}'s face`}
													sizes="2.5rem"
													style={{ objectFit: "cover" }}
												/>
											</span>
											<span className="min-w-0 truncate print:overflow-visible print:text-clip print:whitespace-normal">{user.name}</span>
										</PersonLink>
									</td>
									<td>
										{!hasPreMid && !hasPostMid ? (
											<span className={styles.emptyCell}>-</span>
										) : (
											<>
												{hasPreMid && (
													<div className={styles.section}>
														<ProgressItemList
															groupLabel="Pre-Mid"
															items={user.presentationsBeforeMid.map((presentation) => ({
																id: presentation.id,
																name: presentation.name,
																thursdayId: presentation.production?.thursday?.id,
																tags: presentation.tags,
																semesterCode: getProgressSemesterCode(isAllScope, presentation.production?.thursday?.semester?.name),
																meta: formatShortMonthDay(presentation.date),
															}))}
														/>
													</div>
												)}
												{hasPostMid && (
													<div className={styles.section}>
														<ProgressItemList
															groupLabel="Post-Mid"
															items={user.presentationsAfterMid.map((presentation) => ({
																id: presentation.id,
																name: presentation.name,
																thursdayId: presentation.production?.thursday?.id,
																tags: presentation.tags,
																semesterCode: getProgressSemesterCode(isAllScope, presentation.production?.thursday?.semester?.name),
																meta: formatShortMonthDay(presentation.date),
															}))}
														/>
													</div>
												)}
											</>
										)}
									</td>
									<td>
										{productions.length === 0 ? (
											<span className={styles.emptyCell}>-</span>
										) : (
											<div className={styles.section}>
												<ProgressItemList
													items={productions.map((production) => ({
														id: production.id,
														name: production.name,
														thursdayId: production.thursday_id,
														semesterCode: getProgressSemesterCode(isAllScope, production.thursday?.semester?.name),
														meta: formatShortMonthDay(production.date),
													}))}
												/>
											</div>
										)}
									</td>
									<td
										data-action-mode-target="grade-cell"
										onClick={() => {
											if (activeMode === ACTION_MODES.editGrades) {
												setSelectedGradeUser(user);
											}
										}}
									>
										<div className={styles.gradeCell}>
											{selectedGrades.length > 0 ? (
												<div className={styles.gradeList}>
													{selectedGrades.map(({ semester, grade }) => (
														<span key={semester.id} className={styles.gradeValue}>
															<strong>{grade}</strong>
															{isAllScope && <span className={styles.gradeSemester}>{formatSemesterCode(semester.name)}</span>}
														</span>
													))}
												</div>
											) : activeMode !== ACTION_MODES.editGrades ? (
												<span className={clsx(styles.emptyCell, "flex-1")}>-</span>
											) : null}
											<span className={styles.gradeEditOverlay} data-grade-action-overlay aria-hidden="true">
												<span className={styles.actionOverlayIcon} />
											</span>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				</div>
			</div>
			<GradeEditorModal
				user={selectedGradeUser}
				value={selectedGradeMap}
				onChange={async (nextValue) => {
					if (!selectedGradeUser) {
						return;
					}

					await updateUserSemesterGrades({
						userId: selectedGradeUser.id,
						grades: nextValue,
					});

					setGradesByUser((current) => ({
						...current,
						[selectedGradeUser.id]: nextValue,
					}));
				}}
				onClose={() => setSelectedGradeUser(null)}
			/>
		</div>
	);
}
