"use client";

// React & Next.js
import { useState } from "react";

// Actions
import { BasicUser, SemesterInput } from "@/actions/schemas";
import { ActionResult } from "@/actions/utilities";

// Components
import { RangePicker } from "@/components/datepicker";
import { Alert } from "@/components/alert";
import { Select } from "@/components/select";
import { Button } from "@/components/button";

// Composition
import {
  transformSemesterFromAPI,
  transformSemesterPayload,
} from "@/app/semester/composition/semester.transformers";

// Helpers
import { useForm, Controller } from "react-hook-form";
import { handleFormAction } from "@/helpers";
import { formatSemesterCode, getCurrentSemesterCode, normalizeSemesterCode } from "@/components/domain/filters/semester-filter";

// Sentinel for the semester filter's own "show everyone" option - distinct
// from ALL_SEMESTERS_VALUE (the page-level filter's sentinel), since this is
// a separate, local-only filter with no URL state of its own.
const ALL_SEMESTERS_FILTER_VALUE = "all";

function getSemesterNameOptions(currentValue?: string) {
  const options = Array.from({ length: 100 }, (_, year) => {
    const shortYear = String(year).padStart(2, "0");
    return [
      { value: `SP${shortYear}`, label: `SP${shortYear}` },
      { value: `FA${shortYear}`, label: `FA${shortYear}` },
    ];
  }).flat();

  if (currentValue && !options.some((option) => option.value === currentValue)) {
    return [{ value: currentValue, label: currentValue }, ...options];
  }

  return options;
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
    formState: { isSubmitting },
  } = useForm<SemesterFormValues>({
    defaultValues: initialValues as any,
  });

  const [error, setError] = useState<string | null>(null);
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

  const handleFormSubmit = async (data: SemesterFormValues) => {
    const payload = transformSemesterPayload(data);
    await handleFormAction(
      () => onSubmit(payload),
      setError,
      "An error occurred while saving the semester.",
    );
  };

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
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid w-full grid-cols-[max-content_minmax(0,1fr)] gap-4 max-[600px]:grid-cols-1">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="ui-label m-0 block">Semester Name *</span>
              <Controller
                control={control}
                name="name"
                rules={{ required: "Semester name is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <Select
                      inModal
                      {...field}
                      value={field.value || undefined}
                      searchable
                      placeholder="e.g. FA26"
                      status={fieldState.error ? "error" : ""}
                      options={getSemesterNameOptions(field.value)}
                    />
                    {fieldState.error && (
                      <span className="ui-note">{fieldState.error.message}</span>
                    )}
                  </>
                )}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <span className="ui-label m-0 block">Select Date Range *</span>
              <Controller
                control={control}
                name="dates"
                rules={{ required: "Date range is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <RangePicker
                      {...field}
                      style={{ width: "100%" }}
                      status={fieldState.error ? "error" : ""}
                    />
                    {fieldState.error && (
                      <span className="ui-note">{fieldState.error.message}</span>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          <div>
            <Controller
              control={control}
              name="users"
              render={({ field }) => {
                const selectedIds = new Set<string>(field.value ?? []);
                // A person already selected stays visible/selectable
                // regardless of the semester filter - it only narrows who
                // else shows up.
                const filteredSelectableUsers = selectableUsers.filter(
                  (u) =>
                    selectedIds.has(u.id) ||
                    !semesterFilterId ||
                    (u.semesterIds ?? []).includes(semesterFilterId),
                );

                return (
                  <>
                    <div className="mb-2 flex items-end justify-between gap-4 max-[600px]:flex-col max-[600px]:items-stretch">
                      <span className="ui-label m-0 block">Select Users</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {semesters.length > 0 && (
                          <Select
                            inModal
                            className="w-[5.5rem]!"
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
                          tone="danger"
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
                      placeholder="Search and select users..."
                      options={filteredSelectableUsers.map((u) => ({ value: u.id, label: u.name ?? "Unnamed User" }))}
                    />
                  </>
                );
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-start border-t border-t-[var(--app-border)] pt-4">
        <Button type="submit" disabled={isSubmitting} tone="success">
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
