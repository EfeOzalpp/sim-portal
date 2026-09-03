"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname, useSearchParams } from "next/navigation";
import type { Session } from "next-auth";
import styles from "@/app/layout-composition/NavBar/UserAccountLink.module.css";

interface UserAccountLinkProps {
	user: Session["user"];
}

function getDisplayName(user: Session["user"]) {
	return user.name || user.email || "User";
}

function getInitials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);

	if (parts.length >= 2) {
		return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
	}

	return name.slice(0, 2).toUpperCase();
}

function formatRole(role?: string) {
	if (!role) return "Member";

	return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function getAccountProfileHref(pathname: string, searchParams: URLSearchParams) {
	const params = new URLSearchParams(searchParams.toString());
	const modalParams = [
		"accountProfile",
		"accountEdit",
		"addUser",
		"editUserId",
		"profileUserId",
		"deleteUserId",
	];

	modalParams.forEach((param) => params.delete(param));
	params.set("accountProfile", "1");

	const query = params.toString();
	return query ? `${pathname}?${query}` : pathname;
}

export default function UserAccountLink({ user }: UserAccountLinkProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const displayName = getDisplayName(user);
	const href = getAccountProfileHref(pathname, searchParams);

	return (
		<Link
			href={href}
			className="box-border grid w-full min-w-0 grid-cols-[var(--nav-rail-content-width)_minmax(0,1fr)] items-center gap-2 overflow-hidden rounded-xl py-2 text-inherit no-underline hover:bg-[var(--app-subtle)]"
			aria-label={`Open profile for ${displayName}`}
		>
			<span
				className="is-body grid h-[var(--nav-account-avatar-size)] w-[var(--nav-account-avatar-size)] place-items-center justify-self-center rounded-full bg-[var(--app-theme)] leading-none text-white"
				aria-hidden="true"
			>
				{getInitials(displayName)}
			</span>
			<span className={clsx(styles.identity, "flex max-w-[12rem] min-w-0 flex-col overflow-hidden opacity-100")}>
				<span className="is-body overflow-hidden text-ellipsis whitespace-nowrap text-[var(--app-text)]">{displayName}</span>
				<span className="is-body overflow-hidden text-ellipsis whitespace-nowrap text-[var(--app-muted)]">{formatRole(user.role)}</span>
			</span>
		</Link>
	);
}
