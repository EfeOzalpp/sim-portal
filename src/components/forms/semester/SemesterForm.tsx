"use client";

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  RangePicker,
  Select,
  Button,
  Alert,
} from "@/components/primitives/AntD";
import {
  transformSemesterFromAPI,
  transformSemesterPayload,
} from "@/components/forms/semester/semester.transformers";
import { handleFormAction } from "@/helpers";
import { BasicUser, SemesterInput } from "@/components/forms/schemas";
import { ActionResult } from "@/actions/utilities";
import styles from "@/components/forms/semester/SemesterForm.module.css";

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        {error && (
          <Alert
            description={error}
            type="error"
            showIcon
            closable
          />
        )}
        <div className={styles.formStack}>
          <div className={styles.formGrid}>
            <div className={styles.fieldStack}>
              <span className={`${styles.fieldLabel} ui-label`}>Semester Name</span>
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

            <div className={styles.fieldStack}>
              <span className={`${styles.fieldLabel} ui-label`}>Select Date Range</span>
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
                  <div className={styles.sectionHeader}>
                    <span className={`${styles.sectionLabel} ui-label`}>Select Users</span>
                    <div className={styles.inlineActions}>
                      <button
                        type="button"
                        onClick={() => field.onChange(selectableUsers.map((u) => u.id))}
                        className={styles.textButton}
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange([])}
                        className={`${styles.textButton} ${styles.textButtonDanger}`}
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
                      <div className={styles.optionRow}>
                        <span className={`${styles.optionBadge} ${isSelected ? styles.optionBadgeSelected : ""}`}>
                          {isSelected ? "Selected" : "Unselected"}
                        </span>
                        <span className={styles.optionName}>{option.label}</span>
                      </div>
                    );
                  }}
                />
                </>
              )}
            />
          </div>
        </div>

        <div className={styles.submitRow}>
        <Button type="submit" disabled={isSubmitting} className="accept-button">
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
