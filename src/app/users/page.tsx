import { Suspense } from "react";
import { getAllSemesters } from "@/actions/semesters";
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/semesters/SemesterFilterSelect";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/primitives/PrintLink";
import { Button } from "@/components/button";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import { formatSemesterCode, getSelectedSemester, getSelectedSemesterId, isAllSemestersValue } from "@/components/domain/semesters/semester-filter";

import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";
import UsersList from "@/app/users/composition/UsersList";
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

const userModalParams = new Set(["addUser", "editUserId", "profileUserId", "deleteUserId"]);

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
	modalParam: "addUser" | "editUserId" | "profileUserId" | "deleteUserId",
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
	const isAdmin = session?.user?.role === "ADMIN";
	const selectedSemesterId = getSelectedSemesterId(filters, semesters);
	const selectedSemester = getSelectedSemester(filters, semesters);
	const currentFilterLabel = isAllSemestersValue(selectedSemesterId)
		? "All"
		: formatSemesterCode(selectedSemester?.name || selectedSemesterId);
	const editUserId = getSingleParam(filters.editUserId);
	const profileUserId = getSingleParam(filters.profileUserId);
	const deleteUserId = getSingleParam(filters.deleteUserId);
	const addUser = getSingleParam(filters.addUser);
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
		? (await import("@/components/domain/users/PersonProfileModal")).default
		: null;
	const UserDeleteConfirmContent = showDeleteModal
		? (await import("@/app/users/composition/UserDeleteConfirmContent")).default
		: null;

	return (
		<>
			<PageTitle title="People" filter={currentFilterLabel} />
			<ActionModeSurface>
				<NavContent
					className="print:hidden!"
					filterContent={
						<>
							<FilterInput query={"user"} placeholder="Search user" />
							<SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} />
						</>
					}
					filterLabel="Search & Filter"
					manageContent={
						isAdmin ? (
							<>
								<Button href={getUsersModalHref(filters, "addUser", "1")} variant="action">
									Add User
								</Button>
								<ActionModeButton type="button" variant="action" mode="edit-users" >
									Edit Users
								</ActionModeButton>
								<ActionModeButton type="button" variant="action" mode="delete-users" >
									Delete Users
								</ActionModeButton>
							</>
						) : null
					}
					manageLabel="Manage People"
					mobileManageContent={
						isAdmin ? (
							<>
								<Button href={getUsersModalHref(filters, "addUser", "1")} variant="action">
									Add
								</Button>
								<ActionModeButton type="button" variant="action" mode="edit-users" >
									Edit
								</ActionModeButton>
								<ActionModeButton type="button" variant="action" mode="delete-users" >
									Del
								</ActionModeButton>
							</>
						) : null
					}
					printContent={<PrintLink />}
				/>
				<div>
					<div className="mb-[0.15in] hidden font-sans text-[9pt] font-bold tracking-[0.06em] text-black uppercase print:block">
						{currentFilterLabel !== "All" ? currentFilterLabel : "All Semesters"}
					</div>
					<Suspense fallback={<div style={{ opacity: 0.5, padding: "1rem", background: "transparent" }}>Loading users...</div>}>
						<UsersList filters={filters} />
					</Suspense>
				</div>
				{showEditModal && EditUserFormContent && (
					<RouteModalPopup key={editUserId} paramName="editUserId" title="Edit User">
						<EditUserFormContent userId={editUserId!} showDangerZone={false} />
					</RouteModalPopup>
				)}
				{showAddModal && AddUserFormContent && (
					<RouteModalPopup key="add-user" paramName="addUser" title="Add User">
						<AddUserFormContent />
					</RouteModalPopup>
				)}
				{showProfileModal && PersonProfileModal && (
					<PersonProfileModal key={profileUserId} profileUserId={profileUserId!} />
				)}
				{showDeleteModal && UserDeleteConfirmContent && (
					<RouteModalPopup
						key={deleteUserId}
						paramName="deleteUserId"
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


