"use client";

// React & Next.js
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

// Actions
import { BasicUser, SemesterInput } from "@/actions/schemas";
import { ActionResult } from "@/actions/utilities";

// Components
import { RangePicker } from "@/components/datepicker";
import { Alert } from "@/components/alert";
import { Select } from "@/components/select";
import { selectItemVariants } from "@/components/select/styles";
import { Button } from "@/components/button";
import Popover from "@/components/popover";
import { useModalCloseGuard } from "@/components/modal/CloseGuard";
import { FieldError } from "@/components/field-error";
import { useToast } from "@/components/toast";
import { MaskIcon } from "@/theme/MaskIcon";

// Helpers
import { ROLES } from "@/constants/roles";

// Composition
import {
  transformSemesterFromAPI,
  transformSemesterPayload,
} from "@/app/semester/composition/semester.transformers";

// Helpers
import dayjs from "dayjs";
import { useForm, useWatch, Controller } from "react-hook-form";
import { handleFormAction } from "@/helpers";
import { formatSemesterCode, getCurrentSemesterCode, getDefaultSemesterDateRange, getSemesterYear, normalizeSemesterCode, semesterOrdinal } from "@/components/domain/filters/semester-filter";

// Sentinel for the semester filter's own "show everyone" option - distinct
// from ALL_SEMESTERS_VALUE (the page-level filter's sentinel), since this is
// a separate, local-only filter with no URL state of its own.
const ALL_SEMESTERS_FILTER_VALUE = "all";

// takenCodes excludes semesters that already exist (adding a new one
// shouldn't offer names that would just collide) - currentValue is always
// kept selectable regardless, since it's either the field's own existing
// value (editing) or a value the field already holds for some other reason,
// and either way removing it out from under the Select would be confusing.
function getSemesterNameOptions(currentValue?: string, takenCodes: Set<string> = new Set()) {
  const options = Array.from({ length: 100 }, (_, year) => {
    const shortYear = String(year).padStart(2, "0");
    return [
      { value: `SP${shortYear}`, label: `SP${shortYear}` },
      { value: `FA${shortYear}`, label: `FA${shortYear}` },
    ];
  })
    .flat()
    .filter((option) => option.value === currentValue || !takenCodes.has(option.value));

  if (currentValue && !options.some((option) => option.value === currentValue)) {
    return [{ value: currentValue, label: currentValue }, ...options];
  }

  return options;
}

// The current semester's own code is usually already taken (it already
// exists), so getSemesterNameOptions above has already filtered it out - scrolling
// to it directly would find nothing and silently no-op. This finds whichever
// still-listed option is numerically closest to it instead.
function getClosestOptionValue(options: { value: string; label: string }[], targetCode: string) {
  if (options.some((option) => option.value === targetCode)) return targetCode;

  const targetOrdinal = semesterOrdinal(targetCode);
  let closestValue: string | null = null;
  let closestDistance = Infinity;

  for (const option of options) {
    const code = normalizeSemesterCode(option.value);
    if (!code) continue;

    const distance = Math.abs(semesterOrdinal(code) - targetOrdinal);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestValue = option.value;
    }
  }

  return closestValue ?? targetCode;
}

const roleFilterOptions = [
  { value: ROLES.student, label: "Student" },
  { value: ROLES.staff, label: "Staff" },
  { value: ROLES.admin, label: "Admin" },
];

const roleFilterTriggerClassName =
  "m-0 inline-grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-solid border-[var(--input-border)] bg-[var(--action-item-bg)] p-0 text-[var(--input-icon)] hover:border-[var(--input-border-hover)] hover:bg-[var(--input-bg-hover)] hover:text-[var(--input-text)] hover:shadow-[var(--input-hover-shadow)]";

const roleFilterOptionButtonClassName = "w-full border-0 bg-transparent text-left";

