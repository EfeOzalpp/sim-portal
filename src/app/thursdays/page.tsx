// React & Next.js
import { Suspense } from "react";

// Actions
import { getFilteredThursdays } from "@/actions/thursdays";
import { getSemesterOptions } from "@/actions/semesters";

// Components
import { Button } from "@/components/button";
import NavContent from "@/components/layout/NavContent";
import PageTitle from "@/components/layout/PageTitle";
import { FilterInput } from "@/components/primitives/Filters";
import SemesterFilterSelect from "@/components/domain/filters/SemesterFilterSelect";
import { ActionModeButton, ActionModeSurface } from "@/components/layout/ActionMode";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import ModalContentFallback from "@/components/modal/ModalContentFallback";
import ThursdayDetailContent, { thursdayDetailDialogClassName } from "@/components/domain/productions/ThursdayDetailContent";
import PersonProfileModal from "@/components/domain/profile/PersonProfileModal";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";

// Composition
import ThursdayCard from "@/app/thursdays/composition/ThursdayCard";
import AddThursdayFormContent from "@/app/thursdays/add/AddThursdayFormContent";
import EditThursdayFormContent from "@/app/thursdays/[id]/edit/EditThursdayFormContent";
import ThursdayDeleteConfirmContent from "@/app/thursdays/composition/ThursdayDeleteConfirmContent";

// Helpers
import { getSelectedSemesterId } from "@/components/domain/filters/semester-filter";
import { ACTION_MODES } from "@/constants/action-modes";
import { THURSDAY_MODAL_PARAMS, USER_MODAL_PARAMS, type ThursdayModalParam } from "@/constants/modal-params";
import { isAdminRole } from "@/constants/roles";
import { auth } from "@/authentication";

interface ThursdaysProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const thursdayModalParams = new Set<string>([
  ...Object.values(THURSDAY_MODAL_PARAMS),
  USER_MODAL_PARAMS.profile,
]);

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getThursdaysModalHref(
  filters: { [key: string]: string | string[] | undefined },
  modalParam: ThursdayModalParam | typeof USER_MODAL_PARAMS.profile,
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
    <>
      <span className="ui-label m-0 mb-2 block pl-1">
        {thursdays.length} Thursday Production{thursdays.length === 1 ? "" : "s"}
      </span>
      <div className="grid">
        {thursdays.map((thursday: any, index: number) => (
          <ThursdayCard key={thursday.id} thursday={thursday} isAdmin={isAdmin} checker={index % 2 === 0} isFirst={index === 0} isLast={index === thursdays.length - 1} />
        ))}
      </div>
    </>
  );
}

