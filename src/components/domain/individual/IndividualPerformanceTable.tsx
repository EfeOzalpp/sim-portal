"use client";

import type { ReactNode } from "react";
import { useRef, useEffect, useMemo, useState } from "react";
import PersonLink from "@/components/domain/users/PersonLink";
import ThursdayLink from "@/components/domain/thursdays/ThursdayLink";
import { Table } from "@/components/primitives/AntD";
import { Prisma } from "@prisma/client";
import GradeEditorModal, { GradeMap } from "@/components/domain/individual/GradeEditorModal";
import { useActionMode } from "@/components/layout/ActionMode";
import { updateUserSemesterGrades } from "@/actions/semesters";
import styles from "@/components/domain/individual/IndividualPerformanceTable.module.css";

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

export default function IndividualPerformanceTable({ users = [] }: IndividualPerformanceTableProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const topScrollRef = useRef<HTMLDivElement>(null);
	const { activeMode } = useActionMode();
	const [selectedGradeUser, setSelectedGradeUser] = useState<UserStat | null>(null);
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

	useEffect(() => {
		const wrapper = wrapperRef.current;
		const topScroll = topScrollRef.current;
		if (!wrapper || !topScroll) return;

		const tableContent = wrapper.querySelector<HTMLElement>(".ant-table-body") ?? wrapper.querySelector<HTMLElement>(".ant-table-content");
		if (!tableContent) return;

		let syncing = false;
		const onTable = () => {
			if (syncing) return;
			syncing = true;
			topScroll.scrollLeft = tableContent.scrollLeft;
			syncing = false;
		};
		const onTop = () => {
			if (syncing) return;
			syncing = true;
			tableContent.scrollLeft = topScroll.scrollLeft;
			syncing = false;
		};

		tableContent.addEventListener("scroll", onTable, { passive: true });
		topScroll.addEventListener("scroll", onTop, { passive: true });
		return () => {
			tableContent.removeEventListener("scroll", onTable);
			topScroll.removeEventListener("scroll", onTop);
		};
	}, []);

	const columns = [
		{
			title: "Names",
			dataIndex: "name",
			key: "name",
			width: "16%",
			render: (text: string, user: UserStat) => (
				<PersonLink userId={user.id} className={styles.nameLink}>{text}</PersonLink>
			),
		},
		{
			title: "Productions",
			key: "productions",
			width: "31%",
			render: (_: any, user: UserStat) => {
				const productions = user.productions || [];
				if (productions.length === 0) {
					return <span className={styles.emptyLabel}>No current productions</span>;
				}

				return (
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
				);
			},
		},
		{
			title: "Presentations",
			key: "presentations",
			width: "31%",
			render: (_: any, user: UserStat) => {
				const hasPreMid = user.presentationsBeforeMid?.length > 0;
				const hasPostMid = user.presentationsAfterMid?.length > 0;

				if (!hasPreMid && !hasPostMid) {
					return <span className={styles.emptyLabel}>No current presentations</span>;
				}

				return (
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
				);
			},
		},
		{
			title: "Grades",
			key: "grades",
			width: "22%",
			onCell: (user: UserStat) => ({
				"data-action-mode-target": "grade-cell",
				onClick: () => {
					if (activeMode === "edit-grades") {
						setSelectedGradeUser(user);
					}
				},
			}),
			render: (_: any, user: UserStat) => {
				const userGrades = gradesByUser[user.id] || {};
				const selectedGrades = (user.semesters || [])
					.map((semester) => ({ semester, grade: userGrades[semester.id] }))
					.filter((entry): entry is { semester: { id: string; name: string }; grade: NonNullable<GradeMap[string]> } => !!entry.grade);

				return (
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
				);
			},
		},
	];

	return (
		<div ref={wrapperRef}>
			<div ref={topScrollRef} className={styles.topScrollbar} aria-hidden="true">
				<div style={{ width: TABLE_MIN_WIDTH, height: 1 }} />
			</div>
			<Table
				className={styles.table}
				dataSource={users}
				columns={columns}
				rowKey="id"
				scroll={{ x: TABLE_MIN_WIDTH }}
				sticky
			/>
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
