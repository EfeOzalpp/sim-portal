// React & Next.js
import { Suspense } from "react";

// Actions
import { getSemesterOptions } from "@/actions/semesters";
import { getUserRoleCounts } from "@/actions/users";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/filters/SemesterFilterSelect";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/primitives/PrintLink";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import ModalContentFallback from "@/components/modal/ModalContentFallback";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";
import { ActionModeSurface } from "@/components/layout/ActionMode";

// Composition
import UsersList from "@/app/users/composition/UsersList";
import RoleFilterPopover from "@/app/users/composition/RoleFilterPopover";
import GridViewPopover from "@/app/users/composition/GridViewPopover";
import ExitEditModeOnMount from "@/app/users/composition/ExitEditModeOnMount";
import EditUsersButton from "@/app/users/composition/EditUsersButton";
import DeleteUsersButton from "@/app/users/composition/DeleteUsersButton";

// Helpers
import { getSelectedSemesterId } from "@/components/domain/filters/semester-filter";
import { USER_MODAL_PARAMS, type UserModalParam } from "@/constants/modal-params";
import { ROLE_FILTER_KEY } from "@/constants/filters";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";

// Loaded with a conditional `await import()` inside the page body, not a static top-level import - these define inline "use server" actions, so next/dynamic (Client Components only) isn't usable here.

interface UsersProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const userModalParams = new Set<string>(Object.values(USER_MODAL_PARAMS));

// Fixed height (not min-h) so it's identical in the Suspense fallback and the loaded form - a floor alone can't cap the taller state.
const userFormDialogClassName = "w-[min(44rem,100%)] h-[calc(100dvh-3rem)] max-[768px]:h-dvh";

function getSingleParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function getUsersReturnHref(filters: { [key: string]: string | string[] | undefined }) {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(filters)) {
		if (userModalParams.has(key)) continue;

		if (Array.isArray(value)) {
			value.forEach((item) => {
				if (item) params.append(key, item);
			});
			continue;
		}

		if (value) {
			params.set(key, value);
		}
	}

	const query = params.toString();
	return query ? `/users?${query}` : "/users";
}

function getUsersModalHref(
	filters: { [key: string]: string | string[] | undefined },
	modalParam: UserModalParam,
	value: string,
) {
	const params = new URLSearchParams();

	for (const [key, filterValue] of Object.entries(filters)) {
		if (userModalParams.has(key)) continue;

		if (Array.isArray(filterValue)) {
			filterValue.forEach((item) => {
				if (item) params.append(key, item);
			});
			continue;
		}

		if (filterValue) {
			params.set(key, filterValue);
		}
	}

	params.set(modalParam, value);
	return `/users?${params.toString()}`;
}

