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
import ProductionForm from "@/app/thursdays/composition/ProductionForm";
import {
  collapseBodyClassName,
  collapseHeaderClassName,
  collapseIconClassName,
  collapseItemClassName,
  collapseLabelClassName,
  collapseMetaClassName,
  collapseTitleTextClassName,
  collapseTriggerPaddingClassName,
  iconButtonClassName,
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
  const thursdayDate = useWatch({ control, name: "date" });

  const formattedDate = thursdayDate
    ? new Date(thursdayDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

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
        <span className="ui-label m-0 block">Productions</span>
        <Button
          type="button"
          variant="action"
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
        <p className="my-6 text-center text-sm leading-normal text-[var(--app-label)] italic">
          No productions yet.
        </p>
      ) : (
        <Collapse
          defaultValue={fields.map((f: any) => f.id)}
          items={fields.map((field: any, pIndex) => {
            const name = watchProductions?.[pIndex]?.name;
            const displayName = name || `Unnamed Production ${pIndex + 1}`;
            const trigger = (
              <span className={collapseLabelClassName}>
                {/* Rotation reads the trigger's own data-state — Radix sets
                    data-state="open"/"closed" on it directly. */}
                <span className={collapseIconClassName} aria-hidden="true" />
                <span className={collapseTitleTextClassName}>{displayName}</span>
                {formattedDate && <span className={collapseMetaClassName}>{formattedDate}</span>}
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
        title="Remove Production"
        dialogClassName={confirmDeleteDialogClassName}
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
