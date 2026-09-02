"use client";

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  RangePicker,
  Select,
  Alert,
} from "@/components/primitives/AntD";
import { Button } from "@/components/button/button-component";
import {
  transformSemesterFromAPI,
  transformSemesterPayload,
} from "@/components/forms/semester/semester.transformers";
import { handleFormAction } from "@/helpers";
import { BasicUser, SemesterInput } from "@/components/forms/schemas";
import { ActionResult } from "@/actions/utilities";
import clsx from "clsx";

const textButtonClassName =
  "inline-flex min-h-[1.875rem] cursor-pointer items-center justify-center rounded-[var(--border-sm)] border-solid px-[var(--spacing-sm)] text-[length:var(--font-size-sm)] font-[var(--font-weight-semibold)] [background:var(--button-bg,var(--app-surface))] [border-color:var(--button-border,var(--app-border))] [border-width:var(--app-border-width)] [color:var(--button-text,var(--app-text))] [font:inherit] hover:[background:var(--button-bg-hover,var(--app-subtle))] hover:[border-color:var(--button-border-hover,var(--app-border))] hover:[color:var(--button-text-hover,var(--app-text))]";

const dangerTextButtonClassName =
  "[--button-bg:#f7dddd] [--button-bg-hover:#efcccc] [--button-border:#e4baba] [--button-border-hover:#d9a8a8] [--button-text:#421717] [--button-text-hover:#421717] dark:[--button-bg:#462d2d] dark:[--button-bg-hover:#553535] dark:[--button-border:#6f4747] dark:[--button-border-hover:#805252] dark:[--button-text:#fff0f0] dark:[--button-text-hover:#fff]";

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

function getCurrentSemesterYearValue() {
  return `SP${String(new Date().getFullYear()).slice(-2)}`;
}

function getSemesterNameIndex(value?: string) {
  const match = value?.match(/^(SP|FA)(\d{2})$/i);
  if (!match) return 0;

  const termOffset = match[1].toUpperCase() === "FA" ? 1 : 0;
  return Number(match[2]) * 2 + termOffset;
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
  const semesterSelectRef = useRef<{
    scrollTo?: (arg: { index: number; align?: "top" | "bottom" | "auto" }) => void;
  } | null>(null);
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
            type="error"
            showIcon
            closable
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
                      ref={(instance) => {
                        semesterSelectRef.current = instance;
                        field.ref(instance);
                      }}
                      value={field.value || undefined}
                      showSearch
                      listHeight={400}
                      placeholder="e.g. FA26"
                      status={fieldState.error ? "error" : ""}
                      onOpenChange={(open) => {
                        if (!open) return;

                        window.setTimeout(() => {
                          semesterSelectRef.current?.scrollTo?.({
                            index: getSemesterNameIndex(field.value || getCurrentSemesterYearValue()),
                            align: "top",
                          });
                        }, 0);
                      }}
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
                      <button
                        type="button"
                        onClick={() => field.onChange(selectableUsers.map((u) => u.id))}
                        className={textButtonClassName}
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange([])}
                        className={clsx(textButtonClassName, dangerTextButtonClassName)}
                      >
                        Unselect all
                      </button>
                    </div>
                  </div>
                  <Select
                  {...field}
                  mode="multiple"
                  showSearch
                  listHeight={400}
                  maxTagCount={12}
                  maxTagPlaceholder={(omitted) => `+${omitted.length} more users`}
                  placeholder="Search and select users..."
                  style={{ width: "100%" }}
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={selectableUsers.map((u) => ({ value: u.id, label: u.name ?? "Unnamed User" }))}
                  optionRender={(option) => {
                    const isSelected = (field.value ?? []).includes(option.value as string);
                    return (
                      <div className="flex items-center gap-[var(--gap-sm)]">
                        <span
                          className="flex-none rounded-[var(--border-sm)] bg-[#f7dddd] px-[var(--spacing-sm)] py-[calc(var(--spacing-sm)/4)] font-[family-name:var(--font-family-label)] text-[length:var(--font-size-label)] leading-[var(--line-height-label)] font-[var(--font-weight-label)] text-[#421717] uppercase data-[selected=true]:bg-[#dcefe3] data-[selected=true]:text-[#1f6334] dark:bg-[#462d2d] dark:text-[#fff0f0] dark:data-[selected=true]:bg-[#294434] dark:data-[selected=true]:text-[#bfe8c9]"
                          data-selected={isSelected ? "true" : undefined}
                        >
                          {isSelected ? "Selected" : "Unselected"}
                        </span>
                        <span className="font-[var(--font-weight-semibold)]">{option.label}</span>
                      </div>
                    );
                  }}
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
