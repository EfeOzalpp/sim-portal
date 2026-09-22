// React & Next.js
import { redirect } from "next/navigation";

// Actions
import { getSemesterOptions, getIndividualSemesterData } from "@/actions/semesters";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/filters/SemesterFilterSelect";
import PageTitle from "@/components/layout/PageTitle";
import PrintLink from "@/components/primitives/PrintLink";
import { ActionModeSurface } from "@/components/layout/ActionMode";
import PersonProfileModal from "@/components/domain/profile/PersonProfileModal";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import ThursdayDetailContent, { ThursdayDetailTitle, thursdayDetailDialogClassName } from "@/components/domain/productions/ThursdayDetailContent";

// Composition
import EditGradesButton from "@/app/individual/composition/EditGradesButton";
import IndividualPerformanceTable from "@/app/individual/composition/IndividualPerformanceTable";
import { SelectedUsersProvider } from "@/app/individual/composition/SelectedUsersProvider";
import SelectedCountLabel from "@/app/individual/composition/SelectedCountLabel";
import ThursdayScopeFilterPopover from "@/app/individual/composition/ThursdayScopeFilterPopover";
import ScopePill from "@/app/individual/composition/ScopePill";
import EditThursdayFormContent from "@/app/thursdays/[id]/edit/EditThursdayFormContent";
import { thursdayFormDialogClassName } from "@/app/thursdays/composition/ThursdayForm";

// Helpers
import { ALL_SEMESTERS_VALUE, formatSemesterCode, getSelectedSemesterId, getSemesterFilterValue, isAllSemestersValue, THURSDAY_SCOPE_FILTER_KEY } from "@/components/domain/filters/semester-filter";
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

	const semestersResult = await getSemesterOptions();
	const semesters = semestersResult.success ? semestersResult.data : [];
	const semesterId = getSelectedSemesterId(filters, semesters);
	// Shown next to "Names" in the table header - so it's obvious at a
	// glance which semester's roster this is, regardless of whether the
	// Presentations/Productions/Grades scope below is Current or All.
	const currentSemesterCode = formatSemesterCode(semesters.find((semester) => semester.id === semesterId)?.name);

	const hasExplicitScopeValue = !!getSemesterFilterValue(filters, THURSDAY_SCOPE_FILTER_KEY);
	const thursdayScopeId = hasExplicitScopeValue
		? getSelectedSemesterId(filters, semesters, THURSDAY_SCOPE_FILTER_KEY)
		: ALL_SEMESTERS_VALUE;
	const isAllScope = isAllSemestersValue(thursdayScopeId);

	const semesterDataResult = semesterId
		? await getIndividualSemesterData(semesterId, filters, thursdayScopeId ?? undefined)
		: null;
	const semesterData = semesterDataResult?.success
		? semesterDataResult.data
		: null;

	return (
		<>
			<PageTitle
				title="Student Progress"
				contentClassName="min-[769px]:ml-[calc(var(--nav-rail-collapsed-width)_+_12rem)]"
				filterControl={<SemesterFilterSelect semesters={semesters} defaultValue={semesterId} variant="title" />}
			/>
			<ActionModeSurface>
				<div data-full-bleed-content className="flex h-full min-h-0 flex-col bg-[var(--app-ind-progress-surface)] min-[769px]:ml-[var(--nav-rail-collapsed-width)] min-[769px]:mr-2 min-[769px]:rounded-tl-[0.5rem] min-[769px]:rounded-tr-[0.5rem] min-[769px]:border min-[769px]:border-b-0 min-[769px]:border-solid min-[769px]:border-[var(--main-border)] min-[769px]:shadow-[var(--content-shadow)]">
					<SelectedUsersProvider>
						<div className="flex flex-none flex-wrap items-center justify-between gap-6 px-6 pt-6 pb-3 print:hidden">
							<div className="flex items-center gap-2">
								<div className="w-50 [--input-bg:var(--page-input-bg)] [--input-border:var(--page-input-border)] [--input-bg-hover:var(--page-input-bg-hover)] [--input-border-hover:var(--page-input-border-hover)] [--input-placeholder:var(--page-input-text)] [--input-icon:var(--page-input-search)]">
									<FilterInput
										query="user"
										placeholder="Search"
										mode="filter"
										filterTrigger={<ThursdayScopeFilterPopover currentSemesterId={semesterId ?? ALL_SEMESTERS_VALUE} />}
									/>
								</div>
								{isAllScope && <ScopePill currentSemesterId={semesterId ?? ALL_SEMESTERS_VALUE} />}
							</div>
							<div className="flex items-center gap-2">
								<SelectedCountLabel />
								<PrintLink label="Export selected" variant="action" />
								<EditGradesButton />
							</div>
						</div>
						<div className="min-h-0 flex-1">
							<IndividualPerformanceTable
								users={semesterData?.users || []}
								isAllScope={isAllScope}
								currentSemesterId={semesterId}
								currentSemesterCode={currentSemesterCode}
							/>
						</div>
					</SelectedUsersProvider>
				</div>
				{profileUserId && (
					<PersonProfileModal key={profileUserId} profileUserId={profileUserId} />
				)}
				{editThursdayId && !thursdayId && !profileUserId && (
					<RouteModalPopup
						key={editThursdayId}
						paramName={THURSDAY_MODAL_PARAMS.edit}
						title="Edit Thursday"
						dialogClassName={thursdayFormDialogClassName}
					>
						<EditThursdayFormContent thursdayId={editThursdayId} />
					</RouteModalPopup>
				)}
				{thursdayId && !editThursdayId && (
					<RouteModalPopup
						key={thursdayId}
						paramName={THURSDAY_MODAL_PARAMS.view}
						title={<ThursdayDetailTitle thursdayId={thursdayId} />}
						dialogClassName={thursdayDetailDialogClassName}
					>
						<ThursdayDetailContent thursdayId={thursdayId} />
					</RouteModalPopup>
				)}
			</ActionModeSurface>
		</>
	);
}
