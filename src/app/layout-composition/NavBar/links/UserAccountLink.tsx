"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Session } from "next-auth";
import { ACCOUNT_MODAL_PARAMS, USER_MODAL_PARAMS } from "@/constants/modal-params";

interface UserAccountLinkProps {
	user: Session["user"];
	iconOnly?: boolean;
}

function getDisplayName(user: Session["user"]) {
	return user.name || user.email || "User";
}

function getInitial(name: string) {
	return name.trim().charAt(0).toUpperCase();
}

function formatRole(role?: string) {
	if (!role) return "Member";

	return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function getAccountProfileHref(pathname: string, searchParams: URLSearchParams) {
	const params = new URLSearchParams(searchParams.toString());
	const modalParams = [
		ACCOUNT_MODAL_PARAMS.profile,
		ACCOUNT_MODAL_PARAMS.edit,
		USER_MODAL_PARAMS.add,
		USER_MODAL_PARAMS.edit,
		USER_MODAL_PARAMS.profile,
		USER_MODAL_PARAMS.delete,
	];

	modalParams.forEach((param) => params.delete(param));
	params.set(ACCOUNT_MODAL_PARAMS.profile, "1");

	const query = params.toString();
	return query ? `${pathname}?${query}` : pathname;
}

export default function UserAccountLink({ user, iconOnly = false }: UserAccountLinkProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const displayName = getDisplayName(user);
	const href = getAccountProfileHref(pathname, searchParams);
	const avatar = (
		<span
			className="ui-avatar grid h-[var(--nav-account-avatar-size)] w-[var(--nav-account-avatar-size)] place-items-center justify-self-center rounded-full bg-[var(--profile-indicator)] text-[var(--profile-indicator-text)]"
			aria-hidden="true"
		>
			{getInitial(displayName)}
		</span>
	);

	if (iconOnly) {
		return (
			<Link
				href={href}
				className="box-border grid h-10 w-10 flex-none place-items-center rounded-full no-underline hover:bg-[var(--page-button-bg-hover)]"
				aria-label={`Open profile for ${displayName}`}
			>
				<span
					className="ui-avatar grid h-8 w-8 place-items-center rounded-full bg-[var(--profile-indicator)] text-[var(--profile-indicator-text)]"
					aria-hidden="true"
				>
					{getInitial(displayName)}
				</span>
			</Link>
		);
	}

	return (
		<Link
			href={href}
			className="box-border grid w-full min-w-0 grid-cols-[var(--nav-rail-content-width)_minmax(0,1fr)] items-center gap-2 overflow-hidden rounded-xl py-2 text-inherit no-underline hover:bg-[var(--nav-hover-bg)]"
			aria-label={`Open profile for ${displayName}`}
		>
			{avatar}
			<span className="flex max-w-[12rem] min-w-0 flex-col overflow-hidden">
				<span className="is-body overflow-hidden text-ellipsis whitespace-nowrap text-[var(--app-text)]">{displayName}</span>
				<span className="is-body overflow-hidden text-ellipsis whitespace-nowrap text-[var(--label-text)]">{formatRole(user.role)}</span>
			</span>
		</Link>
	);
}
