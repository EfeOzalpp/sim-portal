import { Suspense } from "react";
import { Button } from "@/components/primitives/AntD";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import { getFilteredThursdays } from "@/actions/thursdays";
import { getAllSemesters } from "@/actions/semesters";
import { auth } from "@/authentication";
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/semesters/SemesterFilterSelect";
import ThursdayCard from "@/components/domain/thursdays/ThursdayCard";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import { formatSemesterCode, getSelectedSemester, getSelectedSemesterId, isAllSemestersValue } from "@/components/domain/semesters/semester-filter";
import RouteModalPopup from "@/components/modals/ModalPopup/RouteModalPopup";
import ThursdayDetailContent, { thursdayDetailDialogClassName } from "@/components/domain/thursdays/ThursdayDetailContent";
import PersonProfileModal from "@/components/domain/users/PersonProfileModal";
import AddThursdayFormContent from "@/app/thursdays/add/AddThursdayFormContent";
import EditThursdayFormContent from "@/app/thursdays/[id]/edit/EditThursdayFormContent";
import ThursdayDeleteConfirmContent from "@/components/domain/thursdays/ThursdayDeleteConfirmContent";
import { confirmDeleteDialogClassName } from "@/components/modals/ConfirmDelete/styles";

interface ThursdaysProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const thursdayModalParams = new Set(["addThursday", "thursdayId", "profileUserId", "editThursdayId", "deleteThursdayId"]);

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getThursdaysModalHref(
  filters: { [key: string]: string | string[] | undefined },
  modalParam: "addThursday" | "thursdayId" | "profileUserId" | "editThursdayId" | "deleteThursdayId",
  value: string,
) {
  const params = new URLSearchParams();

  for (const [key, filterValue] of Object.entries(filters)) {
    if (thursdayModalParams.has(key)) continue;

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
  return `/thursdays?${params.toString()}`;
}

function getThursdaysReturnHref(filters: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (thursdayModalParams.has(key)) continue;

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
  return query ? `/thursdays?${query}` : "/thursdays";
}

async function ThursdaysList({
  filters,
  isAdmin,
  semesters,
}: {
  filters: any;
  isAdmin: boolean;
  semesters: any[];
}) {
  const thursdaysResult = await getFilteredThursdays(filters);
  const thursdays = thursdaysResult.success ? thursdaysResult.data : [];

  if (thursdays.length < 1) {
    const semesterName = semesters.find(s => s.id === filters.semesterId)?.name || filters.semesterId || "this semester";
    return <>There are no results for {semesterName}.</>;
  }

  return (
    <div className="grid gap-[var(--gap-md)] px-[var(--spacing-sm)] pb-[var(--spacing-lg)]">
      {thursdays.map((thursday: any) => (
        <ThursdayCard key={thursday.id} thursday={thursday} isAdmin={isAdmin} />
      ))}
    </div>
  );
}

export default async function Thursdays({ searchParams }: ThursdaysProps) {
  const filters = await searchParams;
  const semestersResult = await getAllSemesters();
  const semesters = semestersResult.success ? semestersResult.data : [];
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const selectedSemesterId = getSelectedSemesterId(filters, semesters);
  const selectedSemester = getSelectedSemester(filters, semesters);
  const semesterCode = formatSemesterCode(selectedSemester?.name || selectedSemesterId);
  const currentFilterLabel = isAllSemestersValue(selectedSemesterId) ? "All" : semesterCode;
  const addThursday = getSingleParam(filters.addThursday);
  const thursdayId = getSingleParam(filters.thursdayId);
  const profileUserId = getSingleParam(filters.profileUserId);
  const editThursdayId = getSingleParam(filters.editThursdayId);
  const deleteThursdayId = getSingleParam(filters.deleteThursdayId);
  const thursdaysReturnHref = getThursdaysReturnHref(filters);

  return (
    <>
      <PageTitle title="Thursdays" filter={currentFilterLabel} />
      <ActionModeSurface>
        <NavContent
          filterContent={
            <>
              <FilterInput query={"thursdays"} placeholder="Search production" />
              <SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} />
            </>
          }
          filterLabel="Search & Filter"
          manageContent={
            isAdmin ? (
              <>
                <Button href={getThursdaysModalHref(filters, "addThursday", "1")} className="action-button">Add Thursday</Button>
                <ActionModeButton htmlType="button" className="action-button" mode="edit-thursdays">
                  Edit Thursdays
                </ActionModeButton>
                <ActionModeButton htmlType="button" className="action-button" mode="delete-thursdays">
                  Delete Thursdays
                </ActionModeButton>
              </>
            ) : null
          }
          manageLabel="Manage Thursdays"
          mobileManageContent={
            isAdmin ? (
              <>
                <Button href={getThursdaysModalHref(filters, "addThursday", "1")} className="action-button">Add</Button>
                <ActionModeButton htmlType="button" className="action-button" mode="edit-thursdays">
                  Edit
                </ActionModeButton>
                <ActionModeButton htmlType="button" className="action-button" mode="delete-thursdays">
                  Del
                </ActionModeButton>
              </>
            ) : null
          }
        />
        <Suspense
          fallback={<div style={{ opacity: 0.5, padding: "var(--spacing-md)", background: "transparent" }}>Loading days...</div>}
        >
          <ThursdaysList filters={filters} isAdmin={isAdmin} semesters={semesters} />
        </Suspense>
        {profileUserId && (
          <PersonProfileModal key={profileUserId} profileUserId={profileUserId} />
        )}
        {addThursday && !thursdayId && !profileUserId && !editThursdayId && !deleteThursdayId && (
          <RouteModalPopup
            key="add-thursday"
            paramName="addThursday"
            title="Add Thursday"
            dialogClassName={thursdayDetailDialogClassName}
          >
            <AddThursdayFormContent />
          </RouteModalPopup>
        )}
        {editThursdayId && !addThursday && !thursdayId && !profileUserId && !deleteThursdayId && (
          <RouteModalPopup
            key={editThursdayId}
            paramName="editThursdayId"
            title="Edit Thursday"
            dialogClassName={thursdayDetailDialogClassName}
          >
            <EditThursdayFormContent thursdayId={editThursdayId} />
          </RouteModalPopup>
        )}
        {deleteThursdayId && !addThursday && !thursdayId && !profileUserId && !editThursdayId && (
          <RouteModalPopup
            key={deleteThursdayId}
            paramName="deleteThursdayId"
            title="Delete Thursday"
            dialogClassName={confirmDeleteDialogClassName}
          >
            <ThursdayDeleteConfirmContent
              thursdayId={deleteThursdayId}
              returnHref={thursdaysReturnHref}
            />
          </RouteModalPopup>
        )}
        {thursdayId && !addThursday && !editThursdayId && !deleteThursdayId && (
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
