"use client";

// React & Next.js
import { useState } from "react";

// Actions
import { BasicUser } from "@/actions/schemas";

// Components
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Collapse } from "@/components/collapse";
import { Button } from "@/components/button";
import ConfirmDelete from "@/components/confirm-delete";
import ModalPopup from "@/components/modal";
import { FieldError } from "@/components/field-error";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";

// Composition
import {
  collapseBodyClassName,
  collapseHeaderClassName,
  collapseIconClassName,
  collapseItemClassName,
  collapseLabelClassName,
  collapseTitleTextClassName,
  collapseTriggerPaddingClassName,
  fieldStackClassName,
  iconButtonClassName,
  inlineActionsClassName,
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
        <span className="ui-label m-0 block">Presentations</span>
        <Button
          type="button"
          variant="action"
          onClick={() =>
            append({
              name: "",
              presenters: [],
            })
          }
        >
          Add Presentation
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="my-6 text-center text-sm leading-normal text-[var(--app-label)] italic">
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
                <span className={collapseTitleTextClassName}>
                  {name ? `Presentation ${pIndex + 1}: ${name}` : `Unnamed Presentation ${pIndex + 1}`}
                </span>
              </span>
            );

            return {
              value: field.id,
              itemClassName: `${collapseItemClassName}${pIndex > 0 ? " mt-2" : ""}`,
              headerClassName: collapseHeaderClassName,
              triggerClassName: collapseTriggerPaddingClassName,
              contentClassName: collapseBodyClassName,
              trigger,
              extra: (
                <button
                  type="button"
                  className={`${iconButtonClassName} self-center mr-4`}
                  aria-label="Remove presentation"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingRemoveIndex(pIndex);
                  }}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              ),
              content: (
                <div className="flex w-full flex-col gap-4">
                  <div className={fieldStackClassName}>
                    <span className="ui-label m-0 block">Name *</span>
                    <Controller
                      control={control}
                      name={`productions.${productionIndex}.presentations.${pIndex}.name`}
                      rules={{ required: "Presentation name is required" }}
                      render={({ field, fieldState }) => {
                        const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
                        return (
                          <>
                            <Input
                              {...field}
                              placeholder="Enter presentation name"
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
                          <>
                            <div className={sectionHeaderClassName}>
                              <span className="ui-label m-0 block">Presenters</span>
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
                                  onClick={() => field.onChange(filteredStudentUsers.map((u) => u.id))}
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
                              placeholder="Search and select presenters..."
                              options={[
                                ...studentUsers,
                                ...users.filter(
                                  (u) => selectedIds.has(u.id) && !isStudentRole((u as any).role)
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
        title="Remove Presentation"
        dialogClassName={confirmDeleteDialogClassName}
      >
        <ConfirmDelete
          itemName="this presentation"
          itemType="presentation"
          confirmLabel="Remove Presentation"
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
