"use client";

// React & Next.js
import { useEffect, useRef, useState } from "react";

// Actions
import { BasicUser } from "@/actions/schemas";

// Components
import { Collapse } from "@/components/collapse";
import { Button } from "@/components/button";
import ConfirmDelete from "@/components/confirm-delete";
import ModalPopup from "@/components/modal";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";

// Composition
import ProductionForm from "@/app/thursdays/composition/forms/ProductionForm";
import {
  fieldLabelClassName,
  sectionHeaderClassName,
} from "@/app/thursdays/composition/forms/thursdayFormClasses";

// Helpers
import { useFieldArray, useWatch } from "react-hook-form";

interface ProductionsSectionProps {
  control: any;
  users: BasicUser[];
  semesters?: Array<{ id: string; name: string }>;
  suggestedTags?: string[];
}

export default function ProductionsSection({
  control,
  users,
  semesters,
  suggestedTags = [],
}: ProductionsSectionProps) {
  const { fields, prepend, remove } = useFieldArray({
    control,
    name: "productions",
  });

  const watchProductions = useWatch({ control, name: "productions" });

  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  // A brand-new Thursday (add form, nothing to load) starts with zero
  // productions - seed one so there's already something to fill in instead
  // of making Add Production the first required click. Adding after
  // mount (not as part of useForm's defaultValues) means it lands outside
  // Collapse's own defaultValue snapshot, so it starts collapsed rather than
  // forced open like a genuinely pre-existing (edit-mode) production would.
  //
  // hasSeededProduction (not just checking fields.length again) - StrictMode
  // runs this effect, its cleanup, then this effect again, all before the
  // insertion from the first run has actually re-rendered - so fields.length
  // would still read 0 on that second pass and append a second production.
  // The ref survives that whole cycle, so it correctly blocks the repeat.
  const hasSeededProduction = useRef(false);
  useEffect(() => {
    if (!hasSeededProduction.current && fields.length === 0) {
      hasSeededProduction.current = true;
      prepend({ name: "", location: "Pozen Center", producers: [], presentations: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className={sectionHeaderClassName}>
        <span className={fieldLabelClassName}>Productions</span>
        <Button
          surface="modal"
          variant="tool"
          size="small"
          icon="add/add.svg"
          type="button"
          aria-label="Add production"
          onClick={() =>
            prepend({
              name: "",
              location: "Pozen Center",
              producers: [],
              presentations: [],
            })
          }
        />
      </div>

      {fields.length === 0 ? (
        <p className="ui-note my-6 text-center">
          No productions yet.
        </p>
      ) : (
        <Collapse
          variant="modal"
          depth={2}
          defaultValue={fields.map((f: any) => f.id)}
          items={fields.map((field: any, pIndex) => {
            const name = watchProductions?.[pIndex]?.name?.trim();
            const trigger = (
              <span style={!name ? { color: "var(--content-muted)" } : undefined}>
                {name || "Unnamed Production"}
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
                  aria-label="Remove production"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingRemoveIndex(pIndex);
                  }}
                />
              ),
              content: (
                <ProductionForm
                  productionIndex={pIndex}
                  control={control}
                  users={users}
                  semesters={semesters}
                  suggestedTags={suggestedTags}
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
        minimalHeader
      >
        <ConfirmDelete
          deferred
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
