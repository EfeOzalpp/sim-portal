// React & Next.js
import { redirect } from "next/navigation";

// Actions
import { getAllSemesters, getIndividualSemesterData } from "@/actions/semesters";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/semesters/SemesterFilterSelect";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/primitives/PrintLink";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import PersonProfileModal from "@/components/domain/users/PersonProfileModal";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import ThursdayDetailContent, { thursdayDetailDialogClassName } from "@/components/domain/thursdays/ThursdayDetailContent";

// Composition
import IndividualPerformanceTable from "@/app/individual/composition/IndividualPerformanceTable";

// Helpers
import { ALL_SEMESTERS_VALUE, formatSemesterCode, getSelectedSemesterId, isAllSemestersValue } from "@/components/domain/semesters/semester-filter";
import { ACTION_MODES } from "@/constants/action-modes";
import { THURSDAY_MODAL_PARAMS, USER_MODAL_PARAMS } from "@/constants/modal-params";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";

interface IndividualPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IndividualPage({ searchParams }: IndividualPageProps) {
	const session = await auth();
	if (!isAdminRole(session?.user?.role)) redirect("/users");

	const filters = await searchParams;
	const profileUserIdParam = filters[USER_MODAL_PARAMS.profile];
	const profileUserId = typeof profileUserIdParam === "string" ? profileUserIdParam : undefined;
	const thursdayIdParam = filters[THURSDAY_MODAL_PARAMS.view];
	const thursdayId = typeof thursdayIdParam === "string" ? thursdayIdParam : undefined;

	const semestersResult = await getAllSemesters();
	const semesters = semestersResult.success ? semestersResult.data : [];
	const semesterId = getSelectedSemesterId(filters, semesters);
	const isAllSemesters = isAllSemestersValue(semesterId);
	const currentFilterLabel = isAllSemesters
		? ALL_SEMESTERS_VALUE
		: formatSemesterCode(semesters.find((semester: any) => semester.id === semesterId)?.name || semesterId);

	const semesterDataResult = semesterId
		? await getIndividualSemesterData(semesterId, filters)
		: null;
	const semesterData = semesterDataResult?.success
		? semesterDataResult.data
		: null;

	return (
		<>
			<PageTitle title="Individual Performance" filter={currentFilterLabel} />
			<ActionModeSurface>
				<NavContent
					filterContent={
						<>
							<FilterInput query="user" placeholder="Search" />
							<SemesterFilterSelect semesters={semesters} defaultValue={semesterId} />
						</>
					}
					filterLabel="Search & Filter"
					manageContent={
						<ActionModeButton type="button" variant="action" mode={ACTION_MODES.editGrades}>
							Edit Grades
						</ActionModeButton>
					}
					manageLabel="Manage Grades"
					mobileManageContent={
						<ActionModeButton type="button" variant="action" mode={ACTION_MODES.editGrades}>
							Edit Grades
						</ActionModeButton>
					}
					printContent={<PrintLink />}
				/>
				<div data-full-bleed-content>
					<IndividualPerformanceTable
						users={semesterData?.users || []}
					/>
				</div>
				{profileUserId && (
					<PersonProfileModal key={profileUserId} profileUserId={profileUserId} />
				)}
				{thursdayId && (
					<RouteModalPopup
						key={thursdayId}
						paramName={THURSDAY_MODAL_PARAMS.view}
						title="Thursday"
						dialogClassName={thursdayDetailDialogClassName}
					>
						<ThursdayDetailContent thursdayId={thursdayId} />
					</RouteModalPopup>
				)}
			</ActionModeSurface>
		</>
	);
}
