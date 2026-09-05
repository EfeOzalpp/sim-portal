// React & Next.js
import { redirect } from "next/navigation";

// Actions
import { getAllSemesters } from "@/actions/semesters";

// Components
import { FilterInput } from "@/components/primitives/Filters";
import { Button } from "@/components/button";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import RouteModalPopup from "@/components/modal/RouteModalPopup";

// Composition
import AddSemesterFormContent from "@/app/semester/add/AddSemesterFormContent";
import EditSemesterFormContent from "@/app/semester/[id]/edit/EditSemesterFormContent";
import SemesterDeleteConfirmContent from "@/app/semester/composition/SemesterDeleteConfirmContent";
import SemesterCardGrid from "@/app/semester/composition/SemesterCardGrid";

// Helpers
import { ALL_SEMESTERS_VALUE, formatSemesterCode, getSearchParamValue } from "@/components/domain/semesters/semester-filter";
import { ACTION_MODES } from "@/constants/action-modes";
import { SEMESTER_MODAL_PARAMS, type SemesterModalParam } from "@/constants/modal-params";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";

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
  const visibleSemesters = semesterSearch
    ? semesters.filter((semester: any) =>
        semester.name?.toLowerCase().includes(semesterSearch) ||
        formatSemesterCode(semester.name).toLowerCase().includes(semesterSearch)
      )
    : semesters;
  const addSemester = getSingleParam(filters[SEMESTER_MODAL_PARAMS.add]);
  const editSemesterId = getSingleParam(filters[SEMESTER_MODAL_PARAMS.edit]);
  const deleteSemesterId = getSingleParam(filters[SEMESTER_MODAL_PARAMS.delete]);
  const semesterReturnHref = getSemesterReturnHref(filters);

  return (
    <>
      <PageTitle title="Semester" filter={ALL_SEMESTERS_VALUE} />
      <ActionModeSurface>
        <NavContent
          filterContent={<FilterInput query="semesterSearch" placeholder="Search semester" />}
          filterLabel="Search"
          manageContent={
            <>
              <Button href={getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.add, "1")} variant="action">New Semester</Button>
              <ActionModeButton type="button" variant="action" mode={ACTION_MODES.editSemesters}>Edit Semesters</ActionModeButton>
              <ActionModeButton type="button" variant="action" mode={ACTION_MODES.deleteSemesters}>Delete Semesters</ActionModeButton>
            </>
          }
          manageLabel="Manage Semesters"
          mobileManageContent={
            <>
              <Button href={getSemesterModalHref(filters, SEMESTER_MODAL_PARAMS.add, "1")} variant="action">Add</Button>
              <ActionModeButton type="button" variant="action" mode={ACTION_MODES.editSemesters}>Edit</ActionModeButton>
              <ActionModeButton type="button" variant="action" mode={ACTION_MODES.deleteSemesters}>Del</ActionModeButton>
            </>
          }
        />
        <div className="px-3 pb-3">
          {visibleSemesters.length > 0 ? (
            <SemesterCardGrid semesters={visibleSemesters} />
          ) : (
            <p className="m-0 p-4 text-[var(--app-muted)]">No semesters found.</p>
          )}
        </div>
        {addSemester && !editSemesterId && !deleteSemesterId && (
          <RouteModalPopup
            key="add-semester"
            paramName={SEMESTER_MODAL_PARAMS.add}
            title="Add Semester"
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
      </ActionModeSurface>
    </>
  );
}
