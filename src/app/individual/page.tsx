import { redirect } from "next/navigation";
import { auth } from "@/authentication";
import { FilterInput } from "@/components/ui/Filters";
import SemesterFilterSelect from "@/components/ui/SemesterFilterSelect";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/ui/PrintLink";
import { getAllSemesters, getIndividualSemesterData } from "@/actions/semesters";
import IndividualPerformanceTable from "@/components/domain/individual/IndividualPerformanceTable";
import ResultsContainer from "@/components/ui/ResultsContainer";
import { ActionModeButton, ActionModeSurface } from "@/components/ui/ActionMode";
import { formatSemesterCode, getSelectedSemesterId, isAllSemestersValue } from "@/components/ui/semester-filter";
import PersonProfileModal from "@/components/domain/users/PersonProfileModal";
import RouteModalPopup from "@/components/ui/ModalPopup/RouteModalPopup";
import ThursdayDetailContent, { thursdayDetailDialogClassName } from "@/components/domain/thursdays/ThursdayDetailContent";

interface IndividualPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function IndividualPage({ searchParams }: IndividualPageProps) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") redirect("/users");

	const filters = await searchParams;
	const profileUserId = typeof filters.profileUserId === "string" ? filters.profileUserId : undefined;
	const thursdayId = typeof filters.thursdayId === "string" ? filters.thursdayId : undefined;

	const semestersResult = await getAllSemesters();
	const semesters = semestersResult.success ? semestersResult.data : [];
	const semesterId = getSelectedSemesterId(filters, semesters);
	const isAllSemesters = isAllSemestersValue(semesterId);
	const currentFilterLabel = isAllSemesters
		? "All"
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
						<ActionModeButton htmlType="button" className="action-button" mode="edit-grades">
							Edit Grades
						</ActionModeButton>
					}
					manageLabel="Manage Grades"
					mobileManageContent={
						<ActionModeButton htmlType="button" className="action-button" mode="edit-grades">
							Edit Grades
						</ActionModeButton>
					}
					printContent={<PrintLink />}
				/>
				<div data-full-bleed-content>
					<ResultsContainer>
						<IndividualPerformanceTable
							users={semesterData?.users || []}
						/>
					</ResultsContainer>
				</div>
				{profileUserId && (
					<PersonProfileModal key={profileUserId} profileUserId={profileUserId} />
				)}
				{thursdayId && (
					<RouteModalPopup
						key={thursdayId}
						paramName="thursdayId"
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
