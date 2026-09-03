"use client";

import Link from "next/link";
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
			className={styles.root}
			aria-label={`Open profile for ${displayName}`}
		>
			<span className={`${styles.avatar} is-body`} aria-hidden="true">
				{getInitials(displayName)}
			</span>
			<span className={styles.identity}>
				<span className={`${styles.name} is-body`}>{displayName}</span>
				<span className={`${styles.status} is-body`}>{formatRole(user.role)}</span>
			</span>
		</Link>
	);
}