export default async function Thursdays({ searchParams }: ThursdaysProps) {
  const filters = await searchParams;
  // getSemesterOptions and auth are independent - run them in parallel, not one after another.
  const [semestersResult, session] = await Promise.all([getSemesterOptions(), auth()]);
  const semesters = semestersResult.success ? semestersResult.data : [];
  const isAdmin = isAdminRole(session?.user?.role);

  const selectedSemesterId = getSelectedSemesterId(filters, semesters);
  const addThursday = getSingleParam(filters[THURSDAY_MODAL_PARAMS.add]);
  const thursdayId = getSingleParam(filters[THURSDAY_MODAL_PARAMS.view]);
  const profileUserId = getSingleParam(filters[USER_MODAL_PARAMS.profile]);
  const editThursdayId = getSingleParam(filters[THURSDAY_MODAL_PARAMS.edit]);
  const deleteThursdayId = getSingleParam(filters[THURSDAY_MODAL_PARAMS.delete]);
  const thursdaysReturnHref = getThursdaysReturnHref(filters);

  return (
    <>
      <PageTitle
        title="Thursdays"
        filterControl={<SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} variant="title" />}
      />
      <ActionModeSurface>
        <NavContent
          filterContent={
            <div className="[&_.input-affix-wrapper]:bg-[var(--action-input-bg)]!">
              <FilterInput query={"thursdays"} placeholder="Search" />
            </div>
          }
          filterLabel="Search Thursdays"
          manageContent={
            isAdmin ? (
              <>
                <Button href={getThursdaysModalHref(filters, THURSDAY_MODAL_PARAMS.add, "1")} variant="action" tone="success" icon="add/add.svg">Add Thursday</Button>
                <ActionModeButton type="button" variant="action" mode={ACTION_MODES.editThursdays}>
                  Edit Thursdays
                </ActionModeButton>
                <ActionModeButton type="button" variant="action" mode={ACTION_MODES.deleteThursdays}>
                  Delete Thursdays
                </ActionModeButton>
              </>
            ) : null
          }
          manageLabel="Manage Thursdays"
          mobileManageContent={
            isAdmin ? (
              <>
                <Button href={getThursdaysModalHref(filters, THURSDAY_MODAL_PARAMS.add, "1")} variant="action" tone="success" icon="add/add.svg">Add</Button>
                <ActionModeButton type="button" variant="action" mode={ACTION_MODES.editThursdays}>
                  Edit
                </ActionModeButton>
                <ActionModeButton type="button" variant="action" mode={ACTION_MODES.deleteThursdays}>
                  Del
                </ActionModeButton>
              </>
            ) : null
          }
        />
        {/* bg here, not on individual cards' own container - see users/page.tsx for the full explanation. */}
        <div className="bg-[var(--app-thursdays-surface)] px-6 pt-9! pb-9! min-[769px]:rounded-tr-[0.5rem] min-[1025px]:pr-6 min-[1025px]:pl-9">
          <Suspense
            fallback={<div style={{ opacity: 0.5, padding: "1rem", background: "transparent" }}>Loading days...</div>}
          >
            <ThursdaysList filters={filters} isAdmin={isAdmin} semesters={semesters} />
          </Suspense>
        </div>
        {profileUserId && (
          <PersonProfileModal key={profileUserId} profileUserId={profileUserId} />
        )}
        {addThursday && !thursdayId && !profileUserId && !editThursdayId && !deleteThursdayId && (
          <RouteModalPopup
            key="add-thursday"
            paramName={THURSDAY_MODAL_PARAMS.add}
            title="Add Thursday"
            dialogClassName={thursdayDetailDialogClassName}
          >
            <Suspense fallback={<ModalContentFallback />}>
              <AddThursdayFormContent />
            </Suspense>
          </RouteModalPopup>
        )}
        {editThursdayId && !addThursday && !thursdayId && !profileUserId && !deleteThursdayId && (
          <RouteModalPopup
            key={editThursdayId}
            paramName={THURSDAY_MODAL_PARAMS.edit}
            title="Edit Thursday"
            dialogClassName={thursdayDetailDialogClassName}
          >
            <Suspense fallback={<ModalContentFallback />}>
              <EditThursdayFormContent thursdayId={editThursdayId} />
            </Suspense>
          </RouteModalPopup>
        )}
        {deleteThursdayId && !addThursday && !thursdayId && !profileUserId && !editThursdayId && (
          <RouteModalPopup
            key={deleteThursdayId}
            paramName={THURSDAY_MODAL_PARAMS.delete}
            title="Delete Thursday"
            dialogClassName={confirmDeleteDialogClassName}
          >
            <Suspense fallback={<ModalContentFallback />}>
              <ThursdayDeleteConfirmContent
                thursdayId={deleteThursdayId}
                returnHref={thursdaysReturnHref}
              />
            </Suspense>
          </RouteModalPopup>
        )}
        {thursdayId && !addThursday && !editThursdayId && !deleteThursdayId && (
          <RouteModalPopup
            key={thursdayId}
            paramName={THURSDAY_MODAL_PARAMS.view}
            title="Thursday"
            dialogClassName={thursdayDetailDialogClassName}
          >
            <Suspense fallback={<ModalContentFallback />}>
              <ThursdayDetailContent thursdayId={thursdayId} />
            </Suspense>
          </RouteModalPopup>
        )}
      </ActionModeSurface>
    </>
  );
}
