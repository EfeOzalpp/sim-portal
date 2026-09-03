"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { RangePicker } from "@/components/datepicker";
import { Alert } from "@/components/alert";
import { Select } from "@/components/select";
import { Button } from "@/components/button";
import {
  transformSemesterFromAPI,
  transformSemesterPayload,
} from "@/app/semester/composition/semester.transformers";
import { handleFormAction } from "@/helpers";
import { BasicUser, SemesterInput } from "@/actions/schemas";
import { ActionResult } from "@/actions/utilities";

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
}

export default function SemesterForm({
  onSubmit,
  semester,
  usersFromCurrentSemester,
  users,
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
        <div className="flex flex-1 flex-col gap-[var(--gap-md)]">
          <div className="grid w-full grid-cols-[max-content_minmax(0,1fr)] gap-4 max-[600px]:grid-cols-1">
            <div className="flex min-w-0 flex-col gap-[var(--gap-sm)]">
              <span className="ui-label m-0 block">Semester Name</span>
              <Controller
                control={control}
                name="name"
                rules={{ required: "Semester name is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <Select
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

            <div className="flex min-w-0 flex-col gap-[var(--gap-sm)]">
              <span className="ui-label m-0 block">Select Date Range</span>
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
              render={({ field }) => (
                <>
                  <div className="mb-[var(--gap-sm)] flex items-end justify-between gap-[var(--gap-md)] max-[600px]:flex-col max-[600px]:items-stretch">
                    <span className="ui-label m-0 block">Select Users</span>
                    <div className="flex items-center gap-[var(--gap-sm)]">
                      <Button
                        type="button"
                        onClick={() => field.onChange(selectableUsers.map((u) => u.id))}
                      >
                        Select all
                      </Button>
                      <Button
                        type="button"
                        tone="danger"
                        onClick={() => field.onChange([])}
                      >
                        Unselect all
                      </Button>
                    </div>
                  </div>
                  <Select
                    {...field}
                    mode="multiple"
                    searchable
                    maxTagCount={12}
                    placeholder="Search and select users..."
                    options={selectableUsers.map((u) => ({ value: u.id, label: u.name ?? "Unnamed User" }))}
                  />
                </>
              )}
            />
          </div>
        </div>

        <div className="mt-[var(--spacing-md)] flex justify-start border-t-[length:var(--app-border-width)] border-solid border-[var(--app-border)] pt-[var(--spacing-md)]">
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
