"use client";

// React & Next.js
import type { ReactNode } from "react";
import { useRef, useEffect, useMemo, useState } from "react";

// Actions
import { updateUserSemesterGrades } from "@/actions/semesters";

// Components
import PersonLink from "@/components/domain/profile/PersonLink";
import { useActionMode } from "@/components/layout/ActionMode";

// Composition
import ThursdayLink from "@/app/individual/composition/ThursdayLink";
import GradeEditorModal, { GradeMap } from "@/app/individual/composition/GradeEditorModal";
import styles from "@/app/individual/composition/IndividualPerformanceTable.module.css";

// Helpers
import clsx from "clsx";
import { ACTION_MODES } from "@/constants/action-modes";
import { Prisma } from "@prisma/client";
import { formatSemesterCode } from "@/components/domain/filters/semester-filter";

type ProductionWithThursday = Prisma.ProductionGetPayload<{ include: { thursday: { select: { id: true, date: true, semester: { select: { name: true } } } } } }>;
type PresentationWithProduction = Prisma.PresentationGetPayload<{ include: { production: { include: { thursday: { select: { id: true, date: true, semester: { select: { name: true } } } } } } } }>;

interface UserStat {
	id: string;
	name: string | null;
	semesters?: { id: string; name: string; grade?: GradeMap[string] }[];
	productions: (ProductionWithThursday & { date: Date | undefined })[];
	presentationsBeforeMid: (PresentationWithProduction & { date: Date | undefined })[];
	presentationsAfterMid: (PresentationWithProduction & { date: Date | undefined })[];
}

interface IndividualPerformanceTableProps {
	users?: UserStat[];
	// Only worth showing per-item - every row's items already share the one
	// selected semester otherwise, so the label would just repeat itself.
	isAllSemesters?: boolean;
}

const dateFormat: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

function TableItem({ name, date, thursdayId, semesterName }: { name: string; date?: Date; thursdayId?: string; semesterName?: string }) {
	const dateLabel = date ? new Date(date).toLocaleDateString("en-US", dateFormat) : "No date";
	// Plain text alongside the date (e.g. "Sep 3, FA26") rather than a
	// separate badge - this list is dense enough already without another
	// pill per row, and it's only shown at all when semesterName is passed
	// (i.e. the "All Semesters" filter is active).
	const dateWithSemester = semesterName ? `${dateLabel}, ${formatSemesterCode(semesterName)}` : dateLabel;
	const content = (
		<>
			<span className={styles.itemName}>{name}</span>
			<span className={styles.itemDate}>{dateWithSemester}</span>
		</>
	);

	if (!thursdayId) {
		return <span className={styles.itemLink}>{content}</span>;
	}

	return (
		<ThursdayLink thursdayId={thursdayId} className={styles.itemLink}>
			{content}
		</ThursdayLink>
	);
}

function ItemList({ children }: { children: ReactNode }) {
	return <div className={styles.itemList}>{children}</div>;
}

const TABLE_MIN_WIDTH = 720;

// Shared between the header table and the body table (see the render below)
// so their columns line up exactly - table-layout: fixed makes both tables
// honor these widths precisely instead of letting content nudge them apart.
const COLUMN_WIDTHS = ["16%", "31%", "31%", "22%"];

