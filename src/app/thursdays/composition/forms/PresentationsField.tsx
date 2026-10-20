"use client";

// React & Next.js
import { useEffect, useMemo, useRef, useState } from "react";

// Actions
import { BasicUser } from "@/actions/schemas";

// Components
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Collapse } from "@/components/collapse";
import { Button } from "@/components/button";
import ConfirmDelete from "@/components/confirm-delete";
import ModalPopup from "@/components/modal";
import { FormField, FormStack } from "@/components/form";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";

// Composition
import {
  fieldLabelClassName,
  sectionHeaderClassName,
} from "@/app/thursdays/composition/forms/thursdayFormClasses";

// Helpers
import { Controller, useFieldArray, useFormState, useWatch } from "react-hook-form";
import { isStudentRole } from "@/constants/roles";
import { formatSemesterCode, getCurrentSemesterCode, normalizeSemesterCode } from "@/components/domain/filters/semester-filter";

// Sentinel for the semester filter's own "show everyone" option - distinct
// from ALL_SEMESTERS_VALUE (the page-level filter's sentinel), since this is
// a separate, local-only filter with no URL state of its own.
const ALL_SEMESTERS_FILTER_VALUE = "all";

interface PresentationsFieldProps {
  productionIndex: number;
  control: any;
  users: BasicUser[];
  semesters?: Array<{ id: string; name: string }>;
  suggestedTags?: string[];
  onRemoveTagSuggestion?: (kind: "production" | "presentation", tag: string) => Promise<void>;
}

export default function PresentationsField({
  productionIndex,
  control,
  users,
  semesters = [],
  suggestedTags = [],
  onRemoveTagSuggestion,
}: PresentationsFieldProps) {
  const { fields, prepend, remove } = useFieldArray({
    control,
    name: `productions.${productionIndex}.presentations`,
  });

  const watchPresentations = useWatch({
    control,
    name: `productions.${productionIndex}.presentations`,
  });

  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);
  const [openPresentationIds, setOpenPresentationIds] = useState<string[]>([]);
  const previousFieldCount = useRef(fields.length);
  const studentUsers = users.filter((u) => isStudentRole((u as any).role));
  const suggestedTagOptions = useMemo(
    () => suggestedTags.map((tag) => ({ value: tag, label: tag })),
    [suggestedTags],
  );

  useEffect(() => {
    if (fields.length > previousFieldCount.current) {
      const addedField = fields[0];
      if (addedField) {
        setOpenPresentationIds((current) =>
          current.includes(addedField.id) ? current : [...current, addedField.id],
        );
      }
    }

    previousFieldCount.current = fields.length;
  }, [fields]);

  // Narrows which people show up as Presenters candidates to just this
  // semester's members - defaults to whichever semester matches today (same
  // rule as the page-level filters), same as usual.
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
    <div>
      <div className={sectionHeaderClassName}>
        <span className={fieldLabelClassName}>Presentations</span>
        <Button
          surface="modal"
          variant="tool"
          size="small"
          icon="add/add.svg"
          type="button"
          aria-label="Add presentation"
          onClick={() =>
            prepend({
              name: "",
              presenters: [],
              tags: [],
            })
          }
        />
      </div>

      {fields.length === 0 ? (
        <p className="ui-note my-6 text-center">
          No presentations yet.
        </p>
      ) : (
        <Collapse
          variant="modal"
          depth={3}
          value={openPresentationIds}
          onValueChange={setOpenPresentationIds}
          items={fields.map((field: any, pIndex) => {
            const name = watchPresentations?.[pIndex]?.name?.trim();
            const trigger = (
              <span style={!name ? { color: "var(--content-muted)" } : undefined}>
                {name || "Unnamed Presentation"}
              </span>
            );

            return {
              value: field.id,
              trigger,
              extra: (
                <Button
                  surface="modal"
                  variant="tool"
                  size="small"
                  tone="danger"
                  icon="delete/delete.svg"
                  type="button"
                  aria-label="Remove presentation"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingRemoveIndex(pIndex);
                  }}
                />
              ),
              content: (
                <FormStack spacing="compact" className="w-full">
                    <Controller
                      control={control}
                      name={`productions.${productionIndex}.presentations.${pIndex}.name`}
                      rules={{ required: "Presentation name is required" }}
                      render={({ field, fieldState }) => {
                        const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
                        return (
                          <FormField label="Name" required htmlFor={field.name} error={showError ? fieldState.error?.message : undefined}>
                            <Input
                              id={field.name}
                              variant="modal"
                              {...field}
                              placeholder="Enter presentation name"
                              status={showError ? "error" : ""}
                            />
                          </FormField>
                        );
                      }}
                    />

                  <div>
                    <Controller
                      control={control}
                      name={`productions.${productionIndex}.presentations.${pIndex}.presenters`}
                      render={({ field }) => {
                        const selectedIds = new Set<string>(field.value ?? []);
                        // Only scopes "Select all" - the dropdown itself
                        // always lists every studentUser (below), so
                        // unselecting someone outside the reference semester
                        // flips their row to "Unselected" instead of
                        // yanking it out of the list, which read as broken
                        // (looked like unselecting = removed).
                        const filteredStudentUsers = studentUsers.filter(
                          (u) =>
                            selectedIds.has(u.id) ||
                            !semesterFilterId ||
                            (u.semesterIds ?? []).includes(semesterFilterId),
                        );

                        return (
                          <Select
                            inModal
                            mode="filterableMultiselect"
                            label="Presenters"
                            {...field}
                            searchable
                            maxTagCount={12}
                            placeholder="Search and select presenters..."
                            selectAllValues={filteredStudentUsers.map((u) => u.id)}
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
                              ...studentUsers,
                              ...users.filter(
                                (u) => selectedIds.has(u.id) && !isStudentRole((u as any).role)
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
                      name={`productions.${productionIndex}.presentations.${pIndex}.tags`}
                      render={({ field }) => (
                        <Select
                          inModal
                          mode="tags"
                          value={field.value ?? []}
                          onChange={field.onChange}
                          suggestedOptions={suggestedTagOptions}
                          suggestedLabel="Suggested"
                          onRemoveSuggestion={onRemoveTagSuggestion ? (tag) => onRemoveTagSuggestion("presentation", tag) : undefined}
                          placeholder="Type a tag and press Enter..."
                        />
                      )}
                    />
                  </FormField>
                </FormStack>
              ),
            };
          })}
        />
      )}
      <ModalPopup
        open={pendingRemoveIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoveIndex(null);
        }}
        title="Remove presentation"
        dialogClassName={confirmDeleteDialogClassName}
        minimalHeader
      >
        <ConfirmDelete
          deferred
          itemName="this presentation"
          itemType="presentation"
          confirmLabel="Remove presentation"
          pendingLabel="Removing..."
          errorMessage="Could not remove the presentation."
          onConfirm={() => {
            if (pendingRemoveIndex !== null) remove(pendingRemoveIndex);
          }}
          onConfirmed={() => setPendingRemoveIndex(null)}
        />
      </ModalPopup>
    </div>
  );
}
