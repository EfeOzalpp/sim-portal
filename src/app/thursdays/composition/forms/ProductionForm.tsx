"use client";

// React & Next.js
import { useState } from "react";

// Actions
import { BasicUser } from "@/actions/schemas";

// Components
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { FormField, FormStack } from "@/components/form";

// Composition
import PresentationsField from "@/app/thursdays/composition/forms/PresentationsField";

// Helpers
import { Controller, useFormState } from "react-hook-form";
import { isStaffRole } from "@/constants/roles";
import { formatSemesterCode, getCurrentSemesterCode, normalizeSemesterCode } from "@/components/domain/filters/semester-filter";

const LOCATIONS = [
  { label: "Pozen Center", value: "Pozen Center" },
  { label: "Studio A", value: "Studio A" },
  { label: "Studio B", value: "Studio B" },
  { label: "Main Hall", value: "Main Hall" },
  { label: "N181", value: "N181" },
  { label: "North Sound", value: "North Sound" },
  { label: "DMC Sound", value: "DMC Sound" },
  { label: "Green Room", value: "Green Room" },
  { label: "Godine Gallery", value: "Godine Gallery" },
  { label: "Other", value: "Other" },
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
  suggestedTags?: string[];
  suggestedProductionTags?: string[];
  onRemoveTagSuggestion?: (kind: "production" | "presentation", tag: string) => Promise<void>;
}

export default function ProductionForm({
  productionIndex,
  control,
  users,
  semesters = [],
  suggestedTags = [],
  suggestedProductionTags = [],
  onRemoveTagSuggestion,
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
    <FormStack className="w-full">
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 min-[601px]:grid-cols-2">
          <Controller
            control={control}
            name={`productions.${productionIndex}.name`}
            rules={{ required: "Production name is required" }}
            render={({ field, fieldState }) => {
              const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
              return (
                <FormField label="Name" required htmlFor={field.name} error={showError ? fieldState.error?.message : undefined}>
                  <Input
                    id={field.name}
                    variant="modal"
                    {...field}
                    placeholder="Enter production name"
                    status={showError ? "error" : ""}
                  />
                </FormField>
              );
            }}
          />
          <Controller
            control={control}
            name={`productions.${productionIndex}.location`}
            rules={{ required: "Location is required" }}
            render={({ field, fieldState }) => {
              const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
              return (
                <FormField label="Location" required error={showError ? fieldState.error?.message : undefined}>
                  <Select
                    inModal
                    {...field}
                    placeholder="Select location"
                    options={LOCATIONS}
                    status={showError ? "error" : ""}
                  />
                </FormField>
              );
            }}
          />
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
                      variant="button"
                      className="w-[6rem]!"
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

      <FormField label="Tags">
        <Controller
          control={control}
          name={`productions.${productionIndex}.tags`}
          render={({ field }) => (
            <Select
              inModal
              mode="tags"
              value={field.value ?? []}
              onChange={field.onChange}
              suggestedOptions={suggestedProductionTags.map((tag) => ({ value: tag, label: tag }))}
              suggestedLabel="Suggested"
              onRemoveSuggestion={onRemoveTagSuggestion ? (tag) => onRemoveTagSuggestion("production", tag) : undefined}
              placeholder="Type a tag and press Enter..."
            />
          )}
        />
      </FormField>

      <PresentationsField
        productionIndex={productionIndex}
        control={control}
        users={users}
        semesters={semesters}
        suggestedTags={suggestedTags}
        onRemoveTagSuggestion={onRemoveTagSuggestion}
      />
    </FormStack>
  );
}
