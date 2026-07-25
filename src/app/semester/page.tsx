import { redirect } from "next/navigation";
import { auth } from "@/authentication";
import { FilterInput } from "@/components/primitives/Filters";
import { Button } from "@/components/primitives/AntD";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import { getAllSemesters } from "@/actions/semesters";
import { formatSemesterCode, getSearchParamValue } from "@/components/domain/semesters/semester-filter";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import RouteModalPopup from "@/components/modals/ModalPopup/RouteModalPopup";
import AddSemesterFormContent from "@/app/semester/add/AddSemesterFormContent";
import EditSemesterFormContent from "@/app/semester/[id]/edit/EditSemesterFormContent";
import SemesterDeleteConfirmContent from "@/components/domain/semesters/SemesterDeleteConfirmContent";
import SemesterCardGrid from "@/components/domain/semesters/SemesterCardGrid";
import { confirmDeleteDialogClassName } from "@/components/modals/ConfirmDelete/styles";

interface SemesterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const semesterModalParams = new Set(["addSemester", "editSemesterId", "deleteSemesterId"]);

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSemesterModalHref(
  filters: { [key: string]: string | string[] | undefined },
  modalParam: "addSemester" | "editSemesterId" | "deleteSemesterId",
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
  if (session?.user?.role !== "ADMIN") redirect("/users");

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
  const addSemester = getSingleParam(filters.addSemester);
  const editSemesterId = getSingleParam(filters.editSemesterId);
  const deleteSemesterId = getSingleParam(filters.deleteSemesterId);
  const semesterReturnHref = getSemesterReturnHref(filters);

  return (
    <>
      <PageTitle title="Semester" filter="All" />
      <ActionModeSurface>
        <NavContent
          filterContent={<FilterInput query="semesterSearch" placeholder="Search semester" />}
          filterLabel="Search"
          manageContent={
            <>
              <Button href={getSemesterModalHref(filters, "addSemester", "1")} className="action-button">New Semester</Button>
              <ActionModeButton htmlType="button" className="action-button" mode="edit-semesters">Edit Semesters</ActionModeButton>
              <ActionModeButton htmlType="button" className="action-button" mode="delete-semesters">Delete Semesters</ActionModeButton>
            </>
          }
          manageLabel="Manage Semesters"
          mobileManageContent={
            <>
              <Button href={getSemesterModalHref(filters, "addSemester", "1")} className="action-button">Add</Button>
              <ActionModeButton htmlType="button" className="action-button" mode="edit-semesters">Edit</ActionModeButton>
              <ActionModeButton htmlType="button" className="action-button" mode="delete-semesters">Del</ActionModeButton>
            </>
          }
        />
        <div className="px-[var(--spacing-sm)] pb-[var(--spacing-lg)]">
          {visibleSemesters.length > 0 ? (
            <SemesterCardGrid semesters={visibleSemesters} />
          ) : (
            <p className="m-0 text-[var(--app-muted)]">No semesters found.</p>
          )}
        </div>
        {addSemester && !editSemesterId && !deleteSemesterId && (
          <RouteModalPopup
            key="add-semester"
            paramName="addSemester"
            title="Add Semester"
            dialogClassName="w-[min(52rem,100%)] max-[768px]:h-dvh"
          >
            <AddSemesterFormContent />
          </RouteModalPopup>
        )}
        {editSemesterId && !addSemester && !deleteSemesterId && (
          <RouteModalPopup
            key={editSemesterId}
            paramName="editSemesterId"
            title="Edit Semester"
            dialogClassName="w-[min(52rem,100%)] max-[768px]:h-dvh"
          >
            <EditSemesterFormContent semesterId={editSemesterId} />
          </RouteModalPopup>
        )}
        {deleteSemesterId && !addSemester && !editSemesterId && (
          <RouteModalPopup
            key={deleteSemesterId}
            paramName="deleteSemesterId"
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
