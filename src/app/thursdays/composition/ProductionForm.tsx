"use client";

// React & Next.js
import { useState } from "react";

// Actions
import { BasicUser } from "@/actions/schemas";

// Components
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { FieldError, fieldLabelRowClassName } from "@/components/field-error";

// Composition
import PresentationsField from "@/app/thursdays/composition/PresentationsField";
import {
  fieldLabelClassName,
  fieldStackClassName,
} from "@/app/thursdays/composition/thursdayFormClasses";

// Helpers
import { Controller, useFormState } from "react-hook-form";
import { isStaffRole } from "@/constants/roles";
import { formatSemesterCode, getCurrentSemesterCode, normalizeSemesterCode } from "@/components/domain/filters/semester-filter";

const LOCATIONS = [
  { label: "Pozen Center", value: "Pozen Center" },
  { label: "Studio A", value: "Studio A" },
  { label: "Studio B", value: "Studio B" },
  { label: "Main Hall", value: "Main Hall" },
];

// Sentinel for the semester filter's own "show everyone" option - distinct
// from ALL_SEMESTERS_VALUE (the page-level filter's sentinel), since this is
// a separate, local-only filter with no URL state of its own.
const ALL_SEMESTERS_FILTER_VALUE = "all";

interface ProductionFormProps {
  productionIndex: number;
  control: any;
  users: BasicUser[];
  semesters?: Array<{ id: string; name: string }>;
}

export default function ProductionForm({
  productionIndex,
  control,
  users,
  semesters = [],
}: ProductionFormProps) {
  const producerUsers = users.filter((u) => !isStaffRole((u as any).role));

  // Narrows which people show up as Producers & Faculty candidates to just
  // this semester's members - defaults to whichever semester matches today
  // (same rule as the page-level filters), same as usual.
  const currentSemesterCode = getCurrentSemesterCode();
  const currentSemester = semesters.find(
    (semester) => normalizeSemesterCode(semester.name) === currentSemesterCode,
  );
  const [semesterFilterId, setSemesterFilterId] = useState<string | null>(
    currentSemester?.id ?? semesters[0]?.id ?? null,
  );

  // Errors shouldn't appear the instant the modal opens (the mount-time
  // trigger() that keeps Save's isValid check accurate validates every
  // field right away) - only once the field's been touched, or a submit's
  // actually been attempted.
  const { isSubmitted } = useFormState({ control });

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 min-[601px]:grid-cols-2">
        <div className={fieldStackClassName}>
          <Controller
            control={control}
            name={`productions.${productionIndex}.name`}
            rules={{ required: "Production name is required" }}
            render={({ field, fieldState }) => {
              const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
              return (
                <>
                  <div className={fieldLabelRowClassName}>
                    <span className={fieldLabelClassName}>Name *</span>
                    {showError && <FieldError>{fieldState.error!.message}</FieldError>}
                  </div>
                  <Input
                    {...field}
                    placeholder="Enter production name"
                    status={showError ? "error" : ""}
                  />
                </>
              );
            }}
          />
        </div>

        <div className={fieldStackClassName}>
          <Controller
            control={control}
            name={`productions.${productionIndex}.location`}
            rules={{ required: "Location is required" }}
            render={({ field, fieldState }) => {
              const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
              return (
                <>
                  <div className={fieldLabelRowClassName}>
                    <span className={fieldLabelClassName}>Location *</span>
                    {showError && <FieldError>{fieldState.error!.message}</FieldError>}
                  </div>
                  <Select
                    inModal
                    {...field}
                    placeholder="Select location"
                    options={LOCATIONS}
                    status={showError ? "error" : ""}
                  />
                </>
              );
            }}
          />
        </div>
      </div>

      <div>
        <Controller
          control={control}
          name={`productions.${productionIndex}.producers`}
          render={({ field }) => {
            const selectedIds = new Set<string>(field.value ?? []);
            // Only scopes "Select all" - the dropdown itself always lists
            // every producerUser (below), so unselecting someone outside the
            // reference semester flips their row to "Unselected" instead of
            // yanking it out of the list, which read as broken (looked like
            // unselecting = removed).
            const filteredProducerUsers = producerUsers.filter(
              (u) =>
                selectedIds.has(u.id) ||
                !semesterFilterId ||
                (u.semesterIds ?? []).includes(semesterFilterId),
            );

            return (
              <Select
                inModal
                mode="filterableMultiselect"
                label="Producers & Faculty"
                {...field}
                searchable
                maxTagCount={12}
                placeholder="Search and select users..."
                selectAllValues={filteredProducerUsers.map((u) => u.id)}
                headerFilter={
                  semesters.length > 0 && (
                    <Select
                      inModal
                      className="w-[5.5rem]! min-h-9! py-1.5!"
                      value={semesterFilterId ?? ALL_SEMESTERS_FILTER_VALUE}
                      onChange={(value) =>
                        setSemesterFilterId(value && value !== ALL_SEMESTERS_FILTER_VALUE ? value : null)
                      }
                      placeholder="Semester"
                      options={[
                        { value: ALL_SEMESTERS_FILTER_VALUE, label: "All" },
                        ...semesters.map((semester) => ({
                          value: semester.id,
                          label: formatSemesterCode(semester.name),
                        })),
                      ]}
                    />
                  )
                }
                options={[
                  ...producerUsers,
                  ...users.filter(
                    (u) => selectedIds.has(u.id) && isStaffRole((u as any).role)
                  ),
                ]
                  .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
                  .map((u) => ({ value: u.id, label: u.name ?? "Unnamed User" }))}
              />
            );
          }}
        />
      </div>

      <PresentationsField
        productionIndex={productionIndex}
        control={control}
        users={users}
        semesters={semesters}
      />
    </div>
  );
}
