"use client";

import { useState } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { Space } from "antd";
import {
  Input,
  Select,
  Collapse,
  Button,
} from "@/components/primitives/AntD";
import { BasicUser } from "@/components/forms/schemas";
import ConfirmDelete from "@/components/modals/ConfirmDelete";
import ModalPopup from "@/components/modals/ModalPopup";
import { confirmDeleteDialogClassName } from "@/components/modals/ConfirmDelete/styles";
import {
  collapseBodyClassName,
  collapseArrowVariants,
  collapseHeaderClassName,
  collapseIconClassName,
  collapseItemClassName,
  collapseLabelClassName,
  collapseRootClassName,
  collapseTitleClassName,
  collapseTitleTextClassName,
  fieldStackClassName,
  iconButtonClassName,
  inlineActionsClassName,
  optionBadgeVariants,
  optionNameClassName,
  optionRowClassName,
  sectionHeaderClassName,
  selectionButtonVariants,
} from "@/components/forms/thursday/thursdayFormClasses";

interface PresentationsFieldProps {
  productionIndex: number;
  control: any;
  users: BasicUser[];
}

export default function PresentationsField({
  productionIndex,
  control,
  users,
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
  const studentUsers = users.filter((u) => (u as any).role === "STUDENT");

  return (
    <div>
      <div className={sectionHeaderClassName}>
        <span className="ui-label m-0 block">Presentations</span>
        <Button
          htmlType="button"
          className="action-button"
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
        <p className="my-[var(--spacing-lg)] text-center text-[length:var(--font-size-sm)] leading-[var(--line-height-base)] text-[var(--app-muted)] italic">
          No presentations yet.
        </p>
      ) : (
        <Collapse
          className={collapseRootClassName}
          classNames={{
            header: collapseHeaderClassName,
            title: collapseTitleClassName,
            body: collapseBodyClassName,
            icon: collapseIconClassName,
          }}
          expandIcon={({ isActive }) => (
            <span
              className={collapseArrowVariants({ expanded: isActive })}
              aria-hidden="true"
            >
              <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15.4L6 9.4L7.4 8L12 12.6L16.6 8L18 9.4L12 15.4Z" fill="currentColor" />
              </svg>
            </span>
          )}
          items={fields.map((field: any, pIndex) => {
            const name = watchPresentations?.[pIndex]?.name;
            const label = (
              <span className={collapseLabelClassName}>
                <span className={collapseTitleTextClassName}>
                  {name ? `Presentation ${pIndex + 1}: ${name}` : `Unnamed Presentation ${pIndex + 1}`}
                </span>
              </span>
            );

            return {
              key: field.id,
              className: `${collapseItemClassName}${pIndex > 0 ? " mt-[var(--spacing-sm)]" : ""}`,
              style: { background: "var(--app-surface)", borderColor: "var(--app-border)" },
              styles: {
                header: { background: "var(--app-surface)", color: "var(--app-text)" },
                body: { background: "var(--app-surface)", color: "var(--app-text)" },
              },
              label,
              extra: (
                <button
                  type="button"
                  className={iconButtonClassName}
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
              children: (
                <Space orientation="vertical" style={{ width: "100%" }} size="middle">
                  <div className={fieldStackClassName}>
                    <span className="ui-label m-0 block">Presentation Name</span>
                    <Controller
                      control={control}
                      name={`productions.${productionIndex}.presentations.${pIndex}.name`}
                      rules={{ required: "Presentation name is required" }}
                      render={({ field, fieldState }) => (
                        <>
                          <Input
                            {...field}
                            placeholder="Enter presentation name"
                            status={fieldState.error ? "error" : ""}
                          />
                          {fieldState.error && (
                            <span className="ui-note">{fieldState.error.message}</span>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div>
                    <Controller
                      control={control}
                      name={`productions.${productionIndex}.presentations.${pIndex}.presenters`}
                      render={({ field }) => (
                        <>
                          <div className={sectionHeaderClassName}>
                            <span className="ui-label m-0 block">Presenters</span>
                            <div className={inlineActionsClassName}>
                              <button
                                type="button"
                                onClick={() => field.onChange(studentUsers.map((u) => u.id))}
                                className={selectionButtonVariants()}
                              >
                                Select all
                              </button>
                              <button
                                type="button"
                                onClick={() => field.onChange([])}
                                className={selectionButtonVariants({ intent: "danger" })}
                              >
                                Unselect all
                              </button>
                            </div>
                          </div>
                          <Select
                            {...field}
                            mode="multiple"
                            showSearch
                            maxTagCount={12}
                            maxTagPlaceholder={(omitted) => `+${omitted.length} more users`}
                            placeholder="Search and select presenters..."
                            style={{ width: "100%" }}
                            filterOption={(input, option) =>
                              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                            options={[
                              ...studentUsers,
                              ...users.filter(
                                (u) => (field.value ?? []).includes(u.id) && (u as any).role !== "STUDENT"
                              ),
                            ]
                              .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
                              .map((u) => ({ value: u.id, label: u.name ?? "Unnamed User" }))}
                            optionRender={(option) => {
                              const isSelected = (field.value ?? []).includes(option.value as string);
                              return (
                                <div className={optionRowClassName}>
                                  <span className={optionBadgeVariants({ selected: isSelected })}>
                                    {isSelected ? "Selected" : "Unselected"}
                                  </span>
                                  <span className={optionNameClassName}>{option.label}</span>
                                </div>
                              );
                            }}
                          />
                        </>
                      )}
                    />
                  </div>
                </Space>
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