function ColumnWidths() {
	return (
		<colgroup>
			{COLUMN_WIDTHS.map((width, index) => (
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

export default function IndividualPerformanceTable({ users = [], isAllSemesters = false }: IndividualPerformanceTableProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const topScrollRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);
	const { activeMode } = useActionMode();
	const [selectedGradeUser, setSelectedGradeUser] = useState<UserStat | null>(null);
	const [sort, setSort] = useState<SortState>(null);
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

	// Keeps three independently-scrollable regions in horizontal lockstep:
	// the fake scrollbar above the table (visible even when the real one, at
	// the table's bottom edge, is scrolled far out of view), the header row,
	// and the body. The header has its own scroll container (rather than
	// sharing one with the body, like a plain <thead>/<tbody> pair normally
	// would) specifically so it can be position: sticky - an element with
	// overflow-x: auto is a scroll container as a whole, on both axes at
	// once, regardless of what overflow-y is set to, which would otherwise
	// permanently block any sticky descendant from ever reaching a scroll
	// ancestor further out. The header never fires its own scroll events
	// (overflow: hidden, no direct user interaction), so it only ever gets
	// written to here, never read from.
	useEffect(() => {
		const scroll = scrollRef.current;
		const topScroll = topScrollRef.current;
		const headerScroll = headerScrollRef.current;
		if (!scroll || !topScroll || !headerScroll) return;

		let syncing = false;
		const onScroll = () => {
			if (syncing) return;
			syncing = true;
			topScroll.scrollLeft = scroll.scrollLeft;
			headerScroll.scrollLeft = scroll.scrollLeft;
			syncing = false;
		};
		const onTopScroll = () => {
			if (syncing) return;
			syncing = true;
			scroll.scrollLeft = topScroll.scrollLeft;
			headerScroll.scrollLeft = topScroll.scrollLeft;
			syncing = false;
		};

		scroll.addEventListener("scroll", onScroll, { passive: true });
		topScroll.addEventListener("scroll", onTopScroll, { passive: true });
		return () => {
			scroll.removeEventListener("scroll", onScroll);
			topScroll.removeEventListener("scroll", onTopScroll);
		};
	}, []);

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

	const sortedUsers = useMemo(() => {
		if (!sort) return users;
		const sorted = [...users].sort(compareByKey[sort.key]);
		return sort.direction === "desc" ? sorted.reverse() : sorted;
	}, [users, sort]);

	return (
		<div>
			<div ref={topScrollRef} className={styles.topScrollbar} aria-hidden="true">
				<div style={{ width: TABLE_MIN_WIDTH, height: 1 }} />
			</div>
			<div ref={headerScrollRef} className={styles.headerScroll}>
				<table className={styles.table}>
					<ColumnWidths />
					<thead>
						<tr>
							<th aria-sort={ariaSortFor("name")}>
								<SortableHeader label="Names" sortKey="name" sort={sort} onSort={toggleSort} />
							</th>
							<th aria-sort={ariaSortFor("productions")}>
								<SortableHeader label="Productions" sortKey="productions" sort={sort} onSort={toggleSort} />
							</th>
							<th aria-sort={ariaSortFor("presentations")}>
								<SortableHeader label="Presentations" sortKey="presentations" sort={sort} onSort={toggleSort} />
							</th>
							<th>Grades</th>
						</tr>
					</thead>
				</table>
			</div>
			<div ref={scrollRef} className={styles.tableScroll}>
				<table className={styles.table}>
					<ColumnWidths />
					<tbody>
						{sortedUsers.map((user) => {
							const productions = user.productions || [];
							const hasPreMid = user.presentationsBeforeMid?.length > 0;
							const hasPostMid = user.presentationsAfterMid?.length > 0;
							const userGrades = gradesByUser[user.id] || {};
							const selectedGrades = (user.semesters || [])
								.map((semester) => ({ semester, grade: userGrades[semester.id] }))
								.filter((entry): entry is { semester: { id: string; name: string }; grade: NonNullable<GradeMap[string]> } => !!entry.grade);

							return (
								<tr key={user.id}>
									<td>
										<PersonLink userId={user.id} className={styles.nameLink}>{user.name}</PersonLink>
									</td>
									<td>
										{productions.length === 0 ? (
											<span className="ui-note block text-center">-</span>
										) : (
											<div className={styles.section}>
												<ItemList>
													{productions.map((production) => (
														<TableItem
															key={production.id}
															name={production.name}
															date={production.date}
															thursdayId={production.thursday_id}
															semesterName={isAllSemesters ? production.thursday?.semester?.name : undefined}
														/>
													))}
												</ItemList>
											</div>
										)}
									</td>
									<td>
										{!hasPreMid && !hasPostMid ? (
											<span className="ui-note block text-center">-</span>
										) : (
											<>
												{hasPreMid && (
													<div className={styles.section}>
														<span className={clsx("ui-label", styles.countLabel)}>
															<span className={styles.countText}>Pre-Mid</span>
														</span>
														<ItemList>
															{user.presentationsBeforeMid.map((presentation) => (
																<TableItem
																	key={presentation.id}
																	name={presentation.name}
																	date={presentation.date}
																	thursdayId={presentation.production?.thursday?.id}
																	semesterName={isAllSemesters ? presentation.production?.thursday?.semester?.name : undefined}
																/>
															))}
														</ItemList>
													</div>
												)}
												{hasPostMid && (
													<div className={styles.section}>
														<span className={clsx("ui-label", styles.countLabel)}>
															<span className={styles.countText}>Post-Mid</span>
														</span>
														<ItemList>
															{user.presentationsAfterMid.map((presentation) => (
																<TableItem
																	key={presentation.id}
																	name={presentation.name}
																	date={presentation.date}
																	thursdayId={presentation.production?.thursday?.id}
																	semesterName={isAllSemesters ? presentation.production?.thursday?.semester?.name : undefined}
																/>
															))}
														</ItemList>
													</div>
												)}
											</>
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
															<span className={styles.gradeSemester}>{semester.name}</span>
														</span>
													))}
												</div>
											) : activeMode !== ACTION_MODES.editGrades ? (
												<span className="ui-note block flex-1 text-center">-</span>
											) : null}
											<span className={styles.gradeEditOverlay} data-grade-action-overlay aria-hidden="true">
												<span className={styles.gradeEditIcon} />
											</span>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
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