export default async function UsersPage({ searchParams }: UsersProps) {
	const filters = await searchParams;
	// getSemesterOptions, auth, and the role counts are independent - run them in parallel, not one after another.
	const [semestersResult, session, roleCountsResult] = await Promise.all([
		getSemesterOptions(),
		auth(),
		getUserRoleCounts(filters),
	]);
	const semesters = semestersResult.success ? semestersResult.data : [];
	const roleCounts = roleCountsResult.success ? roleCountsResult.data : undefined;
	const isAdmin = isAdminRole(session?.user?.role);
	const selectedSemesterId = getSelectedSemesterId(filters, semesters);
	const roleFilter = getSingleParam(filters[ROLE_FILTER_KEY]);
	// roleCounts never reflects the role filter itself (by design, so the
	// popover can show every role's count at once) - the viewing count has to
	// pick the right slice of it back out here instead.
	const viewingCount = roleCounts ? (roleFilter ? roleCounts[roleFilter] : roleCounts.all) : undefined;
	const editUserId = getSingleParam(filters[USER_MODAL_PARAMS.edit]);
	const profileUserId = getSingleParam(filters[USER_MODAL_PARAMS.profile]);
	const deleteUserId = getSingleParam(filters[USER_MODAL_PARAMS.delete]);
	const addUser = getSingleParam(filters[USER_MODAL_PARAMS.add]);
	const usersReturnHref = getUsersReturnHref(filters);

	const showEditModal = !!editUserId;
	const showAddModal = !!addUser && !editUserId && !profileUserId && !deleteUserId;
	const showProfileModal = !!profileUserId && !editUserId;
	const showDeleteModal = !!deleteUserId && !editUserId && !profileUserId;

	const EditUserFormContent = showEditModal
		? (await import("@/app/users/[id]/edit/EditUserFormContent")).default
		: null;
	const AddUserFormContent = showAddModal
		? (await import("@/app/users/add/AddUserFormContent")).default
		: null;
	const PersonProfileModal = showProfileModal
		? (await import("@/components/domain/profile/PersonProfileModal")).default
		: null;
	const UserDeleteConfirmContent = showDeleteModal
		? (await import("@/app/users/composition/UserDeleteConfirmContent")).default
		: null;

	return (
		<>
			<PageTitle
				title="People"
				contentClassName="min-[769px]:ml-[calc(var(--nav-rail-collapsed-width)_+_12rem)]"
				filterControl={<SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} variant="title" />}
			/>
			<ActionModeSurface>
				<div data-full-bleed-content className="flex h-full min-h-0 flex-col bg-[var(--page-bg)] min-[769px]:ml-[var(--nav-rail-collapsed-width)] min-[769px]:mr-2 min-[769px]:rounded-tl-[0.5rem] min-[769px]:rounded-tr-[0.5rem] min-[769px]:border min-[769px]:border-b-0 min-[769px]:border-solid min-[769px]:border-[var(--main-border)] min-[769px]:shadow-[var(--content-shadow)] print:bg-transparent">
					<div className="flex flex-none flex-wrap items-center justify-between gap-6 overflow-hidden px-6 pt-6 pb-3 [scrollbar-gutter:stable] print:hidden">
						<div className="flex items-center gap-2">
							<div className="w-50 [--input-bg:var(--page-input-bg)] [--input-border:var(--page-input-border)] [--input-bg-hover:var(--page-input-bg-hover)] [--input-border-hover:var(--page-input-border-hover)] [--input-placeholder:var(--page-input-text)] [--input-icon:var(--page-input-search)]">
								<FilterInput query="user" placeholder="Search" mode="filter" filterTrigger={<RoleFilterPopover counts={roleCounts} />} />
							</div>
							<GridViewPopover />
						</div>
						<div className="flex items-center gap-2">
							{viewingCount !== undefined && (
								<span className="text-sm text-[var(--label-text)]">{viewingCount} users</span>
							)}
							<PrintLink variant="action" />
							{isAdmin && (
								<>
									<EditUsersButton />
									<DeleteUsersButton />
								</>
							)}
						</div>
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto px-6 [scrollbar-gutter:stable] print:overflow-visible print:px-0 print:pb-0">
						<Suspense fallback={<div style={{ opacity: 0.5, padding: "1rem", background: "transparent" }}>Loading users...</div>}>
							<UsersList
								filters={filters}
								isAdmin={isAdmin}
								addUserHref={getUsersModalHref(filters, USER_MODAL_PARAMS.add, "1")}
							/>
						</Suspense>
					</div>
				</div>
				{showEditModal && EditUserFormContent && (
					<RouteModalPopup key={editUserId} paramName={USER_MODAL_PARAMS.edit} title="Edit User" dialogClassName={userFormDialogClassName}>
						<ExitEditModeOnMount />
						<Suspense fallback={<ModalContentFallback />}>
							<EditUserFormContent userId={editUserId!} showDangerZone={false} />
						</Suspense>
					</RouteModalPopup>
				)}
				{showAddModal && AddUserFormContent && (
					<RouteModalPopup key="add-user" paramName={USER_MODAL_PARAMS.add} title="Add User" dialogClassName={userFormDialogClassName}>
						<Suspense fallback={<ModalContentFallback />}>
							<AddUserFormContent />
						</Suspense>
					</RouteModalPopup>
				)}
				{showProfileModal && PersonProfileModal && (
					<PersonProfileModal key={profileUserId} profileUserId={profileUserId!} />
				)}
				{showDeleteModal && UserDeleteConfirmContent && (
					<RouteModalPopup
						key={deleteUserId}
						paramName={USER_MODAL_PARAMS.delete}
						title="Delete User"
						dialogClassName={confirmDeleteDialogClassName}
					>
						<UserDeleteConfirmContent
							userId={deleteUserId!}
							returnHref={usersReturnHref}
						/>
					</RouteModalPopup>
				)}
			</ActionModeSurface>
		</>
	);
}


