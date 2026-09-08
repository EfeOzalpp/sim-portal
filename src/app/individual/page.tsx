// React & Next.js
import { redirect } from "next/navigation";

// Actions
import { getAllSemesters, getIndividualSemesterData } from "@/actions/semesters";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/filters/SemesterFilterSelect";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/primitives/PrintLink";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import PersonProfileModal from "@/components/domain/profile/PersonProfileModal";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import ThursdayDetailContent, { thursdayDetailDialogClassName } from "@/components/domain/productions/ThursdayDetailContent";

// Composition
import IndividualPerformanceTable from "@/app/individual/composition/IndividualPerformanceTable";
import EditThursdayFormContent from "@/app/thursdays/[id]/edit/EditThursdayFormContent";

// Helpers
import { ALL_SEMESTERS_VALUE, formatSemesterCode, getSelectedSemesterId, getSemesterFilterValue, isAllSemestersValue, THURSDAY_SCOPE_FILTER_KEY } from "@/components/domain/filters/semester-filter";
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
	const editThursdayIdParam = filters[THURSDAY_MODAL_PARAMS.edit];
	const editThursdayId = typeof editThursdayIdParam === "string" ? editThursdayIdParam : undefined;

	const semestersResult = await getAllSemesters();
	const semesters = semestersResult.success ? semestersResult.data : [];
	const semesterId = getSelectedSemesterId(filters, semesters);
	const isAllSemesters = isAllSemestersValue(semesterId);
	const currentFilterLabel = isAllSemesters
		? ALL_SEMESTERS_VALUE
		: formatSemesterCode(semesters.find((semester: any) => semester.id === semesterId)?.name || semesterId);

	// Decoupled from semesterId above - that one picks who's on the roster,
	// this picks which semester's productions/presentations/grades are
	// shown for those people. Defaults to "All Semesters" rather than the
	// usual current-date match (unlike every other semester filter in the
	// app) - only when nothing's explicitly set, so an explicit choice
	// (including explicitly picking "All Semesters") still round-trips
	// through the URL normally.
	const hasExplicitScopeValue = !!getSemesterFilterValue(filters, THURSDAY_SCOPE_FILTER_KEY);
	const thursdayScopeId = hasExplicitScopeValue
		? getSelectedSemesterId(filters, semesters, THURSDAY_SCOPE_FILTER_KEY)
		: ALL_SEMESTERS_VALUE;
	const isAllThursdayScope = isAllSemestersValue(thursdayScopeId);

	const semesterDataResult = semesterId
		? await getIndividualSemesterData(semesterId, filters, thursdayScopeId ?? undefined)
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
							<SemesterFilterSelect semesters={semesters} defaultValue={semesterId} />
							<FilterInput query="user" placeholder="Search" />
						</>
					}
					filterLabel="Filter & Search"
					manageContent={
						<>
							<ActionModeButton type="button" variant="action" mode={ACTION_MODES.editGrades}>
								Edit Grades
							</ActionModeButton>
							{/* Decoupled from the Semester filter above: that one picks
							    who's on the roster, this picks which semester's
							    productions/presentations/grades are shown for those
							    people. Extra mt-4 (beyond navSectionControlsManage's own
							    gap) so it doesn't blend into the Edit Grades button above it. */}
							<div className="mt-4 flex min-w-0 flex-col gap-1">
								<span className="ui-label m-0 block">Thursday Scope</span>
								<SemesterFilterSelect
									semesters={semesters}
									defaultValue={thursdayScopeId}
									filterKey={THURSDAY_SCOPE_FILTER_KEY}
									placeholder="Thursday Scope"
								/>
							</div>
						</>
					}
					manageLabel="Manage Grades"
					mobileManageContent={
						<>
							<ActionModeButton type="button" variant="action" mode={ACTION_MODES.editGrades}>
								Edit Grades
							</ActionModeButton>
							<div className="mt-4 flex min-w-0 flex-col gap-1">
								<span className="ui-label m-0 block">Thursday Scope</span>
								<SemesterFilterSelect
									semesters={semesters}
									defaultValue={thursdayScopeId}
									filterKey={THURSDAY_SCOPE_FILTER_KEY}
									placeholder="Thursday Scope"
								/>
							</div>
						</>
					}
					printContent={<PrintLink />}
				/>
				<div data-full-bleed-content>
					<IndividualPerformanceTable
						users={semesterData?.users || []}
						isAllSemesters={isAllThursdayScope}
					/>
				</div>
				{profileUserId && (
					<PersonProfileModal key={profileUserId} profileUserId={profileUserId} />
				)}
				{editThursdayId && !thursdayId && !profileUserId && (
					<RouteModalPopup
						key={editThursdayId}
						paramName={THURSDAY_MODAL_PARAMS.edit}
						title="Edit Thursday"
						dialogClassName={thursdayDetailDialogClassName}
					>
						<EditThursdayFormContent thursdayId={editThursdayId} />
					</RouteModalPopup>
				)}
				{thursdayId && !editThursdayId && (
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
