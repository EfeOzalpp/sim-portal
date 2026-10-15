// React & Next.js
import { redirect } from "next/navigation";

// Actions
import { getAllSemesters } from "@/actions/semesters";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import PageChrome from "@/components/layout/PageChrome/PageChrome";
import PageCard from "@/components/layout/PageCard";
import RouteModalPopup from "@/components/modal/RouteModalPopup";

// Composition
import AddSemesterFormContent from "@/app/semester/add/AddSemesterFormContent";
import EditSemesterFormContent from "@/app/semester/[id]/edit/EditSemesterFormContent";
import SemesterDeleteConfirmContent from "@/app/semester/composition/SemesterDeleteConfirmContent";
import SemesterCardGrid from "@/app/semester/composition/SemesterCardGrid";
import SemesterEnrollmentModalContent from "@/app/semester/composition/SemesterEnrollmentModalContent";
import SemesterSortPopover from "@/app/semester/composition/SemesterSortPopover";

// Helpers
import { formatSemesterCode, getSearchParamValue, normalizeSemesterCode, semesterOrdinal } from "@/components/domain/filters/semester-filter";
import { SEMESTER_MODAL_PARAMS, type SemesterModalParam } from "@/constants/modal-params";
import { DEFAULT_SEMESTER_SORT, SEMESTER_SORT_KEY, type SemesterSortValue } from "@/constants/filters";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";

// Matches users/page.tsx's own userFormDialogClassName (44rem) - this form is
// just stacked fields, same as that one, so it doesn't need the wider 52rem
// ThursdayDetailContent's read-only layout uses.
const semesterFormDialogClassName = "w-[min(44rem,100%)] max-[768px]:h-dvh";

function getSortableOrdinal(semester: any) {
  const code = normalizeSemesterCode(semester.name);
  return code ? semesterOrdinal(code) : -Infinity;
}

function getEnrollmentCount(semester: any) {
  return semester.users?.length ?? 0;
}

function sortSemesters(semesters: any[], sortValue: SemesterSortValue) {
  const sorted = [...semesters];

  switch (sortValue) {
    case "oldest":
      return sorted.sort((a, b) => getSortableOrdinal(a) - getSortableOrdinal(b));
    case "enrollmentHigh":
      return sorted.sort((a, b) => getEnrollmentCount(b) - getEnrollmentCount(a));
    case "enrollmentLow":
      return sorted.sort((a, b) => getEnrollmentCount(a) - getEnrollmentCount(b));
    case "recent":
    default:
      return sorted.sort((a, b) => getSortableOrdinal(b) - getSortableOrdinal(a));
  }
}

interface SemesterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const semesterModalParams = new Set<string>(Object.values(SEMESTER_MODAL_PARAMS));

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSemesterModalHref(
  filters: { [key: string]: string | string[] | undefined },
  modalParam: SemesterModalParam,
  value: string,
) {
  const params = new URLSearchParams();

  for (const [key, filterValue] of Object.entries(filters)) {
    if (semesterModalParams.has(key)) continue;

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
  return `/semester?${params.toString()}`;
}

function getSemesterReturnHref(filters: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (semesterModalParams.has(key)) continue;

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
  return query ? `/semester?${query}` : "/semester";
}

export default async function SemesterPage({ searchParams }: SemesterPageProps) {
  const session = await auth();
  if (!isAdminRole(session?.user?.role)) redirect("/users");

  const filters = await searchParams;

  const semestersResult = await getAllSemesters();
  const semesters = semestersResult.success ? semestersResult.data : [];
  const semesterSearch = getSearchParamValue(filters.semesterSearch)?.toLowerCase() || "";
  const semesterSort = (getSearchParamValue(filters[SEMESTER_SORT_KEY]) as SemesterSortValue) || DEFAULT_SEMESTER_SORT;
  const filteredSemesters = semesterSearch
    ? semesters.filter((semester: any) =>
        semester.name?.toLowerCase().includes(semesterSearch) ||
        formatSemesterCode(semester.name).toLowerCase().includes(semesterSearch)
      )
    : semesters;
  const visibleSemesters = sortSemesters(filteredSemesters, semesterSort);
  const addSemester = getSingleParam(filters[SEMESTER_MODAL_PARAMS.add]);
  const viewSemesterId = getSingleParam(filters[SEMESTER_MODAL_PARAMS.view]);
  const editSemesterId = getSingleParam(filters[SEMESTER_MODAL_PARAMS.edit]);
  const deleteSemesterId = getSingleParam(filters[SEMESTER_MODAL_PARAMS.delete]);
  const viewSemester = viewSemesterId ? semesters.find((semester: any) => semester.id === viewSemesterId) : null;
  const semesterReturnHref = getSemesterReturnHref(filters);
  const addHref = getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.add, "1");
  const getViewHref = (semesterId: string) => getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.view, semesterId);
  const getEditHref = (semesterId: string) => getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.edit, semesterId);
  const getDeleteHref = (semesterId: string) => getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.delete, semesterId);

  return (
    <>
      <PageChrome
        title="Semesters"
        desktopSearchWidth="var(--select-title-width)"
        search={<FilterInput variant="page" query="semesterSearch" placeholder="Search" mode="filter" filterTrigger={<SemesterSortPopover />} />}
      />
      <div data-page-content>
        {/* bg here, not on individual cards' own container - see users/page.tsx for the full explanation. */}
        <PageCard padded data-page-surface className="bg-[var(--page-bg)]">
          {semesterSearch && visibleSemesters.length === 0 && (
            <p className="m-0 mb-4 text-[var(--label-text)]">No semesters found.</p>
          )}
          <SemesterCardGrid
            semesters={visibleSemesters}
            addHref={addHref}
            getViewHref={getViewHref}
            getEditHref={getEditHref}
            getDeleteHref={getDeleteHref}
          />
        </PageCard>
        {viewSemester && !addSemester && !editSemesterId && !deleteSemesterId && (
          <RouteModalPopup
            key={viewSemester.id}
            paramName={SEMESTER_MODAL_PARAMS.view}
            title={<span className="sr-only">{formatSemesterCode(viewSemester.name)} enrollment</span>}
            dialogClassName="w-[min(44rem,100%)] max-[768px]:h-dvh"
            minimalHeader
          >
            <SemesterEnrollmentModalContent semester={viewSemester} />
          </RouteModalPopup>
        )}
        {addSemester && !viewSemesterId && !editSemesterId && !deleteSemesterId && (
          <RouteModalPopup
            key="add-semester"
            paramName={SEMESTER_MODAL_PARAMS.add}
            title="New Semester"
            dialogClassName={semesterFormDialogClassName}
          >
            <AddSemesterFormContent />
          </RouteModalPopup>
        )}
        {editSemesterId && !addSemester && !viewSemesterId && !deleteSemesterId && (
          <RouteModalPopup
            key={editSemesterId}
            paramName={SEMESTER_MODAL_PARAMS.edit}
            title="Edit Semester"
            dialogClassName={semesterFormDialogClassName}
          >
            <EditSemesterFormContent semesterId={editSemesterId} />
          </RouteModalPopup>
        )}
        {deleteSemesterId && !addSemester && !viewSemesterId && !editSemesterId && (
          <RouteModalPopup
            key={deleteSemesterId}
            paramName={SEMESTER_MODAL_PARAMS.delete}
            title="Delete Semester"
            dialogClassName={confirmDeleteDialogClassName}
          >
            <SemesterDeleteConfirmContent
              semesterId={deleteSemesterId}
              returnHref={semesterReturnHref}
            />
          </RouteModalPopup>
        )}
      </div>
    </>
  );
}
