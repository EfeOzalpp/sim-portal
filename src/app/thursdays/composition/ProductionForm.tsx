"use client";

// React & Next.js
import { useState } from "react";

// Actions
import { BasicUser } from "@/actions/schemas";

// Components
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Button } from "@/components/button";
import { FieldError } from "@/components/field-error";

// Composition
import PresentationsField from "@/app/thursdays/composition/PresentationsField";
import {
  fieldStackClassName,
  inlineActionsClassName,
  sectionHeaderClassName,
} from "@/app/thursdays/composition/thursdayFormClasses";

// Helpers
import { Controller } from "react-hook-form";
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

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 min-[601px]:grid-cols-2">
        <div className={fieldStackClassName}>
          <span className="ui-label m-0 block">Name *</span>
          <Controller
            control={control}
            name={`productions.${productionIndex}.name`}
            rules={{ required: "Production name is required" }}
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  placeholder="Enter production name"
                  status={fieldState.error ? "error" : ""}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </>
            )}
          />
        </div>

        <div className={fieldStackClassName}>
          <span className="ui-label m-0 block">Location *</span>
          <Controller
            control={control}
            name={`productions.${productionIndex}.location`}
            rules={{ required: "Location is required" }}
            render={({ field, fieldState }) => (
              <>
                <Select
                  inModal
                  {...field}
                  placeholder="Select location"
                  options={LOCATIONS}
                  status={fieldState.error ? "error" : ""}
                />
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </>
            )}
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
              <>
                <div className={sectionHeaderClassName}>
                  <span className="ui-label m-0 block">Producers & Faculty</span>
                  <div className={inlineActionsClassName}>
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
                          ...semesters.map((semester) => ({
                            value: semester.id,
                            label: formatSemesterCode(semester.name),
                          })),
                        ]}
                      />
                    )}
                    <Button
                      type="button"
                      className="whitespace-nowrap"
                      onClick={() => field.onChange(filteredProducerUsers.map((u) => u.id))}
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
                  options={[
                    ...producerUsers,
                    ...users.filter(
                      (u) => selectedIds.has(u.id) && isStaffRole((u as any).role)
                    ),
                  ]
                    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
                    .map((u) => ({ value: u.id, label: u.name ?? "Unnamed User" }))}
                />
              </>
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
