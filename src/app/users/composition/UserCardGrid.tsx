"use client";

// React & Next.js
import { MouseEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Components
import { useActionMode } from "@/components/layout/ActionMode";

// Composition
import UserCard from "@/app/users/composition/UserCard";

// Helpers
import { ACTION_MODES } from "@/constants/action-modes";
import { USER_MODAL_PARAMS, type UserModalParam } from "@/constants/modal-params";
import type { User } from "@prisma/client";

interface UserCardGridProps {
	users: Pick<User, "id" | "name" | "image" | "role">[];
}

const BATCH_SIZE = 30;

export default function UserCardGrid({ users }: UserCardGridProps) {
	const { activeMode } = useActionMode();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
	const sentinelRef = useRef<HTMLDivElement>(null);

	// Reset back to the first batch whenever the underlying list changes
	// (e.g. a different semester/search filter selected), so switching
	// filters doesn't start out showing a stale count from the last list.
	useEffect(() => {
		setVisibleCount(BATCH_SIZE);
	}, [users]);

	// Reveal the next batch once the sentinel gets within ~800px of the
	// viewport, well ahead of it actually being visible.
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

	// This grid has dedicated print: styling (a 10-column printable roster),
	// so printing must include every user, not just whichever batch happened
	// to be mounted at the time.
	useEffect(() => {
		function handleBeforePrint() {
			setVisibleCount(users.length);
		}

		window.addEventListener("beforeprint", handleBeforePrint);
		return () => window.removeEventListener("beforeprint", handleBeforePrint);
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
			<div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] justify-center gap-2 bg-[var(--app-surface)] [&>*]:min-w-0 [&>*]:w-full [&>*]:rounded-xl [&>*]:border-solid [&>*]:border-[var(--app-border)] [&>*]:bg-[var(--app-secondary)] [&>*]:border print:grid-cols-[repeat(10,minmax(0,1fr))] print:justify-stretch print:gap-[0.06in] print:bg-white print:text-black print:[&>*]:break-inside-avoid print:[&>*]:border-[#ccc]! print:[&>*]:bg-white! print:[&>*]:[page-break-inside:avoid] print:[&_a]:text-inherit print:[&_a]:no-underline">
				{visibleUsers.map((user) => (
					<UserCard
						key={user.id}
						user={user}
						onClick={(event: MouseEvent<HTMLAnchorElement>) => {
							if (activeMode === ACTION_MODES.editUsers) {
								event.preventDefault();
								openUserModal(user.id, USER_MODAL_PARAMS.edit);
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
					/>
				))}
			</div>
			{visibleCount < users.length && (
				<div ref={sentinelRef} aria-hidden="true" className="h-px w-full print:hidden" />
			)}
		</>
	);
}
