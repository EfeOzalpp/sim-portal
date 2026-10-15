// React & Next.js
import { Suspense } from "react";

// Actions
import { getFilteredThursdays } from "@/actions/thursdays";
import { getSemesterOptions } from "@/actions/semesters";

// Components
import { Button } from "@/components/button";
import { actionButtonIconClassName } from "@/components/button/styles";
import PageChrome from "@/components/layout/PageChrome/PageChrome";
import PageBar from "@/components/layout/PageBar";
import PageCard from "@/components/layout/PageCard";
import PageChromeScrollArea from "@/components/layout/PageChrome/PageChromeScrollArea";
import { FilterInput } from "@/components/primitives/Filters";
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
import ThursdayGridCard from "@/app/thursdays/composition/ThursdayGridCard";
import { ThursdayDateProvider } from "@/app/thursdays/composition/ThursdayDateIndicator";
import AddThursdayFormContent from "@/app/thursdays/add/AddThursdayFormContent";
import EditThursdayFormContent from "@/app/thursdays/[id]/edit/EditThursdayFormContent";
import ThursdayDeleteConfirmContent from "@/app/thursdays/composition/ThursdayDeleteConfirmContent";
import { thursdayFormDialogClassName } from "@/app/thursdays/composition/ThursdayForm";
import EditThursdaysButton from "@/app/thursdays/composition/EditThursdaysButton";
import DeleteThursdaysButton from "@/app/thursdays/composition/DeleteThursdaysButton";
import ThursdayViewTabs from "@/app/thursdays/composition/ThursdayViewTabs";
import { SelectedThursdaysProvider } from "@/app/thursdays/composition/SelectedThursdaysProvider";
import SelectedThursdaysCountLabel from "@/app/thursdays/composition/SelectedThursdaysCountLabel";
import styles from "@/app/thursdays/ThursdaysPage.module.css";

// Helpers
import { getSelectedSemesterId } from "@/components/domain/filters/semester-filter";
import { THURSDAY_MODAL_PARAMS, USER_MODAL_PARAMS, type ThursdayModalParam } from "@/constants/modal-params";
import { isAdminRole } from "@/constants/roles";
import { formatShortMonthDay } from "@/constants/date-format";
import { auth } from "@/authentication";
import { normalizeThursdayName } from "@/helpers";

interface ThursdaysProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type ThursdayView = "grid" | "list";

