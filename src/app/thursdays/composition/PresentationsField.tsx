"use client";

// React & Next.js
import { useState } from "react";

// Actions
import { BasicUser } from "@/actions/schemas";

// Components
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Collapse } from "@/components/collapse";
import ConfirmDelete from "@/components/confirm-delete";
import ModalPopup from "@/components/modal";
import { FieldError, fieldLabelRowClassName } from "@/components/field-error";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";
import { MaskIcon } from "@/theme/MaskIcon";

// Composition
import {
  addIconButtonClassName,
  addIconClassName,
  collapseIconClassName,
  collapseLabelClassName,
  collapseTriggerPaddingClassName,
  deleteIconButtonClassName,
  deleteIconClassName,
  fieldLabelClassName,
  fieldStackClassName,
  presentationBodyClassName,
  presentationHeaderClassName,
  presentationItemClassName,
  presentationTitleTextClassName,
  sectionHeaderClassName,
} from "@/app/thursdays/composition/thursdayFormClasses";

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
}

export default function PresentationsField({
  productionIndex,
  control,
  users,
  semesters = [],
}: PresentationsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `productions.${productionIndex}.presentations`,
  });

  const watchPresentations = useWatch({
    control,
    name: `productions.${productionIndex}.presentations`,
  });

  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);
  const studentUsers = users.filter((u) => isStudentRole((u as any).role));

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
        <button
          type="button"
          className={addIconButtonClassName}
          aria-label="Add presentation"
          onClick={() =>
            append({
              name: "",
              presenters: [],
              tags: [],
            })
          }
        >
          <MaskIcon icon="add/add.svg" className={addIconClassName} />
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="ui-note my-6 text-center">
          No presentations yet.
        </p>
      ) : (
        <Collapse
          items={fields.map((field: any, pIndex) => {
            const name = watchPresentations?.[pIndex]?.name;
            const trigger = (
              <span className={collapseLabelClassName}>
                {/* Rotation reads the trigger's own data-state — Radix sets
                    data-state="open"/"closed" on it directly, no isActive
                    render-prop needed. */}
                <span className={collapseIconClassName} aria-hidden="true" />
                <span className={presentationTitleTextClassName}>{name}</span>
              </span>
            );

            return {
              value: field.id,
              itemClassName: `${presentationItemClassName}${pIndex > 0 ? " mt-2" : ""}`,
              headerClassName: presentationHeaderClassName,
              triggerClassName: collapseTriggerPaddingClassName,
              contentClassName: presentationBodyClassName,
              trigger,
              extra: (
                <button
                  type="button"
                  className={`${deleteIconButtonClassName} self-center mr-4`}
                  aria-label="Remove presentation"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingRemoveIndex(pIndex);
                  }}
                >
                  <MaskIcon icon="delete/delete.svg" className={deleteIconClassName} />
                </button>
              ),
              content: (
                <div className="flex w-full flex-col gap-4">
                  <div className={fieldStackClassName}>
                    <Controller
                      control={control}
                      name={`productions.${productionIndex}.presentations.${pIndex}.name`}
                      rules={{ required: "Presentation name is required" }}
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
                              placeholder="Enter presentation name"
                              status={showError ? "error" : ""}
                            />
                          </>
                        );
                      }}
                    />
                  </div>

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

                  <div className={fieldStackClassName}>
                    <span className={fieldLabelClassName}>Tags</span>
                    <Controller
                      control={control}
                      name={`productions.${productionIndex}.presentations.${pIndex}.tags`}
                      render={({ field }) => (
                        <Select
                          mode="tags"
                          value={field.value ?? []}
                          onChange={field.onChange}
                          placeholder="Type a tag and press Enter..."
                        />
                      )}
                    />
                  </div>
                </div>
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
      >
        <ConfirmDelete
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
