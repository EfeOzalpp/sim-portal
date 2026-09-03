"use client";

import type { ReactNode } from "react";
import { useRef, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import PersonLink from "@/components/domain/users/PersonLink";
import ThursdayLink from "@/app/individual/composition/ThursdayLink";
import { Prisma } from "@prisma/client";
import GradeEditorModal, { GradeMap } from "@/app/individual/composition/GradeEditorModal";
import { useActionMode } from "@/components/layout/ActionMode";
import { updateUserSemesterGrades } from "@/actions/semesters";
import styles from "@/app/individual/composition/IndividualPerformanceTable.module.css";

type ProductionWithThursday = Prisma.ProductionGetPayload<{ include: { thursday: { select: { id: true, date: true } } } }>;
type PresentationWithProduction = Prisma.PresentationGetPayload<{ include: { production: { include: { thursday: { select: { id: true, date: true } } } } } }>;

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
}

const dateFormat: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };

function TableItem({ name, date, thursdayId }: { name: string; date?: Date; thursdayId?: string }) {
	const content = (
		<>
			<span className={styles.itemName}>{name}</span>
			<span className={styles.itemDate}>
				{date ? new Date(date).toLocaleDateString("en-US", dateFormat) : "No date"}
			</span>
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

export default function IndividualPerformanceTable({ users = [] }: IndividualPerformanceTableProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const topScrollRef = useRef<HTMLDivElement>(null);
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

	// Mirrors a fake scrollbar above the table (visible even when the real
	// one, at the table's bottom edge, is scrolled far out of view) with the
	// table's own actual horizontal scroll position.
	useEffect(() => {
		const scroll = scrollRef.current;
		const topScroll = topScrollRef.current;
		if (!scroll || !topScroll) return;

		let syncing = false;
		const onScroll = () => {
			if (syncing) return;
			syncing = true;
			topScroll.scrollLeft = scroll.scrollLeft;
			syncing = false;
		};
		const onTopScroll = () => {
			if (syncing) return;
			syncing = true;
			scroll.scrollLeft = topScroll.scrollLeft;
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
			<div ref={scrollRef} className={styles.tableScroll}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th style={{ width: "16%" }} aria-sort={ariaSortFor("name")}>
								<SortableHeader label="Names" sortKey="name" sort={sort} onSort={toggleSort} />
							</th>
							<th style={{ width: "31%" }} aria-sort={ariaSortFor("productions")}>
								<SortableHeader label="Productions" sortKey="productions" sort={sort} onSort={toggleSort} />
							</th>
							<th style={{ width: "31%" }} aria-sort={ariaSortFor("presentations")}>
								<SortableHeader label="Presentations" sortKey="presentations" sort={sort} onSort={toggleSort} />
							</th>
							<th style={{ width: "22%" }}>Grades</th>
						</tr>
					</thead>
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
											<span className={styles.emptyLabel}>No current productions</span>
										) : (
											<div className={styles.section}>
												<span className={styles.countLabel}>
													<span className={styles.countValue}>{productions.length}</span>
												</span>
												<ItemList>
													{productions.map((production) => (
														<TableItem
															key={production.id}
															name={production.name}
															date={production.date}
															thursdayId={production.thursday_id}
														/>
													))}
												</ItemList>
											</div>
										)}
									</td>
									<td>
										{!hasPreMid && !hasPostMid ? (
											<span className={styles.emptyLabel}>No current presentations</span>
										) : (
											<>
												{hasPreMid && (
													<div className={styles.section}>
														<span className={styles.countLabel}>
															<span className={styles.countValue}>{user.presentationsBeforeMid.length}</span>
															<span className={styles.countText}>Pre-Mid</span>
														</span>
														<ItemList>
															{user.presentationsBeforeMid.map((presentation) => (
																<TableItem
																	key={presentation.id}
																	name={presentation.name}
																	date={presentation.date}
																	thursdayId={presentation.production?.thursday?.id}
																/>
															))}
														</ItemList>
													</div>
												)}
												{hasPostMid && (
													<div className={styles.section}>
														<span className={styles.countLabel}>
															<span className={styles.countValue}>{user.presentationsAfterMid.length}</span>
															<span className={styles.countText}>Post-Mid</span>
														</span>
														<ItemList>
															{user.presentationsAfterMid.map((presentation) => (
																<TableItem
																	key={presentation.id}
																	name={presentation.name}
																	date={presentation.date}
																	thursdayId={presentation.production?.thursday?.id}
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
											if (activeMode === "edit-grades") {
												setSelectedGradeUser(user);
											}
										}}
									>
										<div className={styles.gradeCell}>
											{selectedGrades.length > 0 ? (
												<div className={styles.gradeList}>
													{selectedGrades.map(({ semester, grade }) => (
														<span key={semester.id} className={styles.gradeValue}>
															<span>{semester.name}</span>
															<strong>{grade}</strong>
														</span>
													))}
												</div>
											) : (
												<span className={styles.emptyLabel}>No grades yet</span>
											)}
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
