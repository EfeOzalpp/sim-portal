// React & Next.js
import { Suspense } from "react";

// Actions
import { getSemesterOptions } from "@/actions/semesters";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/filters/SemesterFilterSelect";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/primitives/PrintLink";
import { Button } from "@/components/button";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import ModalContentFallback from "@/components/modal/ModalContentFallback";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode"; 

// Composition
import UsersList from "@/app/users/composition/UsersList";
import RoleFilterPopover from "@/app/users/composition/RoleFilterPopover";
import ExitEditModeOnMount from "@/app/users/composition/ExitEditModeOnMount";

// Helpers
import { ALL_SEMESTERS_VALUE, formatSemesterCode, getSelectedSemester, getSelectedSemesterId, isAllSemestersValue } from "@/components/domain/filters/semester-filter";
import { ACTION_MODES } from "@/constants/action-modes";
import { USER_MODAL_PARAMS, type UserModalParam } from "@/constants/modal-params";
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
	// getSemesterOptions and auth are independent - run them in parallel, not one after another.
	const [semestersResult, session] = await Promise.all([getSemesterOptions(), auth()]);
	const semesters = semestersResult.success ? semestersResult.data : [];
	const isAdmin = isAdminRole(session?.user?.role);
	const selectedSemesterId = getSelectedSemesterId(filters, semesters);
	const selectedSemester = getSelectedSemester(filters, semesters);
	const currentFilterLabel = isAllSemestersValue(selectedSemesterId)
		? ALL_SEMESTERS_VALUE
		: formatSemesterCode(selectedSemester?.name || selectedSemesterId);
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
				filterControl={<SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} variant="title" />}
			/>
			<ActionModeSurface>
				<NavContent
					filterContent={
						<div className="flex items-center gap-2">
							<RoleFilterPopover />
							<div className="min-w-0 flex-1 [&_.input-affix-wrapper]:bg-[var(--action-input-bg)]!">
								<FilterInput query={"user"} placeholder="Search" />
							</div>
						</div>
					}
					filterLabel="Filter"
					manageContent={
						isAdmin ? (
							<>
								<Button href={getUsersModalHref(filters, USER_MODAL_PARAMS.add, "1")} variant="action" tone="success" icon="add/add.svg">
									Add User
								</Button>
								<ActionModeButton type="button" variant="action" mode={ACTION_MODES.editUsers} >
									Edit Users
								</ActionModeButton>
								<ActionModeButton type="button" variant="action" mode={ACTION_MODES.deleteUsers} >
									Delete Users
								</ActionModeButton>
							</>
						) : null
					}
					manageLabel="Manage"
					mobileManageContent={
						isAdmin ? (
							<>
								<Button href={getUsersModalHref(filters, USER_MODAL_PARAMS.add, "1")} variant="action" tone="success" icon="add/add.svg">
									Add
								</Button>
								<ActionModeButton type="button" variant="action" mode={ACTION_MODES.editUsers} >
									Edit
								</ActionModeButton>
								<ActionModeButton type="button" variant="action" mode={ACTION_MODES.deleteUsers} >
									Del
								</ActionModeButton>
							</>
						) : null
					}
					// has label but is already defaulted to export in upstream
					printContent={<PrintLink />}
				/>
				{/* bg lives here, not on UserCardGrid's grid element - a grid's own background only covers its actual tracks, leaving a sparse grid partly transparent. */}
				<div className="bg-[image:var(--app-user-surface)] pr-6 pl-9 pt-9! pb-9 min-[769px]:rounded-tr-[0.5rem] print:px-0 print:pt-0 print:pb-0 print:bg-transparent">
					{/* PageTitle is print:hidden, so this is the only place the current filter reaches the printed page. */}
					<div className="mb-[0.15in] hidden font-sans text-[9pt] font-bold tracking-[0.06em] text-black uppercase print:block">
						{currentFilterLabel}
					</div>
					<Suspense fallback={<div style={{ opacity: 0.5, padding: "1rem", background: "transparent" }}>Loading users...</div>}>
						<UsersList filters={filters} />
					</Suspense>
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