function EnrollmentRoleFilter({ value, onChange }: { value: string | null; onChange: (next: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const isAllSelected = value === null;

  function selectAll() {
    onChange(null);
    setOpen(false);
  }

  function selectRole(role: string) {
    onChange(role);
    setOpen(false);
  }

  return (
    <Popover
      align="start"
      open={open}
      onOpenChange={setOpen}
      contentClassName="z-[320]!"
      trigger={
        <button type="button" className={roleFilterTriggerClassName} aria-label="Filter by role">
          <MaskIcon icon="filter/filter.svg" className="h-4 w-4 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" />
        </button>
      }
    >
      <div className="flex min-w-[9rem] flex-col gap-0.5">
        <span className="ui-label block px-2 pb-1">Role Filter</span>
        <div className="flex flex-col gap-0.5" role="listbox">
          <button
            type="button"
            role="option"
            aria-selected={isAllSelected}
            onClick={selectAll}
            className={clsx(selectItemVariants({ selected: isAllSelected }), roleFilterOptionButtonClassName)}
          >
            All
          </button>
          {roleFilterOptions.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectRole(option.value)}
                className={clsx(selectItemVariants({ selected: isSelected }), roleFilterOptionButtonClassName)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}

function getSelectableUsers(...userGroups: Array<BasicUser[] | undefined>) {
  const usersById = new Map<string, BasicUser>();

  for (const group of userGroups) {
    for (const user of group ?? []) {
      if (!user?.id) continue;
      usersById.set(user.id, {
        ...user,
        name: user.name || "Unnamed User",
      });
    }
  }

  return [...usersById.values()].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? ""),
  );
}

interface SemesterFormValues extends Omit<SemesterInput, "dates" | "users"> {
  dates: [any, any] | null;
  users: string[];
}

interface SemesterFormProps {
  onSubmit: (data: any) => Promise<ActionResult<any> | any>;
  semester?: any;
  usersFromCurrentSemester?: BasicUser[];
  users: BasicUser[];
  semesters?: Array<{ id: string; name: string }>;
}

export default function SemesterForm({
  onSubmit,
  semester,
  usersFromCurrentSemester,
  users,
  semesters = [],
}: SemesterFormProps) {
  const initialValues = transformSemesterFromAPI(
    semester,
    usersFromCurrentSemester,
  );

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    formState: { isSubmitting, isDirty, isValid, isSubmitted },
  } = useForm<SemesterFormValues>({
    defaultValues: initialValues as any,
    mode: "onChange",
  });

  useEffect(() => {
    trigger();
  }, [trigger]);

  // Anchors the Date Range picker's initial panel on the selected semester's
  // own year instead of wherever it opens by default - picking a range for
  // FA30 should start the calendar looking at 2030, not today.
  const nameValue = useWatch({ control, name: "name" });
  const datesValue = useWatch({ control, name: "dates" });
  const datesTargetYear = getSemesterYear(nameValue);

  // Follows the Name field, but only while Dates is still "ours" - empty,
  // or exactly what we last auto-filled. The moment it's something else
  // (hand-adjusted, or an existing semester's real Thursdays), further Name
  // changes leave it alone instead of clobbering it.
  const lastAutoDates = useRef<[string, string] | null>(null);
  const isFirstNameSync = useRef(true);
  useEffect(() => {
    if (isFirstNameSync.current) {
      isFirstNameSync.current = false;
      return;
    }

    const defaultRange = getDefaultSemesterDateRange(nameValue);
    if (!defaultRange) return;

    const currentRange: [string, string] | null =
      datesValue?.[0] && datesValue?.[1]
        ? [dayjs(datesValue[0]).format("YYYY-MM-DD"), dayjs(datesValue[1]).format("YYYY-MM-DD")]
        : null;

    const stillOurs =
      !currentRange ||
      (lastAutoDates.current !== null &&
        currentRange[0] === lastAutoDates.current[0] &&
        currentRange[1] === lastAutoDates.current[1]);
    if (!stillOurs) return;

    setValue("dates", [dayjs(defaultRange[0]), dayjs(defaultRange[1])] as any, {
      shouldDirty: true,
      shouldValidate: true,
    });
    lastAutoDates.current = defaultRange;
    // datesValue deliberately excluded - this only reacts to Name changing,
    // reading whatever Dates currently holds at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, setValue]);

  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  // Excludes the semester currently being edited (if any) - its own name
  // shouldn't be flagged as "taken" by itself.
  const takenSemesterCodes = new Set(
    semesters
      .filter((s) => s.id !== semester?.id)
      .map((s) => normalizeSemesterCode(s.name))
      .filter((code): code is string => !!code),
  );
  const selectableUsers = getSelectableUsers(
    users,
    semester?.users,
    usersFromCurrentSemester,
  );

  // Narrows Select Users candidates to members of a reference semester -
  // defaults to whichever semester matches today, same as usual.
  const currentSemesterCode = getCurrentSemesterCode();
  const currentSemester = semesters.find(
    (s) => normalizeSemesterCode(s.name) === currentSemesterCode,
  );
  const [semesterFilterId, setSemesterFilterId] = useState<string | null>(
    currentSemester?.id ?? semesters[0]?.id ?? null,
  );
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  const handleFormSubmit = async (data: SemesterFormValues) => {
    const payload = transformSemesterPayload(data);
    await handleFormAction(
      () => onSubmit(payload),
      setError,
      "An error occurred while saving the semester.",
      () => toast.success(semester ? "Changes saved" : "Semester created"),
    );
  };

  useModalCloseGuard(isDirty && !isSubmitting, isValid, () => handleSubmit(handleFormSubmit)());

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col">
        {error && (
          <Alert
            description={error}
            tone="danger"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}
        <div className="flex flex-1 flex-col gap-8 pt-4">
          {!semester && (
            <p className="ui-note m-0 -mb-4 flex items-center gap-1.5">
              <MaskIcon
                icon="info/info.svg"
                className="h-[1.375rem] w-[1.375rem] shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
              />
              <span>Tip: select a name first and the date will auto-fill.</span>
            </p>
          )}

          <div className="grid w-full grid-cols-[max-content_minmax(0,1fr)] gap-4 max-[600px]:grid-cols-1">
            <div className="flex w-40 flex-col gap-2 max-[600px]:w-full">
              <span className="ui-label m-0 block pl-1">Name *</span>
              <Controller
                control={control}
                name="name"
                rules={{ required: "Semester name is required" }}
                render={({ field, fieldState }) => {
                  const nameOptions = getSemesterNameOptions(field.value, takenSemesterCodes);
                  const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
                  return (
                    <>
                      <Select
                        inModal
                        {...field}
                        value={field.value || undefined}
                        searchable
                        placeholder="E.g. SP24"
                        status={showError ? "error" : ""}
                        options={nameOptions}
                        scrollToValueOnOpen={getClosestOptionValue(nameOptions, getCurrentSemesterCode())}
                      />
                      {showError && (
                        <FieldError>{fieldState.error!.message}</FieldError>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <span className="ui-label m-0 block pl-1">Date Range *</span>
              <Controller
                control={control}
                name="dates"
                rules={{
                  validate: (value) => (value?.[0] && value?.[1] ? true : "Date range is required"),
                }}
                render={({ field, fieldState }) => {
                  const hasRealDates = Boolean(field.value?.[0] && field.value?.[1]);
                  const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);

                  return (
                    <>
                      <RangePicker
                        {...field}
                        key={!hasRealDates && datesTargetYear ? datesTargetYear : "fixed"}
                        defaultPickerValue={
                          !hasRealDates && datesTargetYear
                            ? [dayjs().year(datesTargetYear), dayjs().year(datesTargetYear)]
                            : undefined
                        }
                        style={{ width: "100%" }}
                        status={showError ? "error" : ""}
                      />
                      {showError && (
                        <FieldError>{fieldState.error!.message}</FieldError>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>

          <div>
            <Controller
              control={control}
              name="users"
              render={({ field }) => {
                const selectedIds = new Set<string>(field.value ?? []);
                // Only scopes "Select all" - the dropdown itself always
                // lists every selectableUser (below), so unselecting someone
                // outside the reference semester flips their row to
                // "Unselected" instead of yanking it out of the list, which
                // read as broken (looked like unselecting = removed).
                const filteredSelectableUsers = selectableUsers.filter(
                  (u) =>
                    selectedIds.has(u.id) ||
                    !semesterFilterId ||
                    (u.semesterIds ?? []).includes(semesterFilterId),
                );
                // Unlike the semester filter above, this one hides already-selected people too when they fall outside the current role.
                const roleFilteredSelectableUsers = selectableUsers.filter(
                  (u) => roleFilter === null || u.role === roleFilter,
                );

                return (
                  <>
                    <div className="mb-3 flex items-end justify-between gap-4 max-[600px]:flex-col max-[600px]:items-stretch">
                      <span className="ui-label m-0 block pl-1">Enrollment</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {semesters.length > 0 && (
                          <Select
                            inModal
                            className="w-[5.5rem]! py-1.5!"
                            value={semesterFilterId ?? ALL_SEMESTERS_FILTER_VALUE}
                            onChange={(value) =>
                              setSemesterFilterId(value && value !== ALL_SEMESTERS_FILTER_VALUE ? value : null)
                            }
                            placeholder="Semester"
                            options={[
                              { value: ALL_SEMESTERS_FILTER_VALUE, label: "All" },
                              ...semesters.map((s) => ({
                                value: s.id,
                                label: formatSemesterCode(s.name),
                              })),
                            ]}
                          />
                        )}
                        <Button
                          type="button"
                          className="whitespace-nowrap"
                          onClick={() => field.onChange(filteredSelectableUsers.map((u) => u.id))}
                        >
                          Select all
                        </Button>
                        <Button
                          type="button"
                          className="whitespace-nowrap"
                          onClick={() => field.onChange([])}
                        >
                          Unselect all
                        </Button>
                      </div>
                    </div>
                    <Select
                      inModal
                      {...field}
                      mode="multiple"
                      searchable
                      maxTagCount={12}
                      placeholder="Select users"
                      options={roleFilteredSelectableUsers.map((u) => ({ value: u.id, label: u.name ?? "Unnamed User" }))}
                      filterExtra={<EnrollmentRoleFilter value={roleFilter} onChange={setRoleFilter} />}
                    />
                  </>
                );
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-start pt-4">
        <Button type="submit" disabled={isSubmitting} tone="success" fullWidth>
          {isSubmitting
            ? "Saving..."
            : semester
              ? "Save Changes"
              : "Create Semester"}
        </Button>
        </div>
    </form>
  );
}
