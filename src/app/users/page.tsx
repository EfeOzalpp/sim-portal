// React & Next.js
import { Suspense } from "react";

// Actions
import { getAllSemesters } from "@/actions/semesters";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/filters/SemesterFilterSelect";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/primitives/PrintLink";
import { Button } from "@/components/button";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";

// Composition
import UsersList from "@/app/users/composition/UsersList";

// Helpers
import { ALL_SEMESTERS_VALUE, formatSemesterCode, getSelectedSemester, getSelectedSemesterId, isAllSemestersValue } from "@/components/domain/filters/semester-filter";
import { ACTION_MODES } from "@/constants/action-modes";
import { USER_MODAL_PARAMS, type UserModalParam } from "@/constants/modal-params";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";

// These modals are loaded with a conditional `await import()` inside the page
// body below, instead of a static top-level import. Each one drags in
// react-hook-form + zod + antd Upload/Form, and they define inline
// "use server" actions, so they must stay plain Server Components — next/dynamic
// (built on React.lazy, meant for Client Components) is not usable here. A
// conditional import() still gets its own chunk, only evaluated when the
// matching URL param is actually present, so a plain /users visit doesn't
// compile all four just to render the grid.

interface UsersProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const userModalParams = new Set<string>(Object.values(USER_MODAL_PARAMS));

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
	const semestersResult = await getAllSemesters();
	const semesters = semestersResult.success ? semestersResult.data : [];
	const session = await auth();
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
			<PageTitle title="People" filter={currentFilterLabel} />
			<ActionModeSurface>
				<NavContent
					filterContent={
						<>
							<div className="flex flex-col gap-2">
								<span className="ui-label hidden min-[769px]:block">Filter</span>
								<SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} />
							</div>
							<div className="flex flex-col gap-2">
								<span className="ui-label hidden min-[769px]:block">Search</span>
								<FilterInput query={"user"} placeholder="Search user" />
							</div>
						</>
					}
					filterLabel=""
					manageContent={
						isAdmin ? (
							<>
								<Button href={getUsersModalHref(filters, USER_MODAL_PARAMS.add, "1")} variant="action">
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
					manageLabel="Manage People"
					mobileManageContent={
						isAdmin ? (
							<>
								<Button href={getUsersModalHref(filters, USER_MODAL_PARAMS.add, "1")} variant="action">
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
				<div className="px-2 pb-2 print:p-0">
					{/* PageTitle (which normally shows this same label) is print:hidden,
					    so this is the only place the current filter reaches the printed page. */}
					<div className="mb-[0.15in] hidden font-sans text-[9pt] font-bold tracking-[0.06em] text-black uppercase print:block">
						{currentFilterLabel}
					</div>
					<Suspense fallback={<div style={{ opacity: 0.5, padding: "1rem", background: "transparent" }}>Loading users...</div>}>
						<UsersList filters={filters} />
					</Suspense>
				</div>
				{showEditModal && EditUserFormContent && (
					<RouteModalPopup key={editUserId} paramName={USER_MODAL_PARAMS.edit} title="Edit User">
						<EditUserFormContent userId={editUserId!} showDangerZone={false} />
					</RouteModalPopup>
				)}
				{showAddModal && AddUserFormContent && (
					<RouteModalPopup key="add-user" paramName={USER_MODAL_PARAMS.add} title="Add User">
						<AddUserFormContent />
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