const thursdayModalParams = new Set<string>([
  ...Object.values(THURSDAY_MODAL_PARAMS),
  USER_MODAL_PARAMS.profile,
]);

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getThursdayView(value: string | string[] | undefined): ThursdayView {
  return getSingleParam(value) === "list" ? "list" : "grid";
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

async function ThursdaysView({
  thursdays,
  filters,
  isAdmin,
  semesters,
  view,
}: {
  thursdays: any[];
  filters: any;
  isAdmin: boolean;
  semesters: any[];
  view: ThursdayView;
}) {
  if (thursdays.length < 1) {
    const semesterName = semesters.find(s => s.id === filters.semesterId)?.name || filters.semesterId || "this semester";
    return <>There are no results for {semesterName}.</>;
  }

  if (view === "grid") {
    return <ThursdaysGridView thursdays={thursdays} filters={filters} isAdmin={isAdmin} />;
  }

  return <ThursdaysListView thursdays={thursdays} isAdmin={isAdmin} />;
}

async function ThursdaysPageContent({
  filters,
  isAdmin,
  semesters,
  view,
}: {
  filters: any;
  isAdmin: boolean;
  semesters: any[];
  view: ThursdayView;
}) {
  const thursdaysResult = await getFilteredThursdays(filters);
  const thursdays = thursdaysResult.success ? thursdaysResult.data : [];
  const thursdayIds = thursdays.map((thursday: any) => thursday.id);

  return (
    <>
      <div className={styles.contentControls}>
        <ThursdayViewTabs thursdayIds={thursdayIds} activeView={view} />
      </div>
      <ThursdayDateProvider>
        <ThursdaysView
          thursdays={thursdays}
          filters={filters}
          isAdmin={isAdmin}
          semesters={semesters}
          view={view}
        />
      </ThursdayDateProvider>
    </>
  );
}

function ThursdaysListView({ thursdays, isAdmin }: { thursdays: any[]; isAdmin: boolean }) {
  return (
    <div className="grid gap-2">
      {thursdays.map((thursday: any, index: number) => (
        <ThursdayCard key={thursday.id} thursday={thursday} isAdmin={isAdmin} isFirst={index === 0} isLast={index === thursdays.length - 1} />
      ))}
    </div>
  );
}

function ThursdaysGridView({ thursdays, filters, isAdmin }: { thursdays: any[]; filters: any; isAdmin: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 pb-6 min-[769px]:grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
      {thursdays.map((thursday: any) => {
        const hasOnlyPlaceholderProduction =
          thursday.productions.length === 1 &&
          thursday.productions[0].name === "Big Production" &&
          thursday.productions[0].location === "Pozen Center" &&
          thursday.productions[0].presentations.length === 0 &&
          thursday.productions[0].producers.length === 0;
        const isEmpty = thursday.productions.length === 0 || hasOnlyPlaceholderProduction;
        const presentationCount = thursday.productions.reduce((total: number, production: any) => total + production.presentations.length, 0);
        const producerIds = new Set<string>();
        const producerPreviews: { id: string; name: string | null; image?: string | null }[] = [];
        thursday.productions.forEach((production: any) => {
          production.producers.forEach((producer: any) => {
            if (producerIds.has(producer.id)) return;

            producerIds.add(producer.id);
            if (producerPreviews.length < 3) {
              producerPreviews.push({
                id: producer.id,
                name: producer.name,
                image: producer.image,
              });
            }
          });
        });

        return (
          <ThursdayGridCard
            key={thursday.id}
            id={thursday.id}
            name={normalizeThursdayName(thursday.name)}
            href={getThursdaysModalHref({ ...filters, view: "grid" }, THURSDAY_MODAL_PARAMS.view, thursday.id)}
            date={formatShortMonthDay(thursday.date) || ""}
            calendarDate={thursday.date.toISOString().slice(0, 10)}
            productionCount={isEmpty ? 0 : thursday.productions.length}
            presentationCount={presentationCount}
            producerCount={producerIds.size}
            producerPreviews={producerPreviews}
            isEmpty={isEmpty}
            isAdmin={isAdmin}
          />
        );
      })}
    </div>
  );
}

export default async function Thursdays({ searchParams }: ThursdaysProps) {
  const filters = await searchParams;
  // getSemesterOptions and auth are independent - run them in parallel, not one after another.
  const [semestersResult, session] = await Promise.all([getSemesterOptions(), auth()]);
  const semesters = semestersResult.success ? semestersResult.data : [];
  const isAdmin = isAdminRole(session?.user?.role);
  const view = getThursdayView(filters.view);

  const selectedSemesterId = getSelectedSemesterId(filters, semesters);
  const addThursday = getSingleParam(filters[THURSDAY_MODAL_PARAMS.add]);
  const thursdayId = getSingleParam(filters[THURSDAY_MODAL_PARAMS.view]);
  const profileUserId = getSingleParam(filters[USER_MODAL_PARAMS.profile]);
  const editThursdayId = getSingleParam(filters[THURSDAY_MODAL_PARAMS.edit]);
  const deleteThursdayId = getSingleParam(filters[THURSDAY_MODAL_PARAMS.delete]);
  const thursdaysReturnHref = getThursdaysReturnHref(filters);

  return (
    <>
      <ActionModeSurface>
        <SelectedThursdaysProvider>
        <PageChrome
          title="Thursdays"
          scope={<SemesterFilterSelect semesters={semesters} defaultValue={selectedSemesterId} variant="title" />}
          search={<FilterInput variant="page" query="thursdays" placeholder="Search" />}
          actions={isAdmin ? (
            <>
              <Button surface="page" href={getThursdaysModalHref(filters, THURSDAY_MODAL_PARAMS.add, "1")} variant="action" tone="cta">
                <MaskIcon icon="add/add.svg" className={actionButtonIconClassName} />
                New thursday
              </Button>
              <EditThursdaysButton />
              <DeleteThursdaysButton />
            </>
          ) : undefined}
          status={<SelectedThursdaysCountLabel />}
          printLabel="PDF Selected"
          csvLabel="CSV Selected"
          utilities={[
            { label: "PDF All", icon: "download/download.svg" },
            { label: "CSV All", icon: "download/download.svg" },
          ]}
        />
        <PageCard data-full-bleed-content className="flex h-full min-h-0 flex-col">
          <PageBar />
          <PageChromeScrollArea data-page-surface className={`${styles.scrollArea} min-h-0 flex-1 overflow-y-auto bg-[var(--page-bg)] px-6 pb-6 print:overflow-visible print:bg-transparent print:px-0 print:pb-0`}>
            <Suspense
              fallback={<div style={{ opacity: 0.5, padding: "1rem", background: "transparent" }}>Loading days...</div>}
            >
              <ThursdaysPageContent filters={filters} isAdmin={isAdmin} semesters={semesters} view={view} />
            </Suspense>
          </PageChromeScrollArea>
        </PageCard>
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
