import { Suspense } from "react";
import { getFilteredUsers } from "@/actions/users";
import { getAllSemesters } from "@/actions/semesters";
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/semesters/SemesterFilterSelect";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/primitives/PrintLink";
import { Button } from "@/components/primitives/AntD";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import RouteModalPopup from "@/components/modals/ModalPopup/RouteModalPopup";
import AddUserFormContent from "@/app/users/add/AddUserFormContent";
import { formatSemesterCode, getSelectedSemester, getSelectedSemesterId, isAllSemestersValue } from "@/components/domain/semesters/semester-filter";

import { confirmDeleteDialogClassName } from "@/components/modals/ConfirmDelete/styles";
import UserCardGrid from "@/components/domain/users/UserCardGrid";
import EditUserFormContent from "@/app/users/[id]/edit/EditUserFormContent";
import UserDeleteConfirmContent from "@/components/domain/users/UserDeleteConfirmContent";
import { auth } from "@/authentication";
import PersonProfileModal from "@/components/domain/users/PersonProfileModal";

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

async function UsersList({ filters }: { filters: any }) {
	const result = await getFilteredUsers(filters);
	const users = result.success ? result.data : [];

	if (users.length < 1) {
		return <div>There are no results for User {filters?.user}</div>;
	}

	return <UserCardGrid users={users} />;
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
								<Button href={getUsersModalHref(filters, "addUser", "1")} className="action-button">
									Add User
								</Button>
								<ActionModeButton htmlType="button" className="action-button" mode="edit-users" >
									Edit Users
								</ActionModeButton>
								<ActionModeButton htmlType="button" className="action-button" mode="delete-users" >
									Delete Users
								</ActionModeButton>
							</>
						) : null
					}
					manageLabel="Manage People"
					mobileManageContent={
						isAdmin ? (
							<>
								<Button href={getUsersModalHref(filters, "addUser", "1")} className="action-button">
									Add
								</Button>
								<ActionModeButton htmlType="button" className="action-button" mode="edit-users" >
									Edit
								</ActionModeButton>
								<ActionModeButton htmlType="button" className="action-button" mode="delete-users" >
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
					<Suspense fallback={<div style={{ opacity: 0.5, padding: "var(--spacing-md)", background: "transparent" }}>Loading users...</div>}>
						<UsersList filters={filters} />
					</Suspense>
				</div>
				{editUserId && (
					<RouteModalPopup key={editUserId} paramName="editUserId" title="Edit User">
						<EditUserFormContent userId={editUserId} showDangerZone={false} />
					</RouteModalPopup>
				)}
				{addUser && !editUserId && !profileUserId && !deleteUserId && (
					<RouteModalPopup key="add-user" paramName="addUser" title="Add User">
						<AddUserFormContent />
					</RouteModalPopup>
				)}
				{profileUserId && !editUserId && (
					<PersonProfileModal key={profileUserId} profileUserId={profileUserId} />
				)}
				{deleteUserId && !editUserId && !profileUserId && (
					<RouteModalPopup
						key={deleteUserId}
						paramName="deleteUserId"
						title="Delete User"
						dialogClassName={confirmDeleteDialogClassName}
					>
						<UserDeleteConfirmContent
							userId={deleteUserId}
							returnHref={usersReturnHref}
						/>
					</RouteModalPopup>
				)}
			</ActionModeSurface>
		</>
	);
}


