"use client";

// React & Next.js
import { MouseEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Components
import { useActionMode } from "@/components/layout/ActionMode";
import { Button } from "@/components/button";
import { MaskIcon } from "@/theme/MaskIcon";

// Composition
import UserCard from "@/app/users/composition/UserCard";

// Helpers
import { ACTION_MODES } from "@/constants/action-modes";
import { USER_MODAL_PARAMS, type UserModalParam } from "@/constants/modal-params";
import { CARDS_PER_ROW_KEY, DEFAULT_CARDS_PER_ROW } from "@/constants/filters";
import type { User } from "@prisma/client";

interface UserCardGridProps {
	users: Pick<User, "id" | "name" | "image" | "role" | "pronouns">[];
	isAdmin?: boolean;
	addUserHref?: string;
	searchTerm?: string;
}

function AddUserCard({ href }: { href: string }) {
	return (
		<div className="flex flex-col gap-2 overflow-hidden rounded-xl! border-2 border-dashed border-[var(--card-border)] bg-[var(--elevated-surface)]! p-2 hover:border-[var(--card-border-hover)] print:hidden">
			{/* flex-1 */}
			<Link
				href={href}
				className="flex flex-1 flex-col pt-4 items-center justify-center gap-2 rounded-lg text-[var(--label-text)] no-underline hover:bg-[var(--elevated-surface-hover)]! hover:text-[var(--app-text)]"
			>
				<MaskIcon icon="add/add.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
				<span className="ui-label">New user</span>
			</Link>
			{/* deliberately not flex-1 */}
			<div className="flex flex-col justify-center border-t border-[var(--card-border)] pt-2">
				<Button fullWidth className="border-transparent! bg-transparent! hover:bg-[var(--elevated-surface-hover)]!">
					<MaskIcon icon="import/import.svg" className="h-4 w-4 flex-none bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
					Import
				</Button>
			</div>
		</div>
	);
}

const BATCH_SIZE = 30;

// grid-template-columns comes from GridViewPopover's own inline style below,
// not a class - print always wants its own fixed 6 regardless of that
// on-screen choice, and needs `!` here to actually beat an inline style.
const gridClassName = [
	"grid justify-center gap-4",
	"[&>*]:min-w-0 [&>*]:w-full [&>*]:rounded-lg [&>*]:bg-[var(--elevated-surface)]",
	"print:grid-cols-[repeat(6,minmax(0,1fr))]! print:justify-stretch print:gap-[0.1in] print:bg-white print:text-black",
	"print:[&>*]:break-inside-avoid print:[&>*]:border print:[&>*]:border-[#ccc]! print:[&>*]:bg-white! print:[&>*]:[page-break-inside:avoid]",
	"print:[&_a]:text-inherit print:[&_a]:no-underline",
].join(" ");

export default function UserCardGrid({ users, isAdmin = false, addUserHref, searchTerm }: UserCardGridProps) {
	const { activeMode } = useActionMode();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const cardsPerRow = Number(searchParams.get(CARDS_PER_ROW_KEY)) || DEFAULT_CARDS_PER_ROW;
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
			<div className={gridClassName} style={{ gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))` }}>
				{isAdmin && addUserHref && <AddUserCard href={addUserHref} />}
				{isAdmin && users.length < 1 && (
					<div className="flex items-center justify-center p-4 text-center text-[var(--label-text)] print:hidden">
						There are no results for User {searchTerm}
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
