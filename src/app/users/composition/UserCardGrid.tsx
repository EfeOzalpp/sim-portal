"use client";

// React & Next.js
import { MouseEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Components
import { useOptionalActionMode } from "@/components/layout/ActionMode";

// Composition
import UserCard from "@/app/users/composition/UserCard";

// Helpers
import { ACTION_MODES } from "@/constants/action-modes";
import { USER_MODAL_PARAMS, type UserModalParam } from "@/constants/modal-params";
import { PEOPLE_GRID_PREFERENCES } from "@/constants/people-grid";
import styles from "@/app/users/composition/UserCardGrid.module.css";
import type { User } from "@prisma/client";

interface UserCardGridProps {
	users: Pick<User, "id" | "name" | "image" | "role" | "pronouns">[];
	isAdmin?: boolean;
	searchTerm?: string;
}


const BATCH_SIZE = 30;

const gridClassName = [
	"grid justify-center gap-x-5 gap-y-7",
	"[&>*]:min-w-0 [&>*]:w-full",
	"print:grid-cols-[repeat(6,minmax(0,1fr))]! print:justify-stretch print:gap-[0.1in] print:bg-white print:text-black",
	"print:[&>*]:break-inside-avoid print:[&>*]:border print:[&>*]:border-[#ccc]! print:[&>*]:bg-white! print:[&>*]:[page-break-inside:avoid]",
	"print:[&_a]:text-inherit print:[&_a]:no-underline",
].join(" ");

export default function UserCardGrid({ users, isAdmin = false, searchTerm }: UserCardGridProps) {
	const { activeMode } = useOptionalActionMode();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
	const sentinelRef = useRef<HTMLDivElement>(null);

	// Reset to the first batch whenever the underlying list changes, so switching filters doesn't start with a stale count.
	useEffect(() => {
		setVisibleCount(BATCH_SIZE);
	}, [users]);

	// Reveal the next batch once the sentinel gets within ~800px of the viewport.
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					setVisibleCount((count) => Math.min(count + BATCH_SIZE, users.length));
				}
			},
			{ rootMargin: "800px 0px" },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [users.length]);

	function openUserModal(userId: string, modalParam: UserModalParam) {
		const params = new URLSearchParams(searchParams.toString());
		params.delete(USER_MODAL_PARAMS.edit);
		params.delete(USER_MODAL_PARAMS.profile);
		params.delete(USER_MODAL_PARAMS.delete);
		params.set(modalParam, userId);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}

	const visibleUsers = users.slice(0, visibleCount);

	return (
		<>
			<div className={`${styles.root} ${gridClassName}`} style={{
				"--people-grid-default-desktop": PEOPLE_GRID_PREFERENCES.desktop.defaultValue,
				"--people-grid-default-mobile": PEOPLE_GRID_PREFERENCES.mobile.defaultValue,
			} as CSSProperties}>
				{isAdmin && users.length < 1 && (
					<div className="col-span-full flex items-center justify-center p-4 text-center text-[var(--label-text)] print:hidden">
						{searchTerm ? `No people match “${searchTerm}”` : "No people to show"}
					</div>
				)}
				{visibleUsers.map((user) => (
					<UserCard
						key={user.id}
						user={user}
						onClick={(event: MouseEvent<HTMLAnchorElement>) => {
							if (activeMode === ACTION_MODES.editUsers) {
								event.preventDefault();
								openUserModal(user.id, USER_MODAL_PARAMS.edit);
								// Exiting edit mode itself happens once the modal's real content
								// actually mounts (ExitEditModeOnMount, inside its Suspense
								// boundary in page.tsx) - not here, so it doesn't turn off before
								// the modal is visible.
								return;
							}

							if (activeMode === ACTION_MODES.deleteUsers) {
								event.preventDefault();
								openUserModal(user.id, USER_MODAL_PARAMS.delete);
								return;
							}

							if (
								event.button === 0 &&
								!event.metaKey &&
								!event.ctrlKey &&
								!event.shiftKey &&
								!event.altKey
							) {
								event.preventDefault();
								openUserModal(user.id, USER_MODAL_PARAMS.profile);
							}
						}}
						onEdit={isAdmin && !activeMode ? () => openUserModal(user.id, USER_MODAL_PARAMS.edit) : undefined}
						onDelete={isAdmin && !activeMode ? () => openUserModal(user.id, USER_MODAL_PARAMS.delete) : undefined}
					/>
				))}
			</div>
			{visibleCount < users.length && (
				<div ref={sentinelRef} aria-hidden="true" className="h-px w-full print:hidden" />
			)}
		</>
	);
}
