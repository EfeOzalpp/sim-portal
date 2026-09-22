// React & Next.js
import { Suspense } from "react";

// Actions
import { getFilteredThursdays } from "@/actions/thursdays";
import { getSemesterOptions } from "@/actions/semesters";

// Components
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import PageTitle from "@/components/layout/PageTitle";
import { FilterInput } from "@/components/primitives/Filters";
import PrintLink from "@/components/primitives/PrintLink";
import SemesterFilterSelect from "@/components/domain/filters/SemesterFilterSelect";
import { ActionModeSurface } from "@/components/layout/ActionMode";
import RouteModalPopup from "@/components/modal/RouteModalPopup";
import ModalContentFallback from "@/components/modal/ModalContentFallback";
import ThursdayDetailContent, { ThursdayDetailTitle, thursdayDetailDialogClassName } from "@/components/domain/productions/ThursdayDetailContent";
import PersonProfileModal from "@/components/domain/profile/PersonProfileModal";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";
import { MaskIcon } from "@/theme/MaskIcon";

// Composition
import ThursdayCard from "@/app/thursdays/composition/ThursdayCard";
import AddThursdayFormContent from "@/app/thursdays/add/AddThursdayFormContent";
import EditThursdayFormContent from "@/app/thursdays/[id]/edit/EditThursdayFormContent";
import ThursdayDeleteConfirmContent from "@/app/thursdays/composition/ThursdayDeleteConfirmContent";
import { thursdayFormDialogClassName } from "@/app/thursdays/composition/ThursdayForm";
import EditThursdaysButton from "@/app/thursdays/composition/EditThursdaysButton";
import DeleteThursdaysButton from "@/app/thursdays/composition/DeleteThursdaysButton";
import ThursdayViewTabs from "@/app/thursdays/composition/ThursdayViewTabs";
import { SelectedThursdaysProvider } from "@/app/thursdays/composition/SelectedThursdaysProvider";
import SelectedThursdaysCountLabel from "@/app/thursdays/composition/SelectedThursdaysCountLabel";

// Helpers
import { getSelectedSemesterId } from "@/components/domain/filters/semester-filter";
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
    <div className="grid gap-2">
      {thursdays.map((thursday: any, index: number) => (
        <ThursdayCard key={thursday.id} thursday={thursday} isAdmin={isAdmin} isFirst={index === 0} isLast={index === thursdays.length - 1} />
      ))}
    </div>
  );
}

async function ThursdaySelectionTabs({ filters }: { filters: any }) {
  const thursdaysResult = await getFilteredThursdays(filters);
  const thursdayIds = thursdaysResult.success ? thursdaysResult.data.map((thursday: any) => thursday.id) : [];

  return <ThursdayViewTabs thursdayIds={thursdayIds} />;
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
        contentClassName="min-[769px]:ml-[calc(var(--nav-rail-collapsed-width)_+_12rem)]"
        filterControl={<SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} variant="title" />}
      />
      <ActionModeSurface>
        <SelectedThursdaysProvider>
        <div data-full-bleed-content className="flex h-full min-h-0 flex-col bg-[var(--page-bg)] min-[769px]:ml-[var(--nav-rail-collapsed-width)] min-[769px]:mr-2 min-[769px]:rounded-tl-[0.5rem] min-[769px]:rounded-tr-[0.5rem] min-[769px]:border min-[769px]:border-b-0 min-[769px]:border-solid min-[769px]:border-[var(--main-border)] min-[769px]:shadow-[var(--content-shadow)] print:bg-transparent">
          <div className="flex flex-none flex-wrap items-center justify-between gap-6 overflow-hidden px-6 pt-6 pb-3 [scrollbar-gutter:stable] print:hidden">
            <div className="flex items-center gap-2">
              <div className="w-50 [--input-bg:var(--page-input-bg)] [--input-border:var(--page-input-border)] [--input-bg-hover:var(--page-input-bg-hover)] [--input-border-hover:var(--page-input-border-hover)] [--input-placeholder:var(--page-input-text)] [--input-icon:var(--page-input-search)]">
                <FilterInput query="thursdays" placeholder="Search" />
              </div>
              {isAdmin && (
                <Button href={getThursdaysModalHref(filters, THURSDAY_MODAL_PARAMS.add, "1")} variant="action">
                  <MaskIcon icon="add/add.svg" className={actionButtonIconClassName} />
                  Add thursday
                </Button>
              )}
            </div>
            <div className="flex flex-none items-center gap-2">
              <SelectedThursdaysCountLabel />
              <PrintLink label="Export selected" variant="action" />
              {isAdmin && (
                <>
                  <EditThursdaysButton />
                  <DeleteThursdaysButton />
                </>
              )}
            </div>
          </div>
          <Suspense fallback={<ThursdayViewTabs thursdayIds={[]} />}>
            <ThursdaySelectionTabs filters={filters} />
          </Suspense>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 [scrollbar-gutter:stable] print:overflow-visible print:px-0 print:pb-0">
            <Suspense
              fallback={<div style={{ opacity: 0.5, padding: "1rem", background: "transparent" }}>Loading days...</div>}
            >
              <ThursdaysList filters={filters} isAdmin={isAdmin} semesters={semesters} />
            </Suspense>
          </div>
        </div>
        </SelectedThursdaysProvider>
        {profileUserId && (
          <PersonProfileModal key={profileUserId} profileUserId={profileUserId} />
        )}
        {addThursday && !thursdayId && !profileUserId && !editThursdayId && !deleteThursdayId && (
          <RouteModalPopup
            key="add-thursday"
            paramName={THURSDAY_MODAL_PARAMS.add}
            title="Add Thursday"
            dialogClassName={thursdayFormDialogClassName}
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
            dialogClassName={thursdayFormDialogClassName}
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
            title={<ThursdayDetailTitle thursdayId={thursdayId} />}
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
