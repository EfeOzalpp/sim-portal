"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { User } from "@prisma/client";
import { useActionMode } from "@/components/layout/ActionMode";
import UserCard from "@/app/users/composition/UserCard";

interface UserCardGridProps {
	users: Pick<User, "id" | "name" | "image" | "role">[];
}

// How many cards to mount at once. Keeps DOM node count (and the number of
// <Image>s that can trigger Next's image optimizer at once) bounded
// regardless of how large the roster grows, instead of mounting every card
// up front.
const BATCH_SIZE = 24;

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

	function openUserModal(userId: string, modalParam: "editUserId" | "profileUserId" | "deleteUserId") {
		const params = new URLSearchParams(searchParams.toString());
		params.delete("editUserId");
		params.delete("profileUserId");
		params.delete("deleteUserId");
		params.set(modalParam, userId);
		router.push(`${pathname}?${params.toString()}`, { scroll: false });
	}

	const visibleUsers = users.slice(0, visibleCount);

	return (
		<>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] justify-center gap-[var(--spacing-sm)] bg-[var(--app-surface)] px-[var(--spacing-sm)] pb-[var(--spacing-lg)] [&>*]:min-w-0 [&>*]:w-full [&>*]:rounded-[var(--border-md)] [&>*]:border-solid [&>*]:border-[var(--app-border)] [&>*]:bg-[var(--app-card-bg)] [&>*]:[border-width:var(--app-border-width)] print:grid-cols-[repeat(10,minmax(0,1fr))] print:justify-stretch print:gap-[0.06in] print:bg-white print:p-0 print:text-black print:[&>*]:break-inside-avoid print:[&>*]:border-[#ccc]! print:[&>*]:bg-white! print:[&>*]:[page-break-inside:avoid] print:[&_a]:text-inherit print:[&_a]:no-underline">
				{visibleUsers.map((user) => (
					<UserCard
						key={user.id}
						user={user}
						onClick={(event: MouseEvent<HTMLAnchorElement>) => {
							if (activeMode === "edit-users") {
								event.preventDefault();
								openUserModal(user.id, "editUserId");
								return;
							}

							if (activeMode === "delete-users") {
								event.preventDefault();
								openUserModal(user.id, "deleteUserId");
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
								openUserModal(user.id, "profileUserId");
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
