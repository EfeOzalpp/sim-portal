// React & Next.js
import { Suspense } from "react";

// Actions
import { getSemesterOptions } from "@/actions/semesters";
import { getUserRoleCounts } from "@/actions/users";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/filters/SemesterFilterSelect";
import PageChrome from "@/components/layout/PageChrome/PageChrome";
import PageBar from "@/components/layout/PageBar";
import PageCard from "@/components/layout/PageCard";
import PageChromeScrollArea from "@/components/layout/PageChrome/PageChromeScrollArea";
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import { MaskIcon } from "@/theme/MaskIcon";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import ModalContentFallback from "@/components/modal/ModalContentFallback";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";
import { ActionModePageContent, ActionModeProvider } from "@/components/layout/ActionMode";

// Composition
import UsersList from "@/app/users/composition/grid";
import RoleFilterPopover from "@/app/users/composition/RoleFilterPopover";
import GridViewPopover from "@/app/users/composition/grid/GridViewPopover";
import ExitEditModeOnMount from "@/app/users/composition/selection/ExitEditModeOnMount";
import EditUsersButton from "@/app/users/composition/selection/EditUsersButton";
import DeleteUsersButton from "@/app/users/composition/selection/DeleteUsersButton";
import styles from "@/app/users/UsersPage.module.css";

// Helpers
import { getSelectedSemesterId } from "@/components/domain/filters/semester-filter";
import { USER_MODAL_PARAMS, type UserModalParam } from "@/constants/modal-params";
import { ROLE_FILTER_KEY } from "@/constants/filters";
import { isAdminRole, ROLES } from "@/constants/roles";
import { auth } from "@/authentication";

// Loaded with a conditional `await import()` inside the page body, not a static top-level import - these define inline "use server" actions, so next/dynamic (Client Components only) isn't usable here.

interface UsersProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const userModalParams = new Set<string>(Object.values(USER_MODAL_PARAMS));

// Fixed height (not min-h) so it's identical in the Suspense fallback and the loaded form - a floor alone can't cap the taller state.
const userFormDialogClassName = "w-[min(42rem,100%)] max-[768px]:h-dvh";

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
	const viewingLabel = roleFilter === ROLES.student ? (viewingCount === 1 ? "student" : "students")
		: roleFilter === ROLES.staff ? "staff"
		: roleFilter === ROLES.admin ? (viewingCount === 1 ? "admin" : "admins")
		: (viewingCount === 1 ? "person" : "names & faces");
	const editUserId = getSingleParam(filters[USER_MODAL_PARAMS.edit]);
	const profileUserId = getSingleParam(filters[USER_MODAL_PARAMS.profile]);
	const deleteUserId = getSingleParam(filters[USER_MODAL_PARAMS.delete]);
	const addUser = getSingleParam(filters[USER_MODAL_PARAMS.add]);
	const usersReturnHref = getUsersReturnHref(filters);

	const showEditModal = !!editUserId;
	const showAddModal = !!addUser && !editUserId && !profileUserId && !deleteUserId;
	const showProfileModal = !!profileUserId && !editUserId;
	const showDeleteModal = !!deleteUserId && !editUserId && !profileUserId;
	const titleFilterControl = <SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} variant="title" />;

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
		? (await import("@/app/users/composition/forms/UserDeleteConfirmContent")).default
		: null;

	return (
		<>
			<div data-page-frame className="h-full min-h-0">
				<ActionModeProvider>
					<PageChrome
						title="People"
						scope={titleFilterControl}
						search={<FilterInput variant="page" query="user" placeholder="Search" />}
						trailingActions={isAdmin ? (
							<>
								<Button surface="page" href={getUsersModalHref(filters, USER_MODAL_PARAMS.add, "1")} variant="action" tone="cta" aria-label="New user" title="New user">
									<MaskIcon icon="add/add.svg" className={actionButtonIconClassName} />
									New user
								</Button>
								<EditUsersButton />
								<DeleteUsersButton />
							</>
						) : undefined}
						tools={<RoleFilterPopover counts={roleCounts} />}
						viewControls={<GridViewPopover />}
						status={viewingCount !== undefined ? (
							<span className="whitespace-nowrap">{viewingCount} {viewingLabel}</span>
						) : undefined}
						printLabel="Export PDF"
						csvLabel="Export CSV"
						utilities={isAdmin ? [{ label: "Import CSV", icon: "import/import.svg" }] : undefined}
					/>
					<ActionModePageContent>
						<PageCard data-full-bleed-content className="flex h-full min-h-0 flex-col">
							<PageBar />
							<PageChromeScrollArea requireTopGesture data-page-surface className={`${styles.scrollArea} min-h-0 flex-1 overflow-y-auto bg-[var(--page-bg)] p-6 print:overflow-visible print:bg-transparent print:px-0 print:pb-0`}>
								<Suspense fallback={<div style={{ opacity: 0.5, padding: "1rem", background: "transparent" }}>Loading users...</div>}>
									<UsersList
										filters={filters}
										isAdmin={isAdmin}
									/>
								</Suspense>
							</PageChromeScrollArea>
						</PageCard>
					</ActionModePageContent>
					{showEditModal && EditUserFormContent && (
						<RouteModalPopup key={editUserId} paramName={USER_MODAL_PARAMS.edit} title="Edit User" dialogClassName={userFormDialogClassName}>
							<ExitEditModeOnMount />
							<Suspense fallback={<ModalContentFallback />}>
								<EditUserFormContent userId={editUserId!} showDangerZone={false} />
							</Suspense>
						</RouteModalPopup>
					)}
					{showAddModal && AddUserFormContent && (
						<RouteModalPopup key="add-user" paramName={USER_MODAL_PARAMS.add} title="New User" dialogClassName={userFormDialogClassName}>
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
							minimalHeader
						>
							<UserDeleteConfirmContent
								userId={deleteUserId!}
								returnHref={usersReturnHref}
							/>
						</RouteModalPopup>
					)}
				</ActionModeProvider>
			</div>
		</>
	);
}
