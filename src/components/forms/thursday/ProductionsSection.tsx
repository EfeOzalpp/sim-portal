"use client";

import { useState } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { Empty } from "antd";
import { Button, Collapse } from "@/components/ui/AntD";
import ProductionForm from "@/components/forms/thursday/ProductionForm";
import { BasicUser } from "@/components/forms/schemas";
import ConfirmDelete from "@/components/ui/ConfirmDelete";
import ModalPopup from "@/components/ui/ModalPopup";
import confirmDeleteStyles from "@/components/ui/ConfirmDelete/ConfirmDelete.module.css";
import {
  collapseBodyClassName,
  collapseHeaderClassName,
  collapseIconClassName,
  collapseItemClassName,
  collapseLabelClassName,
  collapseMetaClassName,
  collapseRootClassName,
  collapseTitleClassName,
  collapseTitleTextClassName,
  iconButtonClassName,
  sectionHeaderClassName,
} from "@/components/forms/thursday/thursdayFormClasses";

interface ProductionsSectionProps {
  control: any;
  users: BasicUser[];
}

export default function ProductionsSection({
  control,
  users,
}: ProductionsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "productions",
  });

  const watchProductions = useWatch({ control, name: "productions" });
  const thursdayDate = useWatch({ control, name: "date" });

  const formattedDate = thursdayDate
    ? new Date(thursdayDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  return (
    <div>
      <div className={sectionHeaderClassName}>
        <span className="ui-label m-0 block">Productions</span>
        <Button
          htmlType="button"
          className="action-button"
          onClick={() =>
            append({
              name: "",
              location: "Pozen Center",
              producers: [],
              presentations: [],
            })
          }
        >
          Add Production
        </Button>
      </div>

      {fields.length === 0 ? (
        <Empty
          className="py-[var(--spacing-lg)] text-[var(--app-muted)]"
          classNames={{
            description: "text-[var(--app-muted)]",
            image:
              "[&_svg]:fill-[var(--app-muted)]! [&_svg]:stroke-[var(--app-border)]! [&_.ant-empty-img-simple-ellipse]:fill-[var(--app-muted)]! [&_.ant-empty-img-simple-ellipse]:stroke-[var(--app-border)]! [&_.ant-empty-img-simple-g]:fill-[var(--app-muted)]! [&_.ant-empty-img-simple-g]:stroke-[var(--app-border)]! [&_.ant-empty-img-simple-path]:fill-[var(--app-muted)]! [&_.ant-empty-img-simple-path]:stroke-[var(--app-border)]!",
          }}
          description="No productions yet."
        />
      ) : (
        <Collapse
          className={collapseRootClassName}
          classNames={{
            header: collapseHeaderClassName,
            title: collapseTitleClassName,
            body: collapseBodyClassName,
            icon: collapseIconClassName,
          }}
          defaultActiveKey={fields.map((f: any) => f.id)}
          expandIcon={({ isActive }) => (
            <span
              className={`inline-flex h-[var(--svg-size-md)] w-[var(--svg-size-md)] items-center justify-center text-[var(--app-text)] ${isActive ? "rotate-180" : "rotate-0"}`}
              aria-hidden="true"
            >
              <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15.4L6 9.4L7.4 8L12 12.6L16.6 8L18 9.4L12 15.4Z" fill="currentColor" />
              </svg>
            </span>
          )}
          items={fields.map((field: any, pIndex) => {
            const name = watchProductions?.[pIndex]?.name;
            const displayName = name || `Unnamed Production ${pIndex + 1}`;
            const label = (
              <span className={collapseLabelClassName}>
                <span className={collapseTitleTextClassName}>{displayName}</span>
                {formattedDate && <span className={collapseMetaClassName}>{formattedDate}</span>}
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
                  aria-label="Remove production"
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
                <ProductionForm
                  productionIndex={pIndex}
                  control={control}
                  users={users}
                />
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
        title="Remove Production"
        dialogClassName={confirmDeleteStyles.dialog}
      >
        <ConfirmDelete
          itemName="this production"
          itemType="production"
          confirmLabel="Remove Production"
          pendingLabel="Removing..."
          errorMessage="Could not remove the production."
          onConfirm={() => {
            if (pendingRemoveIndex !== null) remove(pendingRemoveIndex);
          }}
          onConfirmed={() => setPendingRemoveIndex(null)}
        />
      </ModalPopup>
    </div>
  );
}
