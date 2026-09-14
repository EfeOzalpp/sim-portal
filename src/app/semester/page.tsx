// React & Next.js
import { redirect } from "next/navigation";

// Actions
import { getAllSemesters } from "@/actions/semesters";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import PageTitle from "@/components/layout/PageTitle";
import RouteModalPopup from "@/components/modal/RouteModalPopup";

// Composition
import AddSemesterFormContent from "@/app/semester/add/AddSemesterFormContent";
import EditSemesterFormContent from "@/app/semester/[id]/edit/EditSemesterFormContent";
import SemesterDeleteConfirmContent from "@/app/semester/composition/SemesterDeleteConfirmContent";
import SemesterCardGrid from "@/app/semester/composition/SemesterCardGrid";
import SemesterSortPopover from "@/app/semester/composition/SemesterSortPopover";

// Helpers
import { ALL_SEMESTERS_VALUE, formatSemesterCode, getSearchParamValue, normalizeSemesterCode, semesterOrdinal } from "@/components/domain/filters/semester-filter";
import { SEMESTER_MODAL_PARAMS, type SemesterModalParam } from "@/constants/modal-params";
import { DEFAULT_SEMESTER_SORT, SEMESTER_SORT_KEY, type SemesterSortValue } from "@/constants/filters";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";

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
  const editSemesterId = getSingleParam(filters[SEMESTER_MODAL_PARAMS.edit]);
  const deleteSemesterId = getSingleParam(filters[SEMESTER_MODAL_PARAMS.delete]);
  const semesterReturnHref = getSemesterReturnHref(filters);
  const addHref = getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.add, "1");
  const getEditHref = (semesterId: string) => getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.edit, semesterId);
  const getDeleteHref = (semesterId: string) => getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.delete, semesterId);

  return (
    <>
      <PageTitle
        title={ALL_SEMESTERS_VALUE}
        contentClassName="min-[769px]:ml-[calc(var(--nav-rail-collapsed-width)_+_12rem)]"
        filterControlClassName="w-56 min-w-0 shrink-0"
        filterControl={
          <div className="flex items-center gap-2">
            <SemesterSortPopover />
            <div className="min-w-0 flex-1 [&_.input-affix-wrapper]:border-[var(--green-select-border)] [&_.input-affix-wrapper]:bg-[var(--green-select-bg)] [&_.input-affix-wrapper:hover]:border-[var(--green-select-border)] [&_.input-affix-wrapper:hover]:bg-[var(--green-select-bg-hover)] [&_.input-affix-wrapper:focus-within]:border-[var(--green-select-border)] [&_input]:text-[var(--green-text)] [&_input]:placeholder:text-[var(--green-text)] [&_.input-affix-wrapper>span:first-child]:bg-[var(--green-text)]">
              <FilterInput query="semesterSearch" placeholder="Search" allowClear={false} suffix={null} />
            </div>
          </div>
        }
      />
      <div data-page-content>
        {/* bg here, not on individual cards' own container - see users/page.tsx for the full explanation. */}
        <div className="bg-[var(--app-semesters-surface)] pr-6 pl-9 pt-9! pb-9 min-[769px]:ml-[var(--nav-rail-collapsed-width)] min-[769px]:mr-2 min-[769px]:rounded-tl-[0.5rem] min-[769px]:rounded-tr-[0.5rem] min-[769px]:border min-[769px]:border-b-0 min-[769px]:border-solid min-[769px]:border-[var(--main-border)] min-[769px]:shadow-[var(--content-shadow)]">
          {semesterSearch && visibleSemesters.length === 0 && (
            <p className="m-0 mb-4 text-[var(--app-label)]">No semesters found.</p>
          )}
          <SemesterCardGrid
            semesters={visibleSemesters}
            addHref={addHref}
            getEditHref={getEditHref}
            getDeleteHref={getDeleteHref}
          />
        </div>
        {addSemester && !editSemesterId && !deleteSemesterId && (
          <RouteModalPopup
            key="add-semester"
            paramName={SEMESTER_MODAL_PARAMS.add}
            title="New Semester"
            dialogClassName="w-[min(52rem,100%)] max-[768px]:h-dvh"
          >
            <AddSemesterFormContent />
          </RouteModalPopup>
        )}
        {editSemesterId && !addSemester && !deleteSemesterId && (
          <RouteModalPopup
            key={editSemesterId}
            paramName={SEMESTER_MODAL_PARAMS.edit}
            title="Edit Semester"
            dialogClassName="w-[min(52rem,100%)] max-[768px]:h-dvh"
          >
            <EditSemesterFormContent semesterId={editSemesterId} />
          </RouteModalPopup>
        )}
        {deleteSemesterId && !addSemester && !editSemesterId && (
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
