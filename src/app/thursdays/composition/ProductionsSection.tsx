"use client";

// React & Next.js
import { useEffect, useRef, useState } from "react";

// Actions
import { BasicUser } from "@/actions/schemas";

// Components
import { Collapse } from "@/components/collapse";
import ConfirmDelete from "@/components/confirm-delete";
import ModalPopup from "@/components/modal";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";
import { MaskIcon } from "@/theme/MaskIcon";

// Composition
import ProductionForm from "@/app/thursdays/composition/ProductionForm";
import {
  addIconButtonClassName,
  addIconClassName,
  collapseIconClassName,
  collapseLabelClassName,
  collapseTitleTextClassName,
  collapseTriggerPaddingClassName,
  deleteIconButtonClassName,
  deleteIconClassName,
  fieldLabelClassName,
  productionBodyClassName,
  productionHeaderClassName,
  productionItemClassName,
  sectionHeaderClassName,
} from "@/app/thursdays/composition/thursdayFormClasses";

// Helpers
import { useFieldArray, useWatch } from "react-hook-form";

interface ProductionsSectionProps {
  control: any;
  users: BasicUser[];
  semesters?: Array<{ id: string; name: string }>;
}

export default function ProductionsSection({
  control,
  users,
  semesters,
}: ProductionsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "productions",
  });

  const watchProductions = useWatch({ control, name: "productions" });

  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  // A brand-new Thursday (add form, nothing to load) starts with zero
  // productions - seed one so there's already something to fill in instead
  // of making Add Production the first required click. Appending after
  // mount (not as part of useForm's defaultValues) means it lands outside
  // Collapse's own defaultValue snapshot, so it starts collapsed rather than
  // forced open like a genuinely pre-existing (edit-mode) production would.
  //
  // hasSeededProduction (not just checking fields.length again) - StrictMode
  // runs this effect, its cleanup, then this effect again, all before the
  // append from the first run has actually re-rendered - so fields.length
  // would still read 0 on that second pass and append a second production.
  // The ref survives that whole cycle, so it correctly blocks the repeat.
  const hasSeededProduction = useRef(false);
  useEffect(() => {
    if (!hasSeededProduction.current && fields.length === 0) {
      hasSeededProduction.current = true;
      append({ name: "", location: "Pozen Center", producers: [], presentations: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className={sectionHeaderClassName}>
        <span className={fieldLabelClassName}>Productions</span>
        <button
          type="button"
          className={addIconButtonClassName}
          aria-label="Add production"
          onClick={() =>
            append({
              name: "",
              location: "Pozen Center",
              producers: [],
              presentations: [],
            })
          }
        >
          <MaskIcon icon="add/add.svg" className={addIconClassName} />
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="ui-note my-6 text-center">
          No productions yet.
        </p>
      ) : (
        <Collapse
          defaultValue={fields.map((f: any) => f.id)}
          items={fields.map((field: any, pIndex) => {
            const name = watchProductions?.[pIndex]?.name;
            const trigger = (
              <span className={collapseLabelClassName}>
                {/* Rotation reads the trigger's own data-state — Radix sets
                    data-state="open"/"closed" on it directly. */}
                <span className={collapseIconClassName} aria-hidden="true" />
                <span className={collapseTitleTextClassName}>{name}</span>
              </span>
            );

            return {
              value: field.id,
              itemClassName: `${productionItemClassName}${pIndex > 0 ? " mt-2" : ""}`,
              headerClassName: productionHeaderClassName,
              triggerClassName: collapseTriggerPaddingClassName,
              contentClassName: productionBodyClassName,
              trigger,
              extra: (
                <button
                  type="button"
                  className={`${deleteIconButtonClassName} self-center mr-4`}
                  aria-label="Remove production"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingRemoveIndex(pIndex);
                  }}
                >
                  <MaskIcon icon="delete/delete.svg" className={deleteIconClassName} />
                </button>
              ),
              content: (
                <ProductionForm
                  productionIndex={pIndex}
                  control={control}
                  users={users}
                  semesters={semesters}
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
        title="Remove production"
        dialogClassName={confirmDeleteDialogClassName}
      >
        <ConfirmDelete
          itemName="this production"
          itemType="production"
          confirmLabel="Remove production"
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
