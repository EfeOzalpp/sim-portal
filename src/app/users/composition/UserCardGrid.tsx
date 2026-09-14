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
	users: Pick<User, "id" | "name" | "image" | "role" | "pronouns">[];
}

const BATCH_SIZE = 30;

// Grid: auto-filling columns, centered when they don't fill a row. [&>*]:rounded-lg/border below target Block's own wrapper <div>, not UserCard's <a> - it always renders one. print: forces a fixed 10-column printable roster.
const gridClassName = [
	// No bg here - the page's own wrapper div (users/page.tsx) covers the content area regardless of how sparse this grid is.
	"grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] justify-center gap-4",
	"[&>*]:min-w-0 [&>*]:w-full [&>*]:rounded-lg [&>*]:bg-[var(--elevated-surface)]",
	"print:grid-cols-[repeat(10,minmax(0,1fr))] print:justify-stretch print:gap-[0.06in] print:bg-white print:text-black",
	"print:[&>*]:break-inside-avoid print:[&>*]:border print:[&>*]:border-[#ccc]! print:[&>*]:bg-white! print:[&>*]:[page-break-inside:avoid]",
	"print:[&_a]:text-inherit print:[&_a]:no-underline",
].join(" ");

export default function UserCardGrid({ users }: UserCardGridProps) {
	const { activeMode } = useActionMode();
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

	// Printing must include every user, not just whichever batch happened to be mounted.
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
			<div className={gridClassName}>
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
					/>
				))}
			</div>
			{visibleCount < users.length && (
				<div ref={sentinelRef} aria-hidden="true" className="h-px w-full print:hidden" />
			)}
		</>
	);
}
